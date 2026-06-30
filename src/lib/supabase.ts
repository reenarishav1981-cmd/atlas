import { createClient } from "@supabase/supabase-js";

// Public client — safe for browser, respects RLS policies.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Service-role client — server-only, bypasses RLS. Only initialized on the server.
export const supabaseAdmin =
  typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
    : (null as any);

/** Upload a product image to the `product-images` storage bucket and return its public URL. */
export async function uploadProductImage(file: File, path: string) {
  const { error } = await supabaseAdmin.storage.from("product-images").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
