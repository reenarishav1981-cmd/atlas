"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
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
  products?: any[];
  categories?: any[];
}

export default function BlockRenderer({
  blocks,
  previewMode = false,
  products = [],
  categories = [],
}: BlockRendererProps) {
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

      case "editorial-banner":
        return <EditorialBannerBlock key={block.id} block={block} />;

      case "categories-grid": {
        const cats = categories.length > 0 ? categories : [
          { name: "Electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280", slug: "electronics" },
          { name: "Fashion", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=280", slug: "fashion" }
        ];
        return (
          <section key={block.id} className="py-12 bg-[#FAFAF9] border-t border-[#E8E6E1]">
            <div className="px-8 lg:px-16 mb-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#0E0E0D]">{block.content.title || "Shop by Category"}</h2>
            </div>
            <div className="flex gap-4 px-8 lg:px-16 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
              {cats.map((cat: any) => (
                <div key={cat.name} className="flex-none w-[200px] h-[270px] relative rounded-2xl overflow-hidden bg-[#F4F3F0]">
                  <img src={cat.imageUrl || cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white font-medium text-sm">{cat.name}</div>
                    <div className="text-white/60 text-[10px] mt-0.5">Explore &rarr;</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "products-grid": {
        const items = products.length > 0 ? products : [
          { id: "1", name: "Meridian Chronograph", brand: "Auros", price: 24999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200", slug: "meridian-chronograph" },
          { id: "2", name: "Vela Tote Bag", brand: "Maison Cleo", price: 8499, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200", slug: "vela-tote-bag" }
        ];
        const limitCount = Math.max(1, Number(block.content.limit || 4));
        return (
          <section key={block.id} className="py-12 bg-white border-t border-[#E8E6E1]">
            <div className="px-8 lg:px-16 mb-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#0E0E0D]">{block.content.title || "Trending Now"}</h2>
            </div>
            <div className="px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {items.slice(0, limitCount).map((product: any) => (
                <div key={product.id} className="group">
                  <div className="relative bg-[#F4F3F0] rounded-2xl overflow-hidden aspect-square mb-3">
                    <img src={product.image || product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[9px] text-[#9E9B97] font-medium uppercase tracking-wider mb-0.5">{product.brand || product.brand?.name || "ATLAS"}</div>
                  <div className="text-xs font-medium text-[#0E0E0D] truncate leading-snug">{product.name}</div>
                  <div className="text-xs font-semibold text-[#0E0E0D] mt-1">
                    ₹{((product.price || 0) / (product.price > 10000 ? 100 : 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "brand-story":
        return (
          <section key={block.id} className="py-16 bg-white text-center px-8 border-t border-[#E8E6E1]">
            <div className="max-w-2xl mx-auto">
              <div className="w-8 h-px bg-[#C4973A] mx-auto mb-8" />
              <blockquote className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#0E0E0D] leading-snug mb-6 italic">
                "{block.content.quote}"
              </blockquote>
              <p className="text-[#6B6966] text-xs leading-relaxed max-w-md mx-auto">
                {block.content.body}
              </p>
              <div className="w-8 h-px bg-[#C4973A] mx-auto mt-8" />
            </div>
          </section>
        );

      case "reviews": {
        const REVIEWS = [
          { name: "Priya S.", location: "Mumbai", text: "The quality exceeded every expectation. ATLAS curates with such precision.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60", product: "Meridian Chronograph" },
          { name: "Rahul M.", location: "Bangalore", text: "Seamless experience from browse to delivery. Genuinely premium.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60", product: "Studio Headphones MX7" }
        ];
        return (
          <section key={block.id} className="py-12 bg-[#FAFAF9] border-t border-[#E8E6E1]">
            <div className="px-8 lg:px-16 mb-8 text-center">
              <h2 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#0E0E0D]">{block.content.title || "What our customers say"}</h2>
            </div>
            <div className="px-8 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {REVIEWS.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E8E6E1]">
                  <p className="text-[#0E0E0D] text-xs leading-relaxed mb-4">"{r.text}"</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-[#F4F3F0]">
                    <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-medium text-[#0E0E0D]">{r.name}</div>
                      <div className="text-[9px] text-[#9E9B97]">{r.location} · {r.product}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "footer":
        return (
          <footer key={block.id} className="bg-[#0E0E0D] text-[#FAFAF9] border-t border-gray-800 py-12 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="font-['DM_Serif_Display'] text-xl text-white mb-2">{block.content.siteName || "ATLAS"}</div>
                <p className="text-[#6B6966] text-xs leading-relaxed max-w-sm">{block.content.description}</p>
              </div>
              <div className="text-[10px] text-[#6B6966] md:text-right">
                &copy; {new Date().getFullYear()} {block.content.siteName || "ATLAS"}. All rights reserved.
              </div>
            </div>
          </footer>
        );

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

function EditorialBannerBlock({ block }: { block: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="bg-[#0A0A09] overflow-hidden border-t border-[#E8E6E1]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[440px]">
          <div className="relative bg-[#0A0A09]">
            <img
              src={block.content.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"}
              alt={block.content.title}
              className="w-full h-full object-cover opacity-75"
            />
          </div>
          <div className="flex flex-col justify-center px-8 lg:px-20 py-12 text-left">
            <span className="text-[#C4973A] text-[10px] tracking-[0.2em] uppercase font-semibold mb-4">
              {block.content.badgeText || "The ATLAS Edit"}
            </span>
            <h2 className="font-['DM_Serif_Display'] text-2xl lg:text-[40px] text-white leading-tight mb-4">
              {block.content.title}
            </h2>
            <p className="text-[#9E9B97] text-xs leading-relaxed mb-6 max-w-sm">
              {block.content.description}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="self-start border border-[#C4973A] text-[#C4973A] px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#C4973A] hover:text-white transition-colors tracking-wider uppercase cursor-pointer"
            >
              {block.content.ctaText || "Read the Story"}
            </button>
          </div>
        </div>
      </section>

      {/* Premium overlay modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300">
          <div className="relative bg-[#0E0E0D] text-[#FAFAF9] border border-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
            {/* Split layout: Image Left */}
            <div className="w-full md:w-1/2 relative bg-black min-h-[250px] md:min-h-full">
              <img
                src={block.content.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"}
                alt="Brand story banner representation"
                className="w-full h-full object-cover opacity-80 absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0D] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0E0E0D]" />
            </div>

            {/* Split layout: Narrative Right */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <span className="text-[#C4973A] text-[9px] tracking-[0.25em] uppercase font-bold mb-3 block">
                {block.content.badgeText || "The ATLAS Edit"}
              </span>
              <h3 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-white mb-6 leading-tight">
                {block.content.title}
              </h3>
              
              <div className="space-y-4 text-gray-300 text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                <p>
                  We started ATLAS with a simple question: why has modern design lost its soul? In a world of mass production and planned obsolescence, we chose a different path. We chose materials that age beautifully, structural designs that endure, and partnerships with local master artisans.
                </p>
                <p>
                  Every piece in our collection represents weeks of meticulous planning, sourcing, and carving. Our woods are ethically salvaged, our metals hand-welded, and our fabrics woven on heritage looms. We do not chase trends. We build icons.
                </p>
                <p className="font-serif text-[#C4973A] italic">
                  Thank you for being part of our story. By inviting ATLAS into your space, you support a community of craftsmen who refuse to compromise.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-8 bg-white text-black px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#C4973A] hover:text-white transition-colors uppercase tracking-wider self-start cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
