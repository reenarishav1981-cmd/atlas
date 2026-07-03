"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Heart, ShoppingBag, User, X, ChevronDown, ChevronRight, ChevronLeft,
  Star, Play, ArrowRight, Check, Menu, ShoppingCart, Info
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BlockRenderer from "@/components/BlockRenderer";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  slug: string;
}

interface Category {
  name: string;
  slug: string;
  image: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Meridian Chronograph", brand: "Auros", price: 24999, originalPrice: 32000, rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format", badge: "Best Seller", slug: "meridian-chronograph" },
  { id: "2", name: "Vela Tote Bag", brand: "Maison Cleo", price: 8499, rating: 4.6, reviews: 89, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&auto=format", badge: null, slug: "vela-tote-bag" },
  { id: "3", name: "Cloud Runner Pro", brand: "Apex", price: 12999, originalPrice: 15000, rating: 4.7, reviews: 342, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format", badge: "Sale", slug: "cloud-runner-pro" },
  { id: "4", name: "Lumière Eau de Parfum", brand: "Maison Noir", price: 5499, rating: 4.9, reviews: 67, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&auto=format", badge: "New", slug: "lumiere-eau-de-parfum" },
  { id: "5", name: "Obsidian Frames", brand: "Veil Eyewear", price: 3299, rating: 4.5, reviews: 211, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&auto=format", badge: null, slug: "obsidian-frames" },
  { id: "6", name: "Studio Headphones MX7", brand: "Auris", price: 18999, originalPrice: 22000, rating: 4.8, reviews: 456, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format", badge: "Editor's Pick", slug: "studio-headphones-mx7" },
];

const FALLBACK_CATEGORIES: Category[] = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280&h=360&fit=crop&auto=format" },
  { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=280&h=360&fit=crop&auto=format" },
  { name: "Furniture", slug: "furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=280&h=360&fit=crop&auto=format" },
  { name: "Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=280&h=360&fit=crop&auto=format" },
  { name: "Beauty", slug: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=280&h=360&fit=crop&auto=format" },
  { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=280&h=360&fit=crop&auto=format" },
];

const REVIEWS = [
  { name: "Priya S.", location: "Mumbai", rating: 5, text: "The quality exceeded every expectation. ATLAS curates with such precision — this is the only platform I trust for premium purchases.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format", product: "Meridian Chronograph" },
  { name: "Rahul M.", location: "Bangalore", rating: 5, text: "Seamless experience from browse to delivery. The packaging alone signals that you're dealing with something different. Genuinely premium.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format", product: "Studio Headphones MX7" },
  { name: "Meera K.", location: "Delhi", rating: 5, text: "I've used every major platform and nothing comes close. The editorial curation, the interface, the service — ATLAS operates in a different category.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format", product: "Vela Tote Bag" },
];

const INSTAGRAM_PHOTOS = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=300&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=300&h=300&fit=crop&auto=format",
];

const BRAND_NAMES = ["Auros", "Maison Cleo", "Apex", "Maison Noir", "Veil Eyewear", "Auris", "Zephyr"];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= Math.floor(rating) ? "fill-[#C4973A] text-[#C4973A]" : "fill-[#E8E6E1] text-[#E8E6E1]"} />
      ))}
    </div>
  );
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HomePageClient({
  initialProducts,
  initialCategories,
  currentUser,
  siteSettings,
  initialBlocks = [],
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  currentUser?: UserProps | null;
  siteSettings?: {
    announcementEnabled: boolean;
    announcementText: string;
    heroBadgeText: string;
    heroHeadingLine1: string;
    heroHeadingLine2: string;
    heroSubtitle: string;
    heroImageUrl: string;
    heroCtaPrimaryText: string;
    heroCtaSecondaryText: string;
  } | null;
  initialBlocks?: any[];
}) {
  // Falls back to the original hardcoded copy if Settings hasn't been saved yet —
  // admin can override every line of this from /admin → Settings, no code change needed.
  const settings = siteSettings ?? {
    announcementEnabled: true,
    announcementText: "Free shipping on orders above ₹999 · New Collection Now Live",
    heroBadgeText: "Commerce, Redefined",
    heroHeadingLine1: "Commerce.",
    heroHeadingLine2: "Elevated.",
    heroSubtitle: "The platform for brands that refuse to compromise. Curated collections, authentic craftsmanship, delivered with precision.",
    heroImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&h=1080&fit=crop&auto=format",
    heroCtaPrimaryText: "Explore Collection",
    heroCtaSecondaryText: "Watch Film",
  };
  const router = useRouter();
  const [products] = useState<Product[]>(initialProducts.length ? initialProducts : FALLBACK_PRODUCTS);
  const [categories] = useState<Category[]>(initialCategories.length ? initialCategories : FALLBACK_CATEGORIES);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(settings.announcementEnabled);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const wishlistCount = wishlistedIds.length;

  // Sync scroll state for transparent-to-white navbar effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch initial cart count & wishlist on mount
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to load cart count", err);
      }
    }
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setWishlistedIds(data.items.map((item: any) => item.productId));
        }
      } catch (err) {}
    }
    fetchCart();
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (product: Product) => {
    const isFav = wishlistedIds.includes(product.id);
    try {
      const res = await fetch("/api/wishlist", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        toast.error("Please login to manage wishlist.");
        router.push(`/login?redirect=/`);
        return;
      }
      if (res.ok) {
        if (isFav) {
          setWishlistedIds(wishlistedIds.filter(id => id !== product.id));
          toast.success("Removed from wishlist");
        } else {
          setWishlistedIds([...wishlistedIds, product.id]);
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });

      if (res.status === 401) {
        toast.error("Please login to add items to cart.");
        router.push(`/login?redirect=/`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${product.name} added to cart!`);
      // Refresh cart count
      const cartRes = await fetch("/api/cart");
      if (cartRes.ok) {
        const data = await cartRes.json();
        setCartCount(data.count || 0);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const hasDynamicBlocks = initialBlocks && initialBlocks.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Announcement Bar & Hero / Dynamic Blocks */}
      {hasDynamicBlocks ? (
        <>
          <Navbar cartCount={cartCount} />
          <BlockRenderer blocks={initialBlocks} />
        </>
      ) : (
        <>
          {/* Announcement Bar */}
          {announcementVisible && (
            <div className="h-10 bg-[#0E0E0D] flex items-center justify-center relative px-12 z-50">
              <span className="text-white text-[11px] tracking-widest uppercase text-center">
                {settings.announcementText}
              </span>
              <button onClick={() => setAnnouncementVisible(false)} className="absolute right-5 text-white/40 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Navbar */}
          <Navbar cartCount={cartCount} />

          {/* Hero Section */}
          <section className="relative flex min-h-[80vh] overflow-hidden bg-white">
            <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-16 py-20 z-10">
              {currentUser ? (
                <span className="text-[11px] text-[#C4973A] font-semibold tracking-[0.18em] uppercase mb-6">
                  Welcome back, {currentUser.name}
                </span>
              ) : (
                <span className="text-[11px] text-[#C4973A] font-medium tracking-[0.18em] uppercase mb-6">
                  {settings.heroBadgeText}
                </span>
              )}
              <h1 className="font-['DM_Serif_Display'] text-[50px] lg:text-[78px] leading-[1.0] text-[#0E0E0D] mb-6">
                {settings.heroHeadingLine1}<br /><span className="italic">{settings.heroHeadingLine2}</span>
              </h1>
              <p className="text-[15px] lg:text-[17px] text-[#6B6966] max-w-md leading-relaxed mb-10">
                {settings.heroSubtitle}
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => {
                  const el = document.getElementById("trending");
                  el?.scrollIntoView({ behavior: "smooth" });
                }} className="bg-[#0E0E0D] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C4973A] transition-colors tracking-wide">
                  {settings.heroCtaPrimaryText}
                </button>
                <button className="group flex items-center gap-2.5 border border-[#0E0E0D] text-[#0E0E0D] px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#0E0E0D] hover:text-white transition-colors tracking-wide">
                  <Play size={13} className="fill-current" />
                  {settings.heroCtaSecondaryText}
                </button>
              </div>
            </div>
            <div className="hidden lg:block lg:w-[45%] relative bg-[#F4F3F0]">
              <img src={settings.heroImageUrl} alt="ATLAS hero banner" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-14 right-12 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="text-[10px] text-[#9E9B97] tracking-wider uppercase mb-1">New Arrival</div>
                <div className="font-['DM_Serif_Display'] text-lg text-[#0E0E0D]">Summer Edit 2026</div>
                <div className="text-sm text-[#C4973A] font-medium mt-1">From ₹2,499</div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Featured Categories */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="px-8 lg:px-16 mb-10 flex items-baseline justify-between">
          <h2 className="font-['DM_Serif_Display'] text-3xl lg:text-[40px] text-[#0E0E0D]">Shop by Category</h2>
        </div>
        <div className="flex gap-4 px-8 lg:px-16 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={() => router.push(`/products?category=${encodeURIComponent(cat.name)}`)} className="group flex-none w-[220px] h-[300px] relative rounded-2xl overflow-hidden bg-[#F4F3F0] cursor-pointer">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <div className="text-white font-medium text-base">{cat.name}</div>
                <div className="text-white/60 text-xs mt-0.5 flex items-center gap-1">Explore <ArrowRight size={12} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section id="trending" className="py-20 bg-white">
        <div className="px-8 lg:px-16 mb-10 flex items-baseline justify-between">
          <h2 className="font-['DM_Serif_Display'] text-3xl lg:text-[40px] text-[#0E0E0D]">Trending Now</h2>
        </div>
        <div className="px-8 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="group cursor-pointer">
              <div className="relative bg-[#F4F3F0] rounded-2xl overflow-hidden aspect-square mb-4">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#0E0E0D] text-white text-[9px] font-medium px-2 py-1 rounded-full tracking-wide">{product.badge}</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-all duration-200"
                >
                  <Heart
                    size={14}
                    className={wishlistedIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}
                  />
                </button>
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} className="w-full bg-[#0E0E0D]/90 backdrop-blur-sm text-white py-2.5 rounded-full text-[11px] font-medium tracking-wide hover:bg-[#C4973A] transition-colors">
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-[#9E9B97] font-medium uppercase tracking-wider mb-0.5">{product.brand}</div>
              <div className="text-sm font-medium text-[#0E0E0D] mb-1.5 leading-snug">{product.name}</div>
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={product.rating} />
                <span className="text-[10px] text-[#9E9B97]">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0E0E0D]">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice && <span className="text-xs text-[#9E9B97] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="bg-[#0A0A09] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=480&fit=crop&auto=format" alt="ATLAS lifestyle editorial" className="w-full h-full object-cover opacity-75" />
          </div>
          <div className="flex flex-col justify-center px-8 lg:px-20 py-16">
            <span className="text-[#C4973A] text-[11px] tracking-[0.22em] uppercase font-medium mb-6">The ATLAS Edit</span>
            <h2 className="font-['DM_Serif_Display'] text-3xl lg:text-[48px] text-white leading-[1.1] mb-6">
              Where luxury meets<br /><span className="italic">everyday living.</span>
            </h2>
            <p className="text-[#9E9B97] text-[15px] leading-relaxed mb-8 max-w-sm">
              Each product is hand-picked by our editorial team for exceptional craft and enduring character. No compromise, ever.
            </p>
            <button className="self-start border border-[#C4973A] text-[#C4973A] px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C4973A] hover:text-white transition-colors tracking-wide">
              Read the Story
            </button>
          </div>
        </div>
      </section>

      {/* Brand Story Quote */}
      <section className="py-24 bg-white text-center px-8">
        <div className="max-w-3xl mx-auto">
          <div className="w-10 h-px bg-[#C4973A] mx-auto mb-12" />
          <blockquote className="font-['DM_Serif_Display'] text-3xl lg:text-[48px] text-[#0E0E0D] leading-[1.18] mb-8 italic">
            "We did not set out to build a marketplace. We set out to build a standard."
          </blockquote>
          <p className="text-[#6B6966] text-[15px] leading-relaxed mb-8 max-w-lg mx-auto">
            ATLAS was founded on a singular belief: that the commerce experience itself should feel as elevated as the products within it. Every detail, every interaction, every delivery — intentional.
          </p>
          <div className="w-10 h-px bg-[#C4973A] mx-auto mt-12" />
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="px-8 lg:px-16 mb-12 text-center">
          <span className="text-[11px] text-[#C4973A] tracking-[0.2em] uppercase font-medium">Reviews</span>
          <h2 className="font-['DM_Serif_Display'] text-3xl lg:text-[40px] text-[#0E0E0D] mt-3">What our customers say</h2>
        </div>
        <div className="px-8 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-[#E8E6E1]">
              <Stars rating={r.rating} />
              <p className="text-[#0E0E0D] text-sm leading-relaxed mt-5 mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-[#F4F3F0]">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-medium text-[#0E0E0D] flex items-center gap-2">
                    {r.name}
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">Verified</span>
                  </div>
                  <div className="text-[10px] text-[#9E9B97] mt-0.5">{r.location} · {r.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-16 bg-white">
        <div className="text-center mb-8">
          <div className="text-sm text-[#6B6966] font-medium">@atlascommerce</div>
          <h2 className="font-['DM_Serif_Display'] text-3xl text-[#0E0E0D] mt-1">Follow the edit</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px mb-8">
          {INSTAGRAM_PHOTOS.map((photo, i) => (
            <div key={i} className="relative aspect-square overflow-hidden group bg-[#F4F3F0] cursor-pointer">
              <img src={photo} alt={`@atlascommerce post ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E0E0D] text-[#FAFAF9] border-t border-[#1a1a18]">
        <div className="px-8 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="font-['DM_Serif_Display'] text-2xl text-white mb-3">ATLAS</div>
            <p className="text-[#6B6966] text-sm leading-relaxed">Commerce, elevated. The platform for brands that refuse to compromise.</p>
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-medium tracking-[0.18em] uppercase mb-5">Navigate</div>
            <Link href="/" className="block text-sm text-[#6B6966] hover:text-white transition-colors mb-3">Home</Link>
            <Link href="/mobile" className="block text-sm text-[#6B6966] hover:text-white transition-colors mb-3">Mobile View</Link>
            <Link href="/admin" className="block text-sm text-[#6B6966] hover:text-white transition-colors mb-3">Admin Panel</Link>
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-medium tracking-[0.18em] uppercase mb-5">Legal</div>
            {["Privacy Policy", "Terms of Service", "Returns Policy", "Contact Us"].map((item) => (
              <span key={item} className="block text-sm text-[#6B6966] cursor-pointer hover:text-white transition-colors mb-3">{item}</span>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-medium tracking-[0.18em] uppercase mb-5">Connect</div>
            <span className="block text-sm text-[#6B6966] mb-3">support@atlas.com</span>
            <span className="block text-sm text-[#6B6966]">+91 99999 99999</span>
          </div>
        </div>
        <div className="px-8 lg:px-16 py-5 border-t border-[#1a1a18] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-[#6B6966]">© 2026 ATLAS Commerce OS. All rights reserved.</span>
          <div className="flex items-center gap-3 text-[10px] text-[#6B6966]">
            {["Visa", "Mastercard", "UPI", "COD"].map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
