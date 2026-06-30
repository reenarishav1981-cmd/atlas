"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Minus,
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface Image {
  url: string;
}

interface Product {
  id: string;
  name: string;
  brand: { name: string } | null;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  sku: string;
  stock: number;
  slug: string;
  images: Image[];
  specs?: Record<string, string> | null;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.floor(rating)
              ? "fill-[#C4973A] text-[#C4973A]"
              : "fill-[#E8E6E1] text-[#E8E6E1]"
          }
        />
      ))}
    </div>
  );
}

export default function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(
    product.images[0]?.url ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&auto=format"
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "reviews">("details");

  // Load initial cart count
  useEffect(() => {
    fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : { count: undefined }))
      .then((data: any) => {
        if (data.count !== undefined) setCartCount(data.count);
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: quantity }),
      });

      setLoading(false);

      if (res.status === 401) {
        toast.error("Please login to add items to cart.");
        router.push(`/register?redirect=/products/${product.slug}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${product.name} added to cart!`);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);

      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : { count: undefined }))
        .then((data: any) => {
          if (data.count !== undefined) setCartCount(data.count);
        });
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    setBuyNowLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: quantity }),
      });

      if (res.status === 401) {
        toast.error("Please login to complete your purchase.");
        router.push(`/register?redirect=/products/${product.slug}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
        setBuyNowLoading(false);
        return;
      }

      // Automatically redirect to checkout!
      window.location.href = "/checkout";
    } catch (err) {
      setBuyNowLoading(false);
      toast.error("Something went wrong");
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <Navbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-[#9E9B97] mb-10">
          <Link href="/" className="hover:text-[#0E0E0D] transition-colors">
            Home
          </Link>
          <ChevronRight size={11} />
          <Link href="/products" className="hover:text-[#0E0E0D] transition-colors">
            Shop
          </Link>
          <ChevronRight size={11} />
          <span className="text-[#0E0E0D] truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden aspect-square border border-[#E8E6E1] shadow-sm flex items-center justify-center p-4">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain rounded-2xl max-h-[550px]"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-20 h-20 bg-white rounded-2xl border flex-none overflow-hidden p-1 shadow-xs transition-all ${
                      activeImage === img.url
                        ? "border-[#C4973A] ring-2 ring-[#C4973A]/20"
                        : "border-[#E8E6E1] hover:border-[#6B6966]"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="text-[11px] font-semibold text-[#C4973A] tracking-[0.2em] uppercase">
                {product.brand?.name || "ATLAS Luxury"}
              </div>
              <h1 className="font-['DM_Serif_Display'] text-4xl lg:text-[44px] text-[#0E0E0D] leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <Stars rating={product.rating} />
                <span className="text-xs text-[#9E9B97] font-medium">
                  {product.rating} · ({product.reviewCount} Reviews)
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-[#0E0E0D]">
                  ₹{(product.price / 100).toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-[#9E9B97] line-through">
                      ₹{(product.originalPrice / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock status indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.stock > 15
                      ? "bg-emerald-500"
                      : product.stock > 0
                      ? "bg-amber-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-[#6B6966]">
                  {product.stock > 15
                    ? "In Stock (Ready to dispatch)"
                    : product.stock > 0
                    ? `Only ${product.stock} left in stock!`
                    : "Temporarily Out of Stock"}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#6B6966] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Specifications — populated by admin in /admin → Products → Edit */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="border border-[#E8E6E1] rounded-2xl divide-y divide-[#F4F3F0] overflow-hidden">
                {Object.entries(product.specs as Record<string, string>).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <span className="text-[#9E9B97]">{key}</span>
                    <span className="text-[#0E0E0D] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Form */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Qty Selector */}
                  <div className="h-12 border border-[#E8E6E1] rounded-full px-4 flex items-center gap-6 bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-[#6B6966] hover:text-[#0E0E0D] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold text-[#0E0E0D] min-w-[12px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="text-[#6B6966] hover:text-[#0E0E0D] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={loading || isAdded || buyNowLoading}
                    className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm disabled:opacity-80 ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0E0E0D] text-white hover:bg-[#C4973A]"
                    }`}
                  >
                    <ShoppingBag size={15} />
                    {loading ? "Adding to Cart..." : isAdded ? "Added to Cart! ✓" : "Add to Cart"}
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={loading || buyNowLoading}
                  className="w-full h-12 bg-[#C4973A] text-white rounded-full flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#0E0E0D] transition-colors shadow-sm disabled:opacity-50 tracking-wider uppercase"
                >
                  <Sparkles size={15} />
                  {buyNowLoading ? "Processing Purchase..." : "Buy Now"}
                </button>
              </div>
            )}

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8E6E1]">
              <div className="text-center space-y-1">
                <Truck size={18} className="mx-auto text-[#C4973A]" />
                <div className="text-[10px] font-semibold text-[#0E0E0D]">Free Shipping</div>
                <div className="text-[9px] text-[#9E9B97]">On all orders above ₹999</div>
              </div>
              <div className="text-center space-y-1">
                <ShieldCheck size={18} className="mx-auto text-[#C4973A]" />
                <div className="text-[10px] font-semibold text-[#0E0E0D]">Authentic</div>
                <div className="text-[9px] text-[#9E9B97]">100% Brand Guarantee</div>
              </div>
              <div className="text-center space-y-1">
                <RotateCcw size={18} className="mx-auto text-[#C4973A]" />
                <div className="text-[10px] font-semibold text-[#0E0E0D]">14-Day Returns</div>
                <div className="text-[9px] text-[#9E9B97]">Easy size exchanges</div>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="border border-[#E8E6E1] bg-white rounded-3xl overflow-hidden shadow-xs">
              <div className="flex border-b border-[#E8E6E1]">
                {["details", "shipping", "reviews"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                      activeTab === t
                        ? "border-[#C4973A] text-[#0E0E0D] bg-[#FAFAF9]"
                        : "border-transparent text-[#9E9B97] hover:text-[#0E0E0D] bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6 text-xs text-[#6B6966] leading-relaxed">
                {activeTab === "details" && (
                  <ul className="space-y-2">
                    <li>
                      <strong className="text-[#0E0E0D]">SKU:</strong> {product.sku}
                    </li>
                    <li>
                      <strong className="text-[#0E0E0D]">Brand:</strong>{" "}
                      {product.brand?.name || "ATLAS Brand Partner"}
                    </li>
                    <li>
                      <strong className="text-[#0E0E0D]">Material:</strong> Premium Grade Materials
                    </li>
                    <li>
                      <strong className="text-[#0E0E0D]">Warranty:</strong> 1 Year Manufacturer Warranty
                    </li>
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <p>
                    All items are carefully packaged in custom ATLAS signature cases. Shipping times
                    average 3–5 business days via express courier network. Tracking links will be
                    bypassed to your email and account profile upon checkout closure.
                  </p>
                )}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F0]">
                      <div className="font-semibold text-[#0E0E0D]">Anonymous Verified Customer</div>
                      <Stars rating={5} size={10} />
                    </div>
                    <p className="italic">
                      "Absolutely beautiful design. The quality is exceptional and far exceeded my expectations."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
