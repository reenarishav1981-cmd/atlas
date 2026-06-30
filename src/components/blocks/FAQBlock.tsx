"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  title?: string;
  items?: FAQItem[];
}

export default function FAQBlock({
  title = "Frequently Asked Questions",
  items = [],
}: FAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {title && (
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-center text-[#0A0A09] mb-8">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-[#E8E6E1] rounded-2xl overflow-hidden bg-white hover:border-[#C4973A]/50 transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-[#0A0A09]"
              >
                {item.question}
                {isOpen ? (
                  <Minus size={16} className="text-[#C4973A] flex-shrink-0 ml-4" />
                ) : (
                  <Plus size={16} className="text-[#C4973A] flex-shrink-0 ml-4" />
                )}
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-96 border-t border-[#F4F3F0]" : "max-h-0"
                }`}
              >
                <p className="p-5 text-xs sm:text-sm text-[#5a5a57] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">No FAQs defined.</p>
        )}
      </div>
    </div>
  );
}
