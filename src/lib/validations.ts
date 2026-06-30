import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variant: z.string().max(80).optional(),
  qty: z.number().int().min(1).max(20).default(1),
});

export const updateCartSchema = z.object({
  itemId: z.string().cuid(),
  qty: z.number().int().min(0).max(20),
});

export const addressSchema = z.object({
  label: z.string().max(40).default("Home"),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  line1: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pin: z.string().trim().regex(/^[0-9]{4,8}$/),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().cuid().optional(),
  shippingName: z.string().trim().min(2).max(80),
  shippingPhone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  shippingAddress: z.string().trim().min(5).max(200),
  shippingCity: z.string().trim().min(2).max(80),
  shippingState: z.string().trim().min(2).max(80),
  shippingPin: z.string().trim().regex(/^[0-9]{4,8}$/),
  deliveryMethod: z.enum(["standard", "express", "same"]).default("standard"),
  paymentMethod: z.enum(["CARD", "UPI", "NETBANKING", "COD"]),
  couponCode: z.string().trim().max(40).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().trim().min(2),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().optional(),
  sku: z.string().trim().min(1).max(60),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().cuid().optional(),
  brandId: z.string().cuid().optional(),
  images: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).optional(), // e.g. { "Material": "Stainless Steel" }
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().int().min(0),
});

/** Helper: parse + return a typed result or a 400-shaped error object */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { ok: false as const, error: result.error.flatten() };
  }
  return { ok: true as const, data: result.data };
}
