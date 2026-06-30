"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyBottomNav() {
  const pathname = usePathname();

  const links = [
    { label: "Homepage", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
    { label: "Admin", href: "/admin" },
    { label: "Account", href: "/account" },
    { label: "Mobile", href: "/mobile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0E0E0D]/90 backdrop-blur-md px-2 py-1.5 rounded-full flex items-center gap-1 shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-white/10 z-50 transition-all hover:scale-[1.02]">
      {links.map((link) => {
        // Match exact or prefix matching for products/slug
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.label}
            href={link.href}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              isActive
                ? "bg-[#C4973A] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
