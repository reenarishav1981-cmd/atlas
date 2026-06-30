"use client";

import React, { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function NewsletterBlock({
  title = "Subscribe to our newsletter",
  subtitle = "Get updates on new collections and special offers.",
  buttonText = "Subscribe",
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A09] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C4973A]/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
          <Mail size={22} className="text-[#C4973A]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {subscribed ? (
          <div className="flex flex-col items-center gap-2 pt-2 animate-fade-in">
            <CheckCircle size={32} className="text-emerald-500" />
            <span className="text-sm font-semibold">Thank you for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C4973A] transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-[#C4973A] text-[#0A0A09] hover:text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Subscribing…" : buttonText}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
