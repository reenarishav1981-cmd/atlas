"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Filter,
  ChevronDown,
  Check,
  Heart,
  LayoutGrid,
  List,
  Star,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  slug: string;
  stock: number;
}

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
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

export default function CategoryPageClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
  const [priceMax, setPriceMax] = useState(50000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openFilters, setOpenFilters] = useState<string[]>(["Price", "Brand", "Rating"]);
  const [sortBy, setSortBy] = useState("Featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inStock, setInStock] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  // Sync URL search query ?q= and ?category= on mount
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);

    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Load initial cart count and wishlist
  useEffect(() => {
    fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : { count: undefined }))
      .then((data: any) => {
        if (data.count !== undefined) setCartCount(data.count);
      })
      .catch(() => {});

    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: any) => {
        if (data.items) setWishlistedIds(data.items.map((item: any) => item.productId));
      })
      .catch(() => {});
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
        router.push(`/login?redirect=/products`);
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
        router.push(`/register?redirect=/products`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${product.name} added to cart!`);
      // Update cart count
      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : { count: undefined }))
        .then((data: any) => {
          if (data.count !== undefined) setCartCount(data.count);
        });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Compute Brand and Category dynamic lists
  const brandCounts: Record<string, number> = {};
  const categoriesSet = new Set<string>();
  
  initialProducts.forEach((p) => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    if (p.category) categoriesSet.add(p.category);
  });

  const categories = ["All", ...Array.from(categoriesSet)];

  // Multi-criteria client-side filtering
  let filteredProducts = initialProducts.filter((product) => {
    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    // Category filter
    if (activeCategory !== "All" && product.category !== activeCategory) {
      return false;
    }
    // Price filter
    if (product.price > priceMax) {
      return false;
    }
    // Stock filter
    if (inStock && product.stock <= 0) {
      return false;
    }
    // Rating filter
    if (minRating !== null && product.rating < minRating) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchBrand = product.brand.toLowerCase().includes(query);
      if (!matchName && !matchBrand) return false;
    }
    return true;
  });

  // Sorting
  if (sortBy === "Price: Low to High") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "Price: High to Low") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "Newest") {
    filteredProducts.reverse();
  } else if (sortBy === "Rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const toggleFilter = (f: string) =>
    setOpenFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24 font-['Inter',sans-serif]">
      <Navbar cartCount={cartCount} />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className="w-[280px] min-h-[calc(100vh-72px)] bg-white border-r border-[#E8E6E1] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto px-6 py-8 flex-none"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[#0E0E0D] font-medium text-sm">
              <SlidersHorizontal size={14} className="text-[#C4973A]" /> Filters
            </div>
            <button
              onClick={() => {
                setSelectedBrands([]);
                setPriceMax(50000);
                setInStock(false);
                setMinRating(null);
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="text-xs text-[#C4973A] hover:underline font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <button
              onClick={() => toggleFilter("Price")}
              className="flex items-center justify-between w-full mb-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0D]">Price Range</span>
              <ChevronDown
                size={14}
                className={`text-[#9E9B97] transition-transform ${
                  openFilters.includes("Price") ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFilters.includes("Price") && (
              <div>
                <div className="flex justify-between text-xs text-[#6B6966] mb-3">
                  <span>₹0</span>
                  <span className="font-semibold text-[#0E0E0D]">₹{priceMax.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={500}
                  value={priceMax}
                  onChange={(e) => setPriceMax(+e.target.value)}
                  className="w-full accent-[#C4973A]"
                />
              </div>
            )}
          </div>
          <div className="h-px bg-[#F4F3F0] mb-6" />

          {/* Brand */}
          <div className="mb-6">
            <button
              onClick={() => toggleFilter("Brand")}
              className="flex items-center justify-between w-full mb-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0D]">Brand</span>
              <ChevronDown
                size={14}
                className={`text-[#9E9B97] transition-transform ${
                  openFilters.includes("Brand") ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFilters.includes("Brand") && (
              <div className="space-y-2.5">
                {Object.entries(brandCounts).map(([brand, count]) => (
                  <label
                    key={brand}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() =>
                          setSelectedBrands((prev) =>
                            prev.includes(brand)
                              ? prev.filter((b) => b !== brand)
                              : [...prev, brand]
                          )
                        }
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-none ${
                          selectedBrands.includes(brand)
                            ? "bg-[#0E0E0D] border-[#0E0E0D]"
                            : "border-[#E8E6E1] group-hover:border-[#0E0E0D]"
                        }`}
                      >
                        {selectedBrands.includes(brand) && (
                          <Check size={10} className="text-white" />
                        )}
                      </button>
                      <span className="text-xs text-[#6B6966]">{brand}</span>
                    </div>
                    <span className="text-[10px] bg-[#F4F3F0] text-[#6B6966] px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="h-px bg-[#F4F3F0] mb-6" />

          {/* Rating */}
          <div className="mb-6">
            <button
              onClick={() => toggleFilter("Rating")}
              className="flex items-center justify-between w-full mb-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0D]">Minimum Rating</span>
              <ChevronDown
                size={14}
                className={`text-[#9E9B97] transition-transform ${
                  openFilters.includes("Rating") ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFilters.includes("Rating") && (
              <div className="space-y-2">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? null : r)}
                    className={`flex items-center gap-2.5 w-full py-1.5 px-2 rounded-lg transition-colors text-left ${
                      minRating === r ? "bg-[#F4F3F0] text-[#0E0E0D]" : "text-[#6B6966] hover:bg-[#FAFAF9]"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-none ${minRating === r ? "border-[#C4973A]" : "border-[#E8E6E1]"}`}>
                      {minRating === r && <div className="w-1.5 h-1.5 rounded-full bg-[#C4973A]" />}
                    </div>
                    <Stars rating={r} size={11} />
                    <span className="text-xs font-medium">& up</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="h-px bg-[#F4F3F0] mb-6" />

          {/* In Stock */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0D]">In Stock Only</span>
            <button
              onClick={() => setInStock((v) => !v)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                inStock ? "bg-[#0E0E0D]" : "bg-[#E8E6E1]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  inStock ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Catalog Grid */}
        <main className="flex-1 px-8 py-8">
          {/* Header controls */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#9E9B97]">
                <Link href="/" className="hover:text-[#0E0E0D] transition-colors">
                  Home
                </Link>
                <ChevronRight size={11} />
                <span className="text-[#0E0E0D]">Shop</span>
              </div>
              <div className="flex gap-1">
                {(["grid", "list"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      viewMode === m
                        ? "bg-[#0E0E0D] text-white"
                        : "text-[#9E9B97] hover:text-[#0E0E0D]"
                    }`}
                  >
                    {m === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Real-time Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-['DM_Serif_Display'] text-3xl lg:text-[40px] text-[#0E0E0D] leading-tight">
                  ATLAS Shop
                </h1>
                <p className="text-xs text-[#6B6966] mt-1 font-light">
                  Showing <strong className="text-[#0E0E0D]">{filteredProducts.length}</strong> premium products
                </p>
              </div>

              {/* Dynamic Live Search Bar */}
              <div className="relative max-w-sm w-full">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9B97]" />
                <input
                  type="text"
                  placeholder="Search products or brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E6E1] bg-white text-xs outline-none focus:border-[#C4973A] transition-all"
                />
              </div>
            </div>

            {/* Category Pills Toggler */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#0E0E0D] text-white shadow-xs"
                        : "bg-white text-[#6B6966] border border-[#E8E6E1] hover:border-[#6B6966]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort controller */}
            <div className="flex items-center justify-between border-t border-[#E8E6E1] pt-4">
              <div className="text-xs text-[#6B6966]">
                Filters active: <span className="font-semibold text-[#0E0E0D]">{selectedBrands.length ? `${selectedBrands.length} brands` : "None"}</span>
              </div>
              <div className="flex items-center gap-2 border border-[#E8E6E1] rounded-full px-4 py-2 bg-white">
                <span className="text-xs text-[#6B6966]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium text-[#0E0E0D] bg-transparent focus:outline-none cursor-pointer"
                >
                  {[
                    "Featured",
                    "Price: Low to High",
                    "Price: High to Low",
                    "Newest",
                    "Rating",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product grid list items */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.slug}`)}
                className={`group cursor-pointer bg-white border border-[#E8E6E1] rounded-3xl p-3.5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 ${
                  viewMode === "list"
                    ? "flex gap-5 items-center"
                    : ""
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className={`relative bg-[#F4F3F0] rounded-2xl overflow-hidden ${
                    viewMode === "list" ? "w-32 h-32 flex-none" : "aspect-square mb-4"
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Heart
                      size={13}
                      className={wishlistedIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-[#6B6966] hover:fill-red-500 hover:text-red-500 transition-all"}
                    />
                  </button>
                  {product.badge && viewMode === "grid" && (
                    <span className="absolute top-3 left-3 bg-[#0E0E0D] text-white text-[9px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {product.badge}
                    </span>
                  )}
                  {viewMode === "grid" && (
                    <div
                      className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
                        hoveredIdx === idx
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-[#0E0E0D]/90 backdrop-blur-xs text-white py-2.5 rounded-full text-[10px] font-semibold tracking-wider uppercase hover:bg-[#C4973A] transition-colors"
                      >
                        Quick Add
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={
                    viewMode === "list" ? "flex-1 flex flex-col justify-center" : "px-1"
                  }
                >
                  <div className="text-[10px] text-[#9E9B97] font-semibold uppercase tracking-widest mb-0.5">
                    {product.brand}
                  </div>
                  <h3 className="text-sm font-semibold text-[#0E0E0D] mb-1.5 leading-snug group-hover:text-[#C4973A] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Stars rating={product.rating} size={11} />
                    <span className="text-[10px] text-[#9E9B97] font-medium">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0E0E0D]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#9E9B97] line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {viewMode === "list" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="bg-[#0E0E0D] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C4973A] transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 text-sm text-[#9E9B97]">
                No products match the selected filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
