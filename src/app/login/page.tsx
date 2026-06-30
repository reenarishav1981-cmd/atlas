"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    const redirectTo = params.get("redirect") || (data.user.role !== "CUSTOMER" ? "/admin" : "/");
    window.location.href = redirectTo;
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3F0] px-4">
      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-[#9E9B97] mb-6">Welcome back to ATLAS.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#E8E6E1] rounded-xl py-2.5 text-sm font-medium hover:bg-[#FAFAF9] transition-colors mb-6 text-[#0E0E0D]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.5-5.4 3.5-9.75z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.05-3.13c-1.12.75-2.55 1.2-3.91 1.2-3.02 0-5.58-2.04-6.49-4.8H1.31v3.23A11.99 11.99 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.51 14.36A7.16 7.16 0 0 1 5.1 12c0-.82.14-1.63.4-2.36V6.4H1.31A11.99 11.99 0 0 0 0 12c0 2.21.6 4.29 1.64 6.09l3.87-3.73z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.31 6.41l3.87 3.73c.91-2.76 3.47-4.8 6.49-4.8z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8E6E1]"></div></div>
          <span className="relative bg-white px-3 text-xs text-[#9E9B97] uppercase">Or credentials</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-medium text-[#6B6966] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-sm mb-4 outline-none focus:border-[#C4973A]"
          />

          <label className="block text-xs font-medium text-[#6B6966] mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-sm mb-6 outline-none focus:border-[#C4973A]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E0E0D] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#6B6966] mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-[#0E0E0D] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F4F3F0] text-sm text-[#9E9B97]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
