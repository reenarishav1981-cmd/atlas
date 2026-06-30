import { z } from "zod";

// Base settings common to all blocks
export const BlockBaseSchema = z.object({
  id: z.string().cuid().or(z.string().uuid()).or(z.string()),
  type: z.string(),
  name: z.string().default("Section Block"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  customCssClass: z.string().optional().default(""),
  // Layout & Styling
  layoutSettings: z.object({
    paddingTop: z.string().default("py-12"),
    paddingBottom: z.string().default("py-12"),
    maxWidth: z.enum(["container", "full-width"]).default("container"),
    animate: z.boolean().default(true),
    theme: z.enum(["default", "light", "dark"]).default("default"),
  }).default({}),
  // Scheduling & Visibility
  visibility: z.object({
    scheduledStart: z.string().datetime().nullable().default(null),
    scheduledEnd: z.string().datetime().nullable().default(null),
    deviceVisibility: z.enum(["ALL", "DESKTOP", "MOBILE", "TABLET"]).default("ALL"),
    userSegmentId: z.string().nullable().default(null),
    abTestGroup: z.string().nullable().default(null),
  }).default({}),
});

// Specific block content validations
export const HeroBlockContentSchema = z.object({
  badgeText: z.string().max(80).optional().default(""),
  headingLine1: z.string().min(1).default("Heading Line 1"),
  headingLine2: z.string().optional().default(""),
  subtitle: z.string().max(400).optional().default(""),
  imageUrl: z.string().url().optional().default("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900"),
  ctaPrimaryText: z.string().max(40).optional().default("Explore"),
  ctaPrimaryUrl: z.string().default("/products"),
  ctaSecondaryText: z.string().max(40).optional().default(""),
  ctaSecondaryUrl: z.string().default("/"),
});

export const AnnouncementBlockContentSchema = z.object({
  text: z.string().min(1).default("Welcome to our store!"),
  url: z.string().optional().default(""),
  bgColor: z.string().default("#0A0A09"),
  textColor: z.string().default("#FFFFFF"),
});

export const RichTextBlockContentSchema = z.object({
  title: z.string().optional().default(""),
  body: z.string().default("<h2>Add rich text body here</h2>"),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const FAQItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const FAQBlockContentSchema = z.object({
  title: z.string().default("Frequently Asked Questions"),
  items: z.array(FAQItemSchema).default([]),
});

export const CountdownBlockContentSchema = z.object({
  title: z.string().default("Special Offer Ends In"),
  endTime: z.string().datetime(),
  bgColor: z.string().default("#F4F3F0"),
});

export const NewsletterBlockContentSchema = z.object({
  title: z.string().default("Subscribe to our newsletter"),
  subtitle: z.string().default("Get updates on new collections and special offers."),
  buttonText: z.string().default("Subscribe"),
});

export const CustomHtmlBlockContentSchema = z.object({
  html: z.string().default("<div class='p-4 text-center'>Custom Code</div>"),
});

export const DividerBlockContentSchema = z.object({
  thickness: z.string().default("border-t"),
  color: z.string().default("border-[#E8E6E1]"),
});

export const SpacerBlockContentSchema = z.object({
  height: z.enum(["h-4", "h-8", "h-12", "h-16", "h-24"]).default("h-8"),
});

// Registry maps matching type keys to sub-schemas
export const BlockSchemas: Record<string, z.ZodSchema<any>> = {
  hero: HeroBlockContentSchema,
  announcement: AnnouncementBlockContentSchema,
  "rich-text": RichTextBlockContentSchema,
  faq: FAQBlockContentSchema,
  countdown: CountdownBlockContentSchema,
  newsletter: NewsletterBlockContentSchema,
  "custom-html": CustomHtmlBlockContentSchema,
  divider: DividerBlockContentSchema,
  spacer: SpacerBlockContentSchema,
};

// Full block validation mapping
export const CompleteBlockSchema = BlockBaseSchema.extend({
  content: z.record(z.any()),
}).refine(
  (data) => {
    const subSchema = BlockSchemas[data.type];
    if (!subSchema) return true; // Generic block fallback
    const res = subSchema.safeParse(data.content);
    return res.success;
  },
  {
    message: "Invalid content payload configuration for the selected block type",
    path: ["content"],
  }
);

export type BlockInstance = z.infer<typeof CompleteBlockSchema>;
