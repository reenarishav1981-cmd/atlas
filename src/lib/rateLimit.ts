import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback so local dev works without Redis configured.
const memoryStore = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.reset < now) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { success: false, remaining: 0 };
  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redisLimiters = hasRedis
  ? {
      auth: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 attempts / min
        prefix: "ratelimit:auth",
      }),
      api: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 req / min general API
        prefix: "ratelimit:api",
      }),
      checkout: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "ratelimit:checkout",
      }),
    }
  : null;

export async function rateLimit(
  identifier: string,
  bucket: "auth" | "api" | "checkout" = "api"
): Promise<{ success: boolean; remaining: number }> {
  if (redisLimiters) {
    const { success, remaining } = await redisLimiters[bucket].limit(identifier);
    return { success, remaining };
  }
  const config = { auth: [5, 60_000], api: [60, 60_000], checkout: [10, 60_000] } as const;
  const [limit, windowMs] = config[bucket];
  return memoryLimit(`${bucket}:${identifier}`, limit, windowMs);
}

/** Extract a stable client identifier (IP) from a Next.js request. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
