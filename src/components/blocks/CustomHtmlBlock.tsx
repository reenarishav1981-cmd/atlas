"use client";

import React from "react";

interface CustomHtmlProps {
  html?: string;
}

export default function CustomHtmlBlock({ html = "<div class='p-4 text-center'>Custom Code</div>" }: CustomHtmlProps) {
  return (
    <div
      className="w-full overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
