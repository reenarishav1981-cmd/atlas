"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface HeroBlockProps {
  badgeText?: string;
  headingLine1?: string;
  headingLine2?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaPrimaryText?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
}

export default function HeroBlock({
  badgeText = "Curated Collections",
  headingLine1 = "Commerce.",
  headingLine2 = "Redefined.",
  subtitle = "Experience authentic craftsmanship and tailored digital experiences, delivered with precision.",
  imageUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900",
  ctaPrimaryText = "Shop Collection",
  ctaPrimaryUrl = "/products",
  ctaSecondaryText,
  ctaSecondaryUrl = "/",
}: HeroBlockProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8">
      <div className="lg:col-span-6 space-y-6">
        {badgeText && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-[#C4973A] bg-[#C4973A]/10 uppercase">
            {badgeText}
          </span>
        )}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#0A0A09] leading-[1.1]">
          {headingLine1}
          {headingLine2 && (
            <span className="block italic font-serif text-[#C4973A] mt-1">
              {headingLine2}
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-[#5a5a57] leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4 pt-2">
          {ctaPrimaryText && (
            <a
              href={ctaPrimaryUrl}
              className="inline-flex items-center gap-2 bg-[#0A0A09] hover:bg-[#C4973A] text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-black/5"
            >
              {ctaPrimaryText}
              <ArrowRight size={16} />
            </a>
          )}
          {ctaSecondaryText && (
            <a
              href={ctaSecondaryUrl}
              className="inline-flex items-center bg-white hover:bg-gray-50 border border-gray-200 text-[#0A0A09] text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-300"
            >
              {ctaSecondaryText}
            </a>
          )}
        </div>
      </div>
      <div className="lg:col-span-6">
        <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
          <img
            src={imageUrl}
            alt="Hero Banner Illustration"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );
}
