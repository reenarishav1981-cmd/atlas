"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, BarChart2, ShoppingCart, Package, Boxes, Users, Tag,
  Megaphone, Star, FileText, Globe, DollarSign, Settings, Activity,
  LogOut, Bell, Calendar, AlertTriangle, Zap, Loader2, Menu, X,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import VoiceAssistant from "./VoiceAssistant";
import VisualBuilder from "./VisualBuilder";
import CRMSection from "./CRMSection";
import WalletSection from "./WalletSection";
import SupportSection from "./SupportSection";
import AnalyticsSection from "./AnalyticsSection";

/**
 * WHAT WAS BROKEN in the Figma Make prototype's AdminDashboard:
 *  1. `activeItem` state only changed the <h1> label in the top bar — every
 *     sidebar click rendered the exact same hardcoded Dashboard JSX underneath.
 *     Orders / Products / Customers / etc. were dead buttons.
 *  2. All numbers (KPIs, revenue chart, live orders, top products, low stock)
 *     were hardcoded arrays — nothing came from a database, so "Live Orders"
 *     never updated and stock numbers never matched real inventory.
 *  3. There was no authentication check — anyone with the page URL could see
 *     the admin panel (now fixed by `middleware.ts`, which blocks /admin and
 *     /api/admin/* for anyone who isn't ADMIN/SUPER_ADMIN).
 *
 * FIX: each nav item now renders its own section, fetching real data from the
 * /api/admin/* routes built alongside this file. Add more `case`s the same way
 * to wire up Marketing / Content / Finance / System sections.
 */

const ADMIN_NAV_ITEMS = [
  { section: "Overview", items: [{ icon: LayoutDashboard, label: "Dashboard" }, { icon: BarChart2, label: "Analytics" }] },
  { section: "Commerce", items: [
    { icon: ShoppingCart, label: "Orders" },
    { icon: Package, label: "Products" },
    { icon: Boxes, label: "Inventory" },
    { icon: Users, label: "Customers" },
    { icon: Users, label: "CRM" },
    { icon: DollarSign, label: "Wallet" },
    { icon: Bell, label: "Support" }
  ] },
  { section: "Marketing", items: [{ icon: Tag, label: "Coupons" }, { icon: Megaphone, label: "Campaigns" }, { icon: Star, label: "Reviews" }] },
  { section: "Content", items: [{ icon: FileText, label: "CMS" }, { icon: FileText, label: "Blog" }, { icon: Globe, label: "SEO" }] },
  { section: "Finance", items: [{ icon: DollarSign, label: "Payments" }, { icon: BarChart2, label: "Reports" }] },
  { section: "System", items: [{ icon: Settings, label: "Settings" }, { icon: Activity, label: "Health" }] },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-gray-50 text-gray-600 border-gray-200",
    CONFIRMED: "bg-purple-50 text-purple-700 border-purple-200",
    PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
    SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    REFUNDED: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${map[status] ?? map.PENDING}`}>
      {status}
    </span>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-[#9E9B97]">
      <Loader2 className="animate-spin mr-2" size={18} /> Loading…
    </div>
  );
}

// ── Dashboard section ─────────────────────────────────────────────────────
function DashboardSection() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: true }));
  }, []);

  if (!data) return <Loading />;
  if (data.error) return <div className="text-red-500">Failed to load stats.</div>;

  const { kpis, revenueChart, liveOrders, topProducts, lowStock } = data;

  return (
    <>
      <div className="grid grid-cols-4 gap-5 mb-7">
        {[
          { label: "Total Revenue", value: `₹${kpis.revenue.toLocaleString("en-IN")}`, change: kpis.revenueChangePct, icon: DollarSign },
          { label: "Total Orders", value: kpis.orders, change: kpis.ordersChangePct, icon: ShoppingCart },
          { label: "New Customers", value: kpis.newCustomers, change: kpis.customersChangePct, icon: Users },
          { label: "Conversion Rate", value: `${kpis.conversionRate.toFixed(2)}%`, change: 0, icon: BarChart2 },
        ].map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#E8E6E1]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6B6966]">{label}</span>
              <div className="w-8 h-8 bg-[#F4F3F0] rounded-xl flex items-center justify-center">
                <Icon size={15} className="text-[#C4973A]" />
              </div>
            </div>
            <div className="text-[28px] text-[#0E0E0D] mb-1.5 font-semibold">{value}</div>
            <span className={`text-xs font-medium ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs last 30d
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5 mb-7">
        <div className="col-span-8 bg-white rounded-2xl p-6 border border-[#E8E6E1]">
          <h3 className="font-medium text-[#0E0E0D] mb-5">Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4973A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C4973A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F3F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#C4973A" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 bg-white rounded-2xl p-6 border border-[#E8E6E1]">
          <h3 className="font-medium text-[#0E0E0D] mb-4">Live Orders</h3>
          <div className="space-y-4">
            {liveOrders.map((order: any) => (
              <div key={order.id} className="border-b border-[#F4F3F0] pb-3 last:border-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-[10px] text-[#9E9B97]">{order.customer}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-[#6B6966] truncate mr-2">{order.product}</span>
                  <span className="text-xs font-semibold">₹{order.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
            {liveOrders.length === 0 && <p className="text-xs text-[#9E9B97]">No orders yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 bg-white rounded-2xl p-6 border border-[#E8E6E1]">
          <h3 className="font-medium text-[#0E0E0D] mb-4">Top Products</h3>
          {topProducts.map((p: any, i: number) => (
            <div key={i} className="grid grid-cols-[1fr_60px_80px_56px] py-3 border-b border-[#F4F3F0] last:border-0 items-center">
              <span className="text-sm font-medium truncate pr-3">{p.name}</span>
              <span className="text-sm text-[#6B6966] text-right">{p.sales}</span>
              <span className="text-sm font-medium text-right">₹{p.revenue.toLocaleString("en-IN")}</span>
              <span className={`text-sm font-bold text-right ${p.stock < 15 ? "text-red-500" : "text-emerald-600"}`}>{p.stock}</span>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-xs text-[#9E9B97]">No sales recorded yet.</p>}
        </div>

        <div className="col-span-4 bg-white rounded-2xl p-6 border border-[#E8E6E1]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="font-medium">Low Stock</h3>
          </div>
          <div className="space-y-3">
            {lowStock.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#6B6966] truncate">{p.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-none ${p.stock < 5 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{p.stock} left</span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-xs text-[#9E9B97]">All stock levels healthy.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Orders section ────────────────────────────────────────────────────────
function OrdersSection() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    const url = filter ? `/api/admin/orders?status=${filter}` : "/api/admin/orders";
    fetch(url).then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    load();
  };

  if (!orders) return <Loading />;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1]">
      <div className="p-5 flex gap-2 border-b border-[#F4F3F0]">
        {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === s ? "bg-[#0E0E0D] text-white" : "bg-[#F4F3F0] text-[#6B6966]"}`}>
            {s || "All"}
          </button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] text-[#9E9B97] uppercase border-b border-[#F4F3F0]">
            <th className="px-5 py-3">Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-[#F4F3F0] last:border-0">
              <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
              <td>{o.user.name}<div className="text-[10px] text-[#9E9B97]">{o.user.email}</div></td>
              <td>₹{(o.total / 100).toLocaleString("en-IN")}</td>
              <td><StatusBadge status={o.status} /></td>
              <td>
                <select
                  defaultValue={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="text-xs border border-[#E8E6E1] rounded-lg px-2 py-1"
                >
                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={5} className="text-center py-10 text-[#9E9B97]">No orders found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Products / Inventory section ─────────────────────────────────────────
function SpecRows({ specs, setSpecs }: { specs: [string, string][]; setSpecs: (s: [string, string][]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium">Specifications</label>
        <button type="button" onClick={() => setSpecs([...specs, ["", ""]])} className="text-[10px] text-[#C4973A] font-medium">+ Add spec</button>
      </div>
      <div className="space-y-2">
        {specs.map(([k, v], i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="e.g. Material"
              value={k}
              onChange={(e) => { const s = [...specs]; s[i] = [e.target.value, v]; setSpecs(s); }}
              className="flex-1 border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C4973A]"
            />
            <input
              placeholder="e.g. Stainless Steel"
              value={v}
              onChange={(e) => { const s = [...specs]; s[i] = [k, e.target.value]; setSpecs(s); }}
              className="flex-1 border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C4973A]"
            />
            <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-2">✕</button>
          </div>
        ))}
        {specs.length === 0 && <p className="text-[10px] text-[#9E9B97]">No specs added — e.g. Material, Warranty, Dimensions.</p>}
      </div>
    </div>
  );
}

function ImageUploader({ images, setImages }: { images: string[]; setImages: (i: string[]) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) uploaded.push(data.url);
    }
    setImages([...images, ...uploaded]);
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1.5">Product Images</label>
      <div className="flex gap-3 flex-wrap mb-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E8E6E1]">
            <img src={url} className="w-full h-full object-cover" />
            <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-black/60 text-white text-[10px] w-5 h-5 rounded-full">✕</button>
          </div>
        ))}
        <label className="w-20 h-20 rounded-lg border border-dashed border-[#E8E6E1] flex items-center justify-center cursor-pointer text-[#9E9B97] text-[10px] text-center">
          {uploading ? "…" : "+ Upload"}
          <input type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
        </label>
      </div>
      <p className="text-[9px] text-[#9E9B97]">JPG/PNG/WEBP, max 5MB each. First image becomes the main photo.</p>
    </div>
  );
}

function ProductFormFields({
  form, setForm, categories, brands, onCreateCategory, onCreateBrand,
}: any) {
  const [newCat, setNewCat] = useState("");
  const [newBrand, setNewBrand] = useState("");

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Product Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">SKU</label>
          <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Price (₹)</label>
          <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Original Price (optional, for "was/now")</label>
          <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Stock Quantity</label>
          <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Badge (optional, e.g. "Best Seller")</label>
          <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A] mb-1.5">
            <option value="">— None —</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-1.5">
            <input placeholder="+ New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-1 border border-[#E8E6E1] rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-[#C4973A]" />
            <button type="button" onClick={async () => { if (!newCat.trim()) return; const cat = await onCreateCategory(newCat); setForm({ ...form, categoryId: cat.id }); setNewCat(""); }} className="text-[11px] bg-[#F4F3F0] px-3 rounded-lg">Add</button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Brand</label>
          <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A] mb-1.5">
            <option value="">— None —</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-1.5">
            <input placeholder="+ New brand name" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="flex-1 border border-[#E8E6E1] rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-[#C4973A]" />
            <button type="button" onClick={async () => { if (!newBrand.trim()) return; const b = await onCreateBrand(newBrand); setForm({ ...form, brandId: b.id }); setNewBrand(""); }} className="text-[11px] bg-[#F4F3F0] px-3 rounded-lg">Add</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">Description</label>
        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A] h-20 resize-none" />
      </div>

      <ImageUploader images={form.images} setImages={(images: string[]) => setForm({ ...form, images })} />
      <SpecRows specs={form.specs} setSpecs={(specs: [string, string][]) => setForm({ ...form, specs })} />
    </>
  );
}

const EMPTY_FORM = { name: "", sku: "", description: "", price: "", originalPrice: "", stock: "", badge: "", categoryId: "", brandId: "", images: [] as string[], specs: [] as [string, string][] };

function ProductsSection() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editSlug, setEditSlug] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshProducts = () => fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
  const refreshCategories = () => fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
  const refreshBrands = () => fetch("/api/admin/brands").then((r) => r.json()).then((d) => setBrands(d.brands ?? []));

  useEffect(() => { refreshProducts(); refreshCategories(); refreshBrands(); }, []);

  const createCategory = async (name: string) => {
    const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    await refreshCategories();
    return data.category;
  };
  const createBrand = async (name: string) => {
    const res = await fetch("/api/admin/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    await refreshBrands();
    return data.brand;
  };

  const openCreate = () => { setForm(EMPTY_FORM); setError(""); setMode("create"); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name, sku: p.sku, description: p.description,
      price: String(p.price / 100), originalPrice: p.originalPrice ? String(p.originalPrice / 100) : "",
      stock: String(p.stock), badge: p.badge ?? "",
      categoryId: p.categoryId ?? "", brandId: p.brandId ?? "",
      images: (p.images ?? []).map((i: any) => i.url),
      specs: p.specs ? Object.entries(p.specs) as [string, string][] : [],
    });
    setEditSlug(p.slug);
    setError("");
    setMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const specsObj = Object.fromEntries(form.specs.filter(([k]) => k.trim() !== ""));
    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      originalPrice: form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : undefined,
      stock: parseInt(form.stock) || 0,
      badge: form.badge || undefined,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      images: form.images,
      specs: Object.keys(specsObj).length ? specsObj : undefined,
    };

    const url = mode === "edit" ? `/api/products/${editSlug}` : "/api/products";
    const res = await fetch(url, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setMode("none");
    refreshProducts();
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Remove this product from the storefront? (Order history is preserved.)")) return;
    await fetch(`/api/products/${slug}`, { method: "DELETE" });
    refreshProducts();
  };

  if (!products) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-[#0E0E0D]">Products</h3>
        {mode === "none" && (
          <button onClick={openCreate} className="bg-[#0E0E0D] text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#C4973A] transition-colors">
            + Add Product
          </button>
        )}
      </div>

      {mode !== "none" && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E6E1] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-[#0E0E0D]">{mode === "edit" ? `Editing: ${form.name}` : "New Product"}</h4>
            <button type="button" onClick={() => setMode("none")} className="text-xs text-[#9E9B97]">Cancel</button>
          </div>
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">{error}</div>}
          <ProductFormFields form={form} setForm={setForm} categories={categories} brands={brands} onCreateCategory={createCategory} onCreateBrand={createBrand} />
          <button type="submit" disabled={loading} className="bg-[#0E0E0D] text-white px-6 py-2.5 rounded-xl text-xs font-medium hover:bg-[#C4973A] transition-colors disabled:opacity-50">
            {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Product"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] text-[#9E9B97] uppercase border-b border-[#F4F3F0]">
              <th className="px-5 py-3">Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#F4F3F0] last:border-0">
                <td className="px-5 py-3 font-medium flex items-center gap-2">
                  {p.images?.[0]?.url && <img src={p.images[0].url} className="w-8 h-8 rounded-lg object-cover" />}
                  {p.name}
                </td>
                <td className="text-[#6B6966]">{p.sku}</td>
                <td>₹{(p.price / 100).toLocaleString("en-IN")}</td>
                <td className={p.stock < 15 ? "text-red-500 font-bold" : ""}>{p.stock}</td>
                <td>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="space-x-2">
                  <button onClick={() => openEdit(p)} className="text-[11px] text-[#0E0E0D] underline">Edit</button>
                  <button onClick={() => handleDelete(p.slug)} className="text-[11px] text-red-500 underline">Remove</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-[#9E9B97]">No products yet — click "+ Add Product" above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Settings / Content section — hero banner, announcement bar, no dev needed ──
function SettingsSection() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  const handleHeroImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploadingHero(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingHero(false);
    if (res.ok) setSettings({ ...settings, heroImageUrl: data.url });
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, updatedAt, ...payload } = settings;
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  if (!settings) return <Loading />;

  const field = (key: string, label: string, hint?: string, textarea = false) => (
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A] h-20 resize-none" />
      ) : (
        <input value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A]" />
      )}
      {hint && <p className="text-[9px] text-[#9E9B97] mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6">
        <h4 className="font-medium text-sm text-[#0E0E0D] mb-1">Announcement Bar</h4>
        <p className="text-[10px] text-[#9E9B97] mb-4">The thin black strip at the very top of the homepage.</p>
        <label className="flex items-center gap-2 mb-4 text-xs">
          <input type="checkbox" checked={settings.announcementEnabled} onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })} />
          Show announcement bar
        </label>
        {field("announcementText", "Announcement Text")}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6">
        <h4 className="font-medium text-sm text-[#0E0E0D] mb-1">Hero Banner</h4>
        <p className="text-[10px] text-[#9E9B97] mb-4">The big section at the top of the homepage — image, heading, and buttons.</p>

        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider text-[#6B6966] font-medium mb-1.5">Hero Image</label>
          <div className="flex items-center gap-3">
            <img src={settings.heroImageUrl} className="w-24 h-24 rounded-xl object-cover border border-[#E8E6E1]" />
            <label className="text-xs bg-[#F4F3F0] px-4 py-2 rounded-xl cursor-pointer">
              {uploadingHero ? "Uploading…" : "Change Image"}
              <input type="file" accept="image/*" hidden onChange={(e) => handleHeroImageUpload(e.target.files)} />
            </label>
          </div>
        </div>

        {field("heroBadgeText", "Small badge text (above the heading)", `e.g. "Commerce, Redefined"`)}
        <div className="grid grid-cols-2 gap-4">
          {field("heroHeadingLine1", "Heading — line 1")}
          {field("heroHeadingLine2", "Heading — line 2 (shown in italic)")}
        </div>
        {field("heroSubtitle", "Subtitle paragraph", undefined, true)}
        <div className="grid grid-cols-2 gap-4">
          {field("heroCtaPrimaryText", "Primary button text")}
          {field("heroCtaSecondaryText", "Secondary button text")}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6">
        <h4 className="font-medium text-sm text-[#0E0E0D] mb-1">Footer</h4>
        {field("footerText", "Footer copyright text")}
      </div>

      <button onClick={handleSave} disabled={saving} className="bg-[#0E0E0D] text-white px-6 py-2.5 rounded-xl text-xs font-medium hover:bg-[#C4973A] transition-colors disabled:opacity-50">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
      {saved && <p className="text-[10px] text-emerald-600">Live on the homepage now — refresh it to see your changes.</p>}
    </div>
  );
}

// ── Customers section ──────────────────────────────────────────────────────
function CustomersSection() {
  const [customers, setCustomers] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);

  if (!customers) return <Loading />;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] text-[#9E9B97] uppercase border-b border-[#F4F3F0]">
            <th className="px-5 py-3">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-[#F4F3F0] last:border-0">
              <td className="px-5 py-3 font-medium">{c.name}</td>
              <td className="text-[#6B6966]">{c.email}</td>
              <td className="text-[#6B6966]">{c.phone ?? "—"}</td>
              <td>{c._count.orders}</td>
              <td className="text-[#9E9B97]">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr><td colSpan={5} className="text-center py-10 text-[#9E9B97]">No customers yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-[#E8E6E1]">
      <Settings size={30} className="text-[#E8E6E1] mb-3" />
      <p className="text-[#9E9B97] text-sm">{label}</p>
      <p className="text-[#C8C5C0] text-xs mt-1">Wire this section the same way as Orders/Products — add an /api/admin/{"{section}"} route, then a section component.</p>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeItem) {
      case "Dashboard": return <DashboardSection />;
      case "Analytics": return <AnalyticsSection />;
      case "Orders": return <OrdersSection />;
      case "Products":
      case "Inventory": return <ProductsSection />;
      case "Customers": return <CustomersSection />;
      case "Settings": return <SettingsSection />;
      case "CMS": return <VisualBuilder />;
      case "CRM": return <CRMSection />;
      case "Wallet": return <WalletSection />;
      case "Support": return <SupportSection />;
      default: return <ComingSoon label={activeItem} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F3F0] overflow-hidden relative">
      {/* Mobile Sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0A0A09] flex flex-col h-full overflow-hidden transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-[#1a1a18] flex-none flex items-center justify-between">
          <div>
            <div className="text-xl text-white">ATLAS</div>
            <div className="text-[10px] text-[#3a3a37] mt-0.5 tracking-wider uppercase">Commerce OS</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(({ section, items }) => (
            <div key={section} className="mb-5">
              <div className="px-3 mb-1.5 text-[9px] font-medium text-[#3a3a37] uppercase tracking-[0.14em]">{section}</div>
              {items.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    setActiveItem(label);
                    setIsSidebarOpen(false); // Close sidebar on mobile item click
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-all ${activeItem === label ? "bg-[#1c1c1a] text-white" : "text-[#5a5a57] hover:bg-[#141413] hover:text-[#9E9B97]"}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/login"))}
          className="px-4 py-4 border-t border-[#1a1a18] flex items-center gap-3 flex-none text-[#5a5a57] hover:text-white"
        >
          <LogOut size={14} /> Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[60px] bg-white border-b border-[#E8E6E1] flex items-center px-4 lg:px-8 gap-3 lg:gap-4 flex-none">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden w-8 h-8 border border-[#E8E6E1] rounded-xl flex items-center justify-center cursor-pointer flex-none"
          >
            <Menu size={15} className="text-[#6B6966]" />
          </button>
          <h1 className="font-medium flex-1 text-sm lg:text-base truncate">{activeItem}</h1>
          <VoiceAssistant onNavigate={setActiveItem} />
          <div className="hidden sm:flex items-center gap-2 border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-sm text-[#6B6966]">
            <Calendar size={13} /> Last 30 days
          </div>
          <button className="relative w-8 h-8 border border-[#E8E6E1] rounded-xl flex items-center justify-center">
            <Bell size={15} className="text-[#6B6966]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">{renderSection()}</div>
      </div>
    </div>
  );
}
