"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function Navbar({ cartCount = 0, wishlistCount = 4 }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);

  // Sync scroll state for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically load cart count if not explicitly passed
  useEffect(() => {
    if (cartCount === 0) {
      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : { count: undefined }))
        .then((data: any) => {
          if (data.count !== undefined) setLiveCartCount(data.count);
        })
        .catch(() => {});
    } else {
      setLiveCartCount(cartCount);
    }
  }, [cartCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Collections", href: "#" },
    { label: "Brands", href: "#" },
    { label: "Stories", href: "#" },
  ];

  return (
    <nav
      className={`h-[72px] bg-white sticky top-0 z-40 flex items-center justify-between px-8 border-b border-[#E8E6E1] transition-all duration-300 ${
        scrolled ? "shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <div className="flex items-center gap-10">
        <Link href="/" className="font-['DM_Serif_Display'] text-[24px] text-[#0E0E0D] tracking-tight">
          ATLAS
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-[#0E0E0D]" : "text-[#6B6966] hover:text-[#0E0E0D]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {showSearch ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#F4F3F0] rounded-full px-3 py-1.5 transition-all">
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-28 sm:w-40 text-[#0E0E0D]"
            />
            <button type="button" onClick={() => setShowSearch(false)} className="text-[#6B6966] hover:text-[#0E0E0D] text-[10px] font-bold">✕</button>
          </form>
        ) : (
          <button onClick={() => setShowSearch(true)} className="text-[#6B6966] hover:text-[#0E0E0D] transition-colors">
            <Search size={18} />
          </button>
        )}
        <button className="relative text-[#6B6966] hover:text-[#0E0E0D] transition-colors">
          <Heart size={18} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C4973A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </button>
        <Link href="/cart" className="relative text-[#6B6966] hover:text-[#0E0E0D] transition-colors">
          <ShoppingBag size={18} />
          {liveCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#0E0E0D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {liveCartCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <Link
              href="/account"
              className="w-8 h-8 bg-[#F4F3F0] rounded-full flex items-center justify-center text-[#6B6966] hover:bg-[#E8E6E1] transition-colors"
            >
              <User size={15} />
            </Link>
            {user && (
              <span className="text-[9px] text-[#6B6966] mt-0.5 max-w-[60px] truncate font-medium">{user.name.split(" ")[0]}</span>
            )}
          </div>
          {!user && (
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-[#0E0E0D] hover:bg-[#C4973A] px-3.5 py-2 rounded-xl transition-all duration-300"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
