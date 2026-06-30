"use client";

import Link from "next/link";
import { Smartphone, ChevronLeft } from "lucide-react";

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-8 font-['Inter',sans-serif]">
      <div className="text-center max-w-sm bg-white p-8 rounded-2xl border border-[#E8E6E1] shadow-sm">
        <Smartphone size={48} className="text-[#C4973A] mx-auto mb-4" />
        <h1 className="font-['DM_Serif_Display'] text-3xl text-[#0E0E0D] mb-3">Mobile View Mockup</h1>
        <p className="text-sm text-[#6B6966] mb-8">
          The mobile optimized mockup layout is active. Resize your browser window to test the fluid responsive layout.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#0E0E0D] font-medium border-b border-[#0E0E0D] pb-0.5 hover:text-[#C4973A] hover:border-[#C4973A] transition-colors">
          <ChevronLeft size={14} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}
