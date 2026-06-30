"use client";

import React, { useState } from "react";
import { Search, DollarSign, Award, ArrowDownRight, ArrowUpRight, ShieldAlert } from "lucide-react";

const MOCK_WALLETS = [
  {
    id: "user-1",
    name: "Rohan Sharma",
    email: "rohan@domain.com",
    balance: 450.0,
    loyaltyPoints: 340,
    transactions: [
      { id: "tx-1", type: "CREDIT", amount: 150.0, points: 50, desc: "Sign-up welcome rewards and giftcard claim", date: "June 28, 2026" },
      { id: "tx-2", type: "CREDIT", amount: 300.0, points: 290, desc: "Accrued loyalty points on order #ORD-1002", date: "June 29, 2026" }
    ]
  },
  {
    id: "user-2",
    name: "Priya Patel",
    email: "priya@domain.com",
    balance: 0.0,
    loyaltyPoints: 10,
    transactions: []
  }
];

export default function WalletSection() {
  const [wallets, setWallets] = useState(MOCK_WALLETS);
  const [search, setSearch] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>("user-1");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustType, setAdjustType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustDesc, setAdjustDesc] = useState("");

  const activeWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  const handleAdjustBalance = () => {
    const parsedAmt = parseFloat(adjustAmount);
    if (isNaN(parsedAmt) || !activeWallet) return;

    const multiplier = adjustType === "CREDIT" ? 1 : -1;
    const finalAmount = parsedAmt * multiplier;

    setWallets(wallets.map(w => {
      if (w.id === activeWallet.id) {
        return {
          ...w,
          balance: Math.max(0, w.balance + finalAmount),
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: adjustType,
              amount: finalAmount,
              points: 0,
              desc: adjustDesc || "Administrative adjustments",
              date: new Date().toLocaleDateString()
            },
            ...(w.transactions || [])
          ]
        };
      }
      return w;
    }));

    setAdjustAmount("");
    setAdjustDesc("");
    alert("Store credits adjusted successfully.");
  };

  const handleAdjustPoints = () => {
    const parsedPts = parseInt(adjustPoints);
    if (isNaN(parsedPts) || !activeWallet) return;

    const multiplier = adjustType === "CREDIT" ? 1 : -1;
    const finalPoints = parsedPts * multiplier;

    setWallets(wallets.map(w => {
      if (w.id === activeWallet.id) {
        return {
          ...w,
          loyaltyPoints: Math.max(0, w.loyaltyPoints + finalPoints),
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: adjustType,
              amount: 0.0,
              points: finalPoints,
              desc: adjustDesc || "Administrative points adjustments",
              date: new Date().toLocaleDateString()
            },
            ...(w.transactions || [])
          ]
        };
      }
      return w;
    }));

    setAdjustPoints("");
    setAdjustDesc("");
    alert("Loyalty reward points adjusted successfully.");
  };

  const filtered = wallets.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#F4F3F0] p-6 gap-6 overflow-hidden">
      {/* Wallet customer list column */}
      <div className="w-[360px] bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#F4F3F0]">
          <h3 className="text-sm font-bold text-[#0A0A09] mb-3">Loyalty Wallets</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              placeholder="Search customer wallets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWalletId(w.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                selectedWalletId === w.id ? "bg-[#0A0A09] text-white" : "hover:bg-[#F4F3F0] text-gray-700"
              }`}
            >
              <div>
                <div className="text-xs font-semibold">{w.name}</div>
                <div className={`text-[10px] ${selectedWalletId === w.id ? "text-gray-300" : "text-gray-400"}`}>{w.email}</div>
              </div>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      </div>

      {/* Wallet action inspector layout */}
      {activeWallet && (
        <div className="flex-1 bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm animate-fade-in">
          {/* Header Summary Info */}
          <div className="p-6 border-b border-[#F4F3F0] grid grid-cols-2 gap-4 bg-gray-50/50">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8E6E1]">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Store Balance</span>
                <span className="text-lg font-bold text-[#0A0A09]">₹{activeWallet.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8E6E1]">
              <div className="w-10 h-10 bg-[#C4973A]/10 text-[#C4973A] rounded-xl flex items-center justify-center">
                <Award size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Loyalty Reward Points</span>
                <span className="text-lg font-bold text-[#0A0A09]">{activeWallet.loyaltyPoints} PTS</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
            {/* Ledger Transactions Logs list */}
            <div className="space-y-4 border-r border-[#F4F3F0] pr-6">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Transaction Ledger Logs</h4>
              <div className="space-y-3 h-[250px] overflow-y-auto pr-2">
                {activeWallet.transactions.map((tx) => (
                  <div key={tx.id} className="p-3 border border-[#E8E6E1] rounded-xl bg-white space-y-1.5 shadow-sm text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate pr-2">{tx.desc}</span>
                      <span className={tx.type === "CREDIT" ? "text-green-600" : "text-red-500"}>
                        {tx.type === "CREDIT" ? "+" : "-"}
                        {tx.amount > 0 ? `₹${Math.abs(tx.amount)}` : `${Math.abs(tx.points)} PTS`}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 block">{tx.date}</span>
                  </div>
                ))}
                {activeWallet.transactions.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-12">No transactions recorded yet.</p>
                )}
              </div>
            </div>

            {/* Adjustments Form */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1.5"><ShieldAlert size={12} /> Manual Ledger Actions</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustType("CREDIT")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${adjustType === "CREDIT" ? "bg-green-600 text-white" : "bg-[#F4F3F0] text-gray-600"}`}
                  >
                    Credit Balance
                  </button>
                  <button
                    onClick={() => setAdjustType("DEBIT")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${adjustType === "DEBIT" ? "bg-red-500 text-white" : "bg-[#F4F3F0] text-gray-600"}`}
                  >
                    Debit Balance
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase text-gray-400 mb-1">Adjust Cash (₹)</label>
                    <input
                      placeholder="0.00"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <button
                      onClick={handleAdjustBalance}
                      className="w-full mt-1.5 text-[10px] bg-[#0A0A09] text-white py-1.5 rounded-xl font-bold hover:bg-[#C4973A]"
                    >
                      Apply Credits
                    </button>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase text-gray-400 mb-1">Adjust Points (PTS)</label>
                    <input
                      placeholder="0"
                      value={adjustPoints}
                      onChange={(e) => setAdjustPoints(e.target.value)}
                      className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <button
                      onClick={handleAdjustPoints}
                      className="w-full mt-1.5 text-[10px] bg-[#0A0A09] text-white py-1.5 rounded-xl font-bold hover:bg-[#C4973A]"
                    >
                      Apply Points
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-gray-400 mb-1">Adjustment Memo Note</label>
                  <input
                    placeholder="Provide reason for balance modification..."
                    value={adjustDesc}
                    onChange={(e) => setAdjustDesc(e.target.value)}
                    className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
