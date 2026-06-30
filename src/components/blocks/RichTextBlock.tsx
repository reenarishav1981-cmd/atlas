"use client";

import React from "react";

interface RichTextProps {
  title?: string;
  body?: string;
  align?: "left" | "center" | "right";
}

export default function RichTextBlock({
  title,
  body = "<h2>Add rich text body here</h2>",
  align = "center",
}: RichTextProps) {
  const alignmentMap = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right",
  };

  return (
    <div className={`max-w-3xl ${alignmentMap[align]} space-y-4`}>
      {title && (
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0A0A09]">
          {title}
        </h2>
      )}
      <div
        className="prose prose-stone max-w-none text-[#5a5a57] leading-relaxed text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
