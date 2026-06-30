"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  User,
  Mail,
  Shield,
  Plus,
  Trash2,
  Calendar,
  Package,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AccountDashboardClient({
  user,
  orders,
}: {
  user: UserProps;
  orders: Order[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "settings">("orders");
  const [loading, setLoading] = useState(false);

  // Profile forms
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  // Addresses mock management
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      tag: "Home (Default)",
      street: "Flat 405, Prestige heights",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560001",
      phone: "+91 98765 43210",
    },
    {
      id: "2",
      tag: "Work Office",
      street: "Level 14, WeWork Galaxy",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      phone: "+91 99887 76655",
    },
  ]);

  const [newAddr, setNewAddr] = useState({
    tag: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Successfully logged out");
        window.location.href = "/";
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      setLoading(false);
      if (res.ok) {
        toast.success("Account profile updated successfully!");
        setPassword("");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Profile update failed");
      }
    } catch {
      setLoading(false);
      toast.error("Network error");
    }
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.tag || !newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zip) {
      toast.error("Please fill all required address fields");
      return;
    }
    setAddresses([
      ...addresses,
      {
        id: Date.now().toString(),
        ...newAddr,
      },
    ]);
    setNewAddr({ tag: "", street: "", city: "", state: "", zip: "", phone: "" });
    setShowAddForm(false);
    toast.success("Shipping address added!");
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Address removed successfully");
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24 font-['Inter',sans-serif]">
      <Navbar />

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Card Column: Profile Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-[#FAFAF9] border-2 border-[#C4973A] flex items-center justify-center text-2xl font-bold text-[#0E0E0D] shadow-inner mb-5 relative group">
              <span className="absolute inset-1 rounded-full border border-dashed border-[#C4973A]/40" />
              {getInitials(user.name)}
            </div>

            {/* Profile Meta Info */}
            <h2 className="text-xl font-semibold text-[#0E0E0D] mb-1">{user.name}</h2>
            <p className="text-xs text-[#9E9B97] mb-4 flex items-center gap-1.5">
              <Mail size={12} /> {user.email}
            </p>

            {/* Premium VIP status badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FAF6EE] text-[#C4973A] border border-[#F5EAD4] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-8">
              <Shield size={10} className="fill-current" /> VIP Gold Member
            </div>

            {/* Navigation Tabs List */}
            <div className="w-full space-y-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3.5 px-5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === "orders"
                    ? "bg-[#0E0E0D] text-white shadow-sm"
                    : "text-[#6B6966] hover:bg-[#F4F3F0] hover:text-[#0E0E0D]"
                }`}
              >
                <ShoppingBag size={14} /> Orders History
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3.5 px-5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === "addresses"
                    ? "bg-[#0E0E0D] text-white shadow-sm"
                    : "text-[#6B6966] hover:bg-[#F4F3F0] hover:text-[#0E0E0D]"
                }`}
              >
                <MapPin size={14} /> Addresses Book
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3.5 px-5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === "settings"
                    ? "bg-[#0E0E0D] text-white shadow-sm"
                    : "text-[#6B6966] hover:bg-[#F4F3F0] hover:text-[#0E0E0D]"
                }`}
              >
                <Settings size={14} /> Settings & Security
              </button>

              <div className="h-px bg-[#E8E6E1] my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              >
                <LogOut size={14} /> Logout Session
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area Column */}
        <div className="lg:col-span-8 bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-sm min-h-[500px]">
          {/* Order history Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-[#F4F3F0] pb-5 mb-5">
                <h3 className="font-['DM_Serif_Display'] text-2xl text-[#0E0E0D]">Order History</h3>
                <p className="text-xs text-[#9E9B97] mt-0.5 font-light">View and track all store purchases</p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="border border-[#E8E6E1] hover:border-[#6B6966] rounded-2xl p-5 transition-all bg-[#FAFAF9]"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-[#E8E6E1] pb-4 mb-4">
                      <div>
                        <div className="text-xs text-[#9E9B97] uppercase tracking-wider font-semibold">Order ID</div>
                        <div className="text-sm font-bold text-[#0E0E0D]">{o.orderNumber}</div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#6B6966]">
                          <Calendar size={13} className="text-[#C4973A]" />
                          <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                          <CheckCircle size={12} />
                          <span className="capitalize">{o.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-[10px] text-[#9E9B97] uppercase font-bold tracking-wider">Purchased Items</div>
                      {o.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs text-[#6B6966]">
                          <div className="flex items-center gap-2">
                            <Package size={12} className="text-[#C4973A]" />
                            <span>{item.name} <strong className="text-[#0E0E0D]">x{item.quantity}</strong></span>
                          </div>
                          <span className="font-semibold text-[#0E0E0D]">₹{(item.price / 100).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-[#E8E6E1] pt-3.5">
                      <span className="text-xs text-[#6B6966]">Total Price Paid</span>
                      <span className="text-base font-bold text-[#0E0E0D]">₹{(o.total / 100).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-20 bg-[#FAFAF9] rounded-2xl border border-dashed border-[#E8E6E1]">
                    <ShoppingBag size={32} className="mx-auto text-[#9E9B97] mb-3" />
                    <h4 className="text-sm font-semibold text-[#0E0E0D]">No purchases registered yet</h4>
                    <p className="text-xs text-[#9E9B97] mt-1 font-light max-w-xs mx-auto">Explore our new catalog editions and make your first transaction.</p>
                    <button
                      onClick={() => router.push("/products")}
                      className="mt-6 bg-[#0E0E0D] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#C4973A] transition-colors uppercase tracking-wider"
                    >
                      Shop Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Addresses Book Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#F4F3F0] pb-5 mb-5">
                <div>
                  <h3 className="font-['DM_Serif_Display'] text-2xl text-[#0E0E0D]">Address Book</h3>
                  <p className="text-xs text-[#9E9B97] mt-0.5 font-light">Set default shipping addresses</p>
                </div>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="h-9 px-4 bg-[#0E0E0D] text-white hover:bg-[#C4973A] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                )}
              </div>

              {/* Add form overlay/block */}
              {showAddForm && (
                <form onSubmit={addAddress} className="bg-[#FAFAF9] border border-[#E8E6E1] p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-bold text-[#0E0E0D] uppercase tracking-wider mb-2">New Address Form</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Tag label *</label>
                      <input
                        type="text"
                        placeholder="e.g. Home, Office"
                        value={newAddr.tag}
                        onChange={(e) => setNewAddr({ ...newAddr, tag: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 99999 99999"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Street Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apt / Suite / House number, Street name"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">State *</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Zip Code *</label>
                      <input
                        type="text"
                        placeholder="Zip"
                        value={newAddr.zip}
                        onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="h-10 px-5 border border-[#E8E6E1] text-[#6B6966] rounded-full text-xs font-semibold transition-colors hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-6 bg-[#0E0E0D] text-white hover:bg-[#C4973A] rounded-full text-xs font-semibold transition-colors uppercase tracking-wider"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-[#E8E6E1] rounded-2xl p-5 flex flex-col justify-between bg-[#FAFAF9]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-bold text-[#0E0E0D] uppercase tracking-wider">{addr.tag}</span>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-[#9E9B97] hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-[#6B6966] leading-relaxed mb-3">
                        {addr.street}
                        <br />
                        {addr.city}, {addr.state} - {addr.zip}
                      </p>
                    </div>
                    {addr.phone && (
                      <div className="text-[10px] font-semibold text-[#0E0E0D] pt-2 border-t border-[#E8E6E1] bg-transparent">
                        Phone: {addr.phone}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border-b border-[#F4F3F0] pb-5 mb-5">
                <h3 className="font-['DM_Serif_Display'] text-2xl text-[#0E0E0D]">Settings & Security</h3>
                <p className="text-xs text-[#9E9B97] mt-0.5 font-light">Manage your email settings and credential keys</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Full Name</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9B97]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A] transition-all text-[#0E0E0D]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9B97]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-[#F4F3F0] border border-[#E8E6E1] rounded-xl text-xs outline-none text-[#6B6966] cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <span className="text-[9px] text-[#9E9B97] mt-1 block">Authentication Email cannot be changed directly</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B6966] font-semibold block mb-1">Change Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A] transition-all text-[#0E0E0D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 bg-[#0E0E0D] text-white hover:bg-[#C4973A] rounded-full text-xs font-semibold transition-colors uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Configuration"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
