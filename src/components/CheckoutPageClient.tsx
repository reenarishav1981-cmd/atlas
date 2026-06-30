"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Shield } from "lucide-react";
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

export default function CheckoutPageClient({
  initialItems,
  user,
}: {
  initialItems: CartItem[];
  user: any;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "NETBANKING" | "COD">("COD");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express" | "same">("standard");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
  });

  const subtotal = initialItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = subtotal > 5000 ? 1500 : 0;
  const deliveryFee = deliveryMethod === "express" ? 299 : deliveryMethod === "same" ? 599 : 0;
  const total = subtotal - discount + deliveryFee;

  const handlePlaceOrder = async () => {
    // Validate inputs
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pin) {
      toast.error("Please fill in all shipping details.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingState: form.state,
        shippingPin: form.pin,
        deliveryMethod,
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }

      setOrderNumber(data.order.orderNumber);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-8 pb-24">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-[#E8E6E1] text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200">
            <Check size={36} className="text-emerald-600" />
          </div>
          <h1 className="font-['DM_Serif_Display'] text-[36px] text-[#0E0E0D] mb-3 leading-tight">Order Confirmed!</h1>
          <p className="text-[#6B6966] mb-1.5">Thank you for your purchase, {form.name}!</p>
          <p className="text-sm font-semibold text-[#C4973A] mb-1.5">Order Number: {orderNumber}</p>
          <p className="text-sm text-[#6B6966] mb-8">Estimated delivery inside 3 business days.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="bg-[#0E0E0D] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C4973A] transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Shipping", "Delivery", "Payment", "Review"];

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-['Inter',sans-serif] pb-24">
      {/* Header navbar */}
      <Navbar cartCount={initialItems.length} />

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="font-['DM_Serif_Display'] text-[36px] text-[#0E0E0D] mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i + 1 < step ? "bg-emerald-600 text-white" : i + 1 === step ? "bg-[#0E0E0D] text-white" : "bg-[#F4F3F0] text-[#9E9B97]"}`}>
                  {i + 1 < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? "text-[#0E0E0D]" : "text-[#9E9B97]"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-4 transition-colors ${i + 1 < step ? "bg-emerald-600" : "bg-[#E8E6E1]"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="bg-white rounded-2xl p-8 border border-[#E8E6E1]">
            {step === 1 && (
              <div>
                <h2 className="font-['DM_Serif_Display'] text-2xl mb-6">Shipping Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">Email</label>
                    <input value={form.email} disabled className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] opacity-60 bg-[#F4F3F0]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9999999990" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">Street Address</label>
                    <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="12, Marine Drive" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">City</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">State</label>
                    <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#6B6966] mb-1.5 uppercase tracking-wider">PIN Code</label>
                    <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="400001" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0E0E0D] focus:outline-none focus:border-[#C4973A]" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-['DM_Serif_Display'] text-2xl mb-6">Delivery Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "standard" as const, label: "Standard Delivery", sub: "3–5 business days", price: "Free", desc: "Delivered by ATLAS Logistics" },
                    { id: "express" as const, label: "Express Delivery", sub: "1–2 business days", price: "₹299", desc: "Priority handling + real-time tracking" },
                    { id: "same" as const, label: "Same Day Delivery", sub: "Within 6 hours (select cities)", price: "₹599", desc: "Available in Mumbai, Delhi, Bangalore" },
                  ].map((opt) => (
                    <button key={opt.id} onClick={() => setDeliveryMethod(opt.id)} className={`w-full text-left p-5 rounded-xl border-2 transition-all ${deliveryMethod === opt.id ? "border-[#0E0E0D] bg-[#FAFAF9]" : "border-[#E8E6E1] hover:border-[#C8C5C0]"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-none ${deliveryMethod === opt.id ? "border-[#0E0E0D]" : "border-[#E8E6E1]"}`}>
                            {deliveryMethod === opt.id && <div className="w-2 h-2 bg-[#0E0E0D] rounded-full" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#0E0E0D]">{opt.label}</div>
                            <div className="text-xs text-[#9E9B97] mt-0.5">{opt.sub}</div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#0E0E0D]">{opt.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-['DM_Serif_Display'] text-2xl mb-6">Payment</h2>
                <div className="flex gap-2 mb-6">
                  {([
                    { id: "COD", label: "Cash on Delivery (COD)" },
                    { id: "CARD", label: "Card" },
                    { id: "UPI", label: "UPI" },
                  ] as const).map((m) => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${paymentMethod === m.id ? "border-[#0E0E0D] bg-[#0E0E0D] text-white" : "border-[#E8E6E1] text-[#6B6966] hover:border-[#C8C5C0]"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {paymentMethod === "COD" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-700">Cash on Delivery — Payment collected at your doorstep. Safe and convenient.</p>
                  </div>
                )}
                {paymentMethod !== "COD" && (
                  <div className="bg-[#F4F3F0] rounded-xl p-4 border border-[#E8E6E1]">
                    <p className="text-xs text-[#6B6966]">Online payments are secured using standard encryption. You will be redirected to complete the payment flow.</p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-['DM_Serif_Display'] text-2xl mb-6">Review Your Order</h2>
                <div className="space-y-4 mb-6">
                  {initialItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F4F3F0] rounded-xl overflow-hidden flex-none">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#0E0E0D]">{item.name}</div>
                        <div className="text-xs text-[#9E9B97]">Qty: {item.qty}</div>
                      </div>
                      <span className="text-sm font-semibold">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#F4F3F0] rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between text-[#6B6966]"><span>Shipping to</span><span className="text-[#0E0E0D] font-medium">{form.address}, {form.city}</span></div>
                  <div className="flex justify-between text-[#6B6966]"><span>Payment Method</span><span className="text-[#0E0E0D] font-medium">{paymentMethod}</span></div>
                  <div className="flex justify-between text-[#6B6966]"><span>Delivery Type</span><span className="text-[#0E0E0D] font-medium capitalize">{deliveryMethod}</span></div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-[#F4F3F0]">
              {step > 1 && (
                <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 text-sm text-[#6B6966] hover:text-[#0E0E0D] transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={() => step < 4 ? setStep((s) => s + 1) : handlePlaceOrder()}
                disabled={loading}
                className="ml-auto bg-[#0E0E0D] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C4973A] transition-colors disabled:opacity-50"
              >
                {loading ? "Placing Order..." : step === 4 ? "Place Order" : "Continue"}
              </button>
            </div>
          </div>

          {/* Right summary panel */}
          <div className="sticky top-24 self-start bg-white rounded-2xl p-6 border border-[#E8E6E1]">
            <h3 className="font-medium text-[#0E0E0D] mb-4">Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-[#6B6966]"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between text-[#6B6966]"><span>Shipping</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
            </div>
            <div className="border-t border-[#E8E6E1] pt-3 mt-3 flex justify-between font-bold text-[#0E0E0D]">
              <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Shield size={13} className="text-emerald-600 flex-none" />
              <span className="text-[10px] text-[#9E9B97]">Secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
