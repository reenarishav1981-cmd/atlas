"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Minus, Plus, ChevronLeft, Shield, Truck, Award
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  qty: number;
  variant: string;
}

export default function CartPageClient({ initialItems }: { initialItems: CartItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [coupon, setCoupon] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = subtotal > 5000 ? 1500 : 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    if (newQty < 0) return;
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, qty: newQty }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update quantity");
        return;
      }

      if (newQty === 0) {
        setItems(items.filter((i) => i.id !== itemId));
        toast.success("Item removed from cart");
      } else {
        setItems(items.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i)));
      }
    } catch (err) {
      toast.error("Error updating cart quantity");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        toast.error("Failed to remove item");
        return;
      }

      setItems(items.filter((i) => i.id !== itemId));
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Error removing item");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-['Inter',sans-serif] pb-24">
      {/* Header navbar */}
      <Navbar cartCount={items.length} />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#0E0E0D] mb-10">Your Cart ({items.length})</h1>
        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#E8E6E1]">
            <ShoppingBag size={48} className="text-[#E8E6E1] mx-auto mb-4" />
            <p className="text-[#9E9B97] mb-6">Your cart is empty</p>
            <Link href="/" className="bg-[#0E0E0D] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C4973A] transition-colors inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            <div>
              <div className="border-b border-[#E8E6E1] pb-3 mb-6 grid grid-cols-[1fr_120px_120px_100px] gap-4 text-[10px] text-[#9E9B97] font-medium uppercase tracking-wider">
                <span>Product</span><span>Price</span><span>Qty</span><span className="text-right">Total</span>
              </div>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_120px_120px_100px] gap-4 items-center pb-6 border-b border-[#F4F3F0]">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#F4F3F0] rounded-xl overflow-hidden flex-none">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#9E9B97] mb-0.5">{item.brand}</div>
                        <div className="text-sm font-medium text-[#0E0E0D]">{item.name}</div>
                        <div className="text-xs text-[#9E9B97] mt-0.5">{item.variant}</div>
                        <button onClick={() => handleRemove(item.id)} className="text-xs text-[#C0392B] hover:underline mt-1 block">Remove</button>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₹{item.price.toLocaleString("en-IN")}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateQty(item.id, item.qty - 1)} className="w-7 h-7 border border-[#E8E6E1] rounded-lg flex items-center justify-center hover:border-[#0E0E0D] transition-colors"><Minus size={11} /></button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button onClick={() => handleUpdateQty(item.id, item.qty + 1)} className="w-7 h-7 border border-[#E8E6E1] rounded-lg flex items-center justify-center hover:border-[#0E0E0D] transition-colors"><Plus size={11} /></button>
                    </div>
                    <span className="text-sm font-semibold text-right">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <Link href="/" className="mt-8 text-sm text-[#6B6966] inline-flex items-center gap-1 hover:text-[#0E0E0D] transition-colors">
                <ChevronLeft size={14} /> Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="sticky top-24 self-start">
              <div className="bg-white rounded-2xl p-7 border border-[#E8E6E1] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0E0E0D] mb-6">Order Summary</h2>
                <div className="flex gap-2 mb-6">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4973A] transition-colors" />
                  <button className="bg-[#F4F3F0] text-[#0E0E0D] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#E8E6E1] transition-colors">Apply</button>
                </div>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-[#6B6966]">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between"><span className="text-[#6B6966]">Discount</span><span className="text-emerald-600">-₹{discount.toLocaleString("en-IN")}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-[#6B6966]">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                </div>
                <div className="border-t border-[#E8E6E1] pt-4 mb-6 flex justify-between items-center">
                  <span className="font-semibold text-[#0E0E0D]">Total</span>
                  <span className="text-xl font-bold text-[#0E0E0D]">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <Link href="/checkout" className="w-full bg-[#0E0E0D] text-white py-4 rounded-full font-medium hover:bg-[#C4973A] transition-colors block text-center">
                  Proceed to Checkout
                </Link>
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#F4F3F0]">
                  {[{ icon: Shield, label: "Secure" }, { icon: Truck, label: "Free Returns" }, { icon: Award, label: "Authentic" }].map(({ icon: Icon, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={17} className="mx-auto text-[#C4973A] mb-1" />
                      <span className="text-[10px] text-[#9E9B97]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
