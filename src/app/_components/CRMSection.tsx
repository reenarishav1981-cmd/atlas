"use client";

import React, { useState } from "react";
import { Search, Tag, User, Clock, FileText, ChevronRight, Sliders } from "lucide-react";

// Mock customer list for premium UI rendering
const MOCK_CUSTOMERS = [
  {
    id: "user-1",
    name: "Rohan Sharma",
    email: "rohan@domain.com",
    role: "CUSTOMER",
    tags: ["VIP", "High-Value"],
    segments: ["All Customers", "High Spenders"],
    notes: "Requires wooden box premium packaging on orders.",
    timeline: [
      { action: "Order Placed", time: "2 hours ago", desc: "Placed order #ORD-1002" },
      { action: "Wallet Credit", time: "1 day ago", desc: "Earned 120 points on purchase" },
      { action: "Ticket Created", time: "3 days ago", desc: "Created support ticket regarding shipping" }
    ]
  },
  {
    id: "user-2",
    name: "Priya Patel",
    email: "priya@domain.com",
    role: "CUSTOMER",
    tags: ["Regular"],
    segments: ["All Customers"],
    notes: "Prefers evening home delivery.",
    timeline: [
      { action: "Profile Updated", time: "5 days ago", desc: "Updated primary shipping address" }
    ]
  }
];

export default function CRMSection() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>("user-1");
  const [newTag, setNewTag] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleAddTag = () => {
    if (!newTag || !activeCustomer) return;
    setCustomers(customers.map(c => {
      if (c.id === activeCustomer.id && !c.tags.includes(newTag)) {
        return { ...c, tags: [...c.tags, newTag] };
      }
      return c;
    }));
    setNewTag("");
  };

  const handleSaveNotes = () => {
    if (!activeCustomer) return;
    setCustomers(customers.map(c => {
      if (c.id === activeCustomer.id) {
        return { ...c, notes: noteInput };
      }
      return c;
    }));
    alert("Customer note saved successfully.");
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#F4F3F0] p-6 gap-6 overflow-hidden">
      {/* Customer list column */}
      <div className="w-[380px] bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#F4F3F0]">
          <h3 className="text-sm font-bold text-[#0A0A09] mb-3">Customer Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCustomerId(c.id);
                setNoteInput(c.notes);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                selectedCustomerId === c.id ? "bg-[#0A0A09] text-white" : "hover:bg-[#F4F3F0] text-gray-700"
              }`}
            >
              <div>
                <div className="text-xs font-semibold">{c.name}</div>
                <div className={`text-[10px] ${selectedCustomerId === c.id ? "text-gray-300" : "text-gray-400"}`}>{c.email}</div>
              </div>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Customer profile details drawer view */}
      {activeCustomer && (
        <div className="flex-1 bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm animate-fade-in">
          <div className="p-6 border-b border-[#F4F3F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F4F3F0] rounded-full flex items-center justify-center text-[#C4973A]">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0A0A09]">{activeCustomer.name}</h2>
                <p className="text-xs text-gray-400">{activeCustomer.email} · {activeCustomer.role}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
            {/* Notes & tags edit panel */}
            <div className="space-y-6 border-r border-[#F4F3F0] pr-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5"><FileText size={12} /> CRM Profile Notes</h4>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full h-24 border border-[#E8E6E1] rounded-xl p-3 text-xs outline-none focus:border-[#C4973A]"
                  placeholder="Add specific details or customer preferences..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 text-xs bg-[#0A0A09] hover:bg-[#C4973A] text-white font-semibold px-4 py-1.5 rounded-xl transition-all"
                >
                  Save Note
                </button>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5"><Tag size={12} /> Segmentation Tags</h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activeCustomer.tags.map(t => (
                    <span key={t} className="bg-[#F4F3F0] text-gray-600 text-[10px] px-2 py-0.5 rounded-lg border border-[#E8E6E1]">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="New tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#C4973A]"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-xs bg-[#0A0A09] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#C4973A]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline log events */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-4 flex items-center gap-1.5"><Clock size={12} /> Activity History Timeline</h4>
                <div className="relative border-l border-gray-100 pl-4 space-y-4">
                  {activeCustomer.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#C4973A]" />
                      <div className="text-xs font-semibold text-[#0A0A09]">{item.action}</div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                      <span className="text-[9px] text-gray-300 block mt-1">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
