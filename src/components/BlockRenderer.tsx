"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { BlockInstance } from "@/lib/types/blocks";

// Lazy-load heavier components to optimize initial bundle size & Core Web Vitals
const LazyHeroBlock = dynamic(() => import("./blocks/HeroBlock"), { loading: () => <div className="h-64 bg-gray-50 animate-pulse" /> });
const LazyAnnouncementBlock = dynamic(() => import("./blocks/AnnouncementBlock"));
const LazyRichTextBlock = dynamic(() => import("./blocks/RichTextBlock"));
const LazyFAQBlock = dynamic(() => import("./blocks/FAQBlock"));
const LazyCountdownBlock = dynamic(() => import("./blocks/CountdownBlock"));
const LazyNewsletterBlock = dynamic(() => import("./blocks/NewsletterBlock"));
const LazyCustomHtmlBlock = dynamic(() => import("./blocks/CustomHtmlBlock"));

interface BlockRendererProps {
  blocks: BlockInstance[];
  previewMode?: boolean;
}

export default function BlockRenderer({ blocks, previewMode = false }: BlockRendererProps) {
  // Memoize validation filtering for active sections and display schedules
  const activeBlocks = useMemo(() => {
    const now = new Date();
    return blocks
      .filter((block) => {
        if (!block.isActive) return false;

        // Skip scheduling checks if in preview mode
        if (previewMode) return true;

        if (block.visibility) {
          const { scheduledStart, scheduledEnd } = block.visibility;
          if (scheduledStart && new Date(scheduledStart) > now) return false;
          if (scheduledEnd && new Date(scheduledEnd) < now) return false;
        }

        return true;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [blocks, previewMode]);

  const renderBlock = (block: BlockInstance) => {
    // Generate class list based on layout properties
    const classes = [
      block.layoutSettings?.paddingTop ?? "py-12",
      block.layoutSettings?.paddingBottom ?? "py-12",
      block.customCssClass ?? "",
    ].join(" ");

    const innerContainerClass = block.layoutSettings?.maxWidth === "container" 
      ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" 
      : "w-full";

    const contentProps = block.content;

    switch (block.type) {
      case "hero":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyHeroBlock {...contentProps} />
            </div>
          </div>
        );

      case "announcement":
        return <LazyAnnouncementBlock key={block.id} {...contentProps} />;

      case "rich-text":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyRichTextBlock {...contentProps} />
            </div>
          </div>
        );

      case "faq":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyFAQBlock {...contentProps} />
            </div>
          </div>
        );

      case "countdown":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyCountdownBlock {...contentProps} />
            </div>
          </div>
        );

      case "newsletter":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyNewsletterBlock {...contentProps} />
            </div>
          </div>
        );

      case "custom-html":
        return (
          <div key={block.id} className={classes}>
            <div className={innerContainerClass}>
              <LazyCustomHtmlBlock {...contentProps} />
            </div>
          </div>
        );

      case "divider":
        return (
          <div key={block.id} className={`max-w-7xl mx-auto px-4 ${block.customCssClass ?? ""}`}>
            <hr className={`${block.content.thickness ?? "border-t"} ${block.content.color ?? "border-[#E8E6E1]"}`} />
          </div>
        );

      case "spacer":
        return <div key={block.id} className={`${block.content.height ?? "h-8"} ${block.customCssClass ?? ""}`} />;

      default:
        return (
          <div key={block.id} className="p-4 bg-yellow-50 text-yellow-800 text-xs text-center">
            Unknown section type: {block.type}
          </div>
        );
    }
  };

  return <div className="w-full flex flex-col">{activeBlocks.map(renderBlock)}</div>;
}
