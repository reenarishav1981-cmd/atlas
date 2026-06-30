"use client";

import React from "react";

interface AnnouncementProps {
  text?: string;
  url?: string;
  bgColor?: string;
  textColor?: string;
}

export default function AnnouncementBlock({
  text = "Welcome to our store!",
  url,
  bgColor = "#0A0A09",
  textColor = "#FFFFFF",
}: AnnouncementProps) {
  const content = (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="w-full text-center py-2 px-4 text-xs font-medium tracking-wide flex items-center justify-center min-h-[36px]"
    >
      {text}
    </div>
  );

  if (url) {
    return (
      <a href={url} className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
