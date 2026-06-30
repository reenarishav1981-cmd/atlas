"use client";

import React, { useState } from "react";
import {
  Calendar, Download, ArrowUpRight, ArrowDownRight, Eye, Play, Sparkles,
  TrendingUp, RefreshCw, BarChart2, CheckCircle, HelpCircle, Layers, X, Plus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const MOCK_TIMELINE_DATA = [
  { name: "Mon", Revenue: 12000, Orders: 22 },
  { name: "Tue", Revenue: 19000, Orders: 34 },
  { name: "Wed", Revenue: 15000, Orders: 28 },
  { name: "Thu", Revenue: 22000, Orders: 41 },
  { name: "Fri", Revenue: 31000, Orders: 59 },
  { name: "Sat", Revenue: 27000, Orders: 51 },
  { name: "Sun", Revenue: 34000, Orders: 64 },
];

const MOCK_FUNNEL_DATA = [
  { stage: "Visitors", count: 4500, pct: 100 },
  { stage: "Product Views", count: 3100, pct: 68 },
  { stage: "Add To Cart", count: 1200, pct: 26 },
  { stage: "Checkout Started", count: 850, pct: 18 },
  { stage: "Purchased", count: 340, pct: 7.5 },
];

const MOCK_PRODUCT_METRICS = [
  { name: "Meridian Chronograph", sales: 142, revenue: 142000, conversion: "9.2%" },
  { name: "Suede Watch Strap", sales: 98, revenue: 29400, conversion: "6.4%" },
  { name: "Leather Travel Case", sales: 61, revenue: 42700, conversion: "4.8%" }
];

export default function AnalyticsSection() {
  const [range, setRange] = useState("Weekly");
  const [showAiForecast, setShowAiForecast] = useState(false);
  const [widgets, setWidgets] = useState([
    { id: "w-1", name: "Gross Revenue", value: "₹1,84,000", change: "+12.4%", type: "KPI" },
    { id: "w-2", name: "Total Orders", value: "299", change: "+8.2%", type: "KPI" },
    { id: "w-3", name: "Conversion Rate", value: "7.54%", change: "+1.8%", type: "KPI" },
    { id: "w-4", name: "Returning Customers", value: "48.2%", change: "+3.1%", type: "KPI" }
  ]);

  const handleExportCSV = () => {
    alert("Exporting analytics metrics report as CSV file.");
  };

  const handleHideWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleResetLayout = () => {
    setWidgets([
      { id: "w-1", name: "Gross Revenue", value: "₹1,84,000", change: "+12.4%", type: "KPI" },
      { id: "w-2", name: "Total Orders", value: "299", change: "+8.2%", type: "KPI" },
      { id: "w-3", name: "Conversion Rate", value: "7.54%", change: "+1.8%", type: "KPI" },
      { id: "w-4", name: "Returning Customers", value: "48.2%", change: "+3.1%", type: "KPI" }
    ]);
  };

  return (
    <div className="flex h-full bg-[#F4F3F0] overflow-hidden select-none">
      {/* ── MAIN ANALYTICS TILES ── */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Date Filters & Exporters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 border border-[#E8E6E1] p-0.5 bg-white rounded-xl shadow-sm">
            {["Daily", "Weekly", "Monthly", "Quarterly"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  range === r ? "bg-[#0A0A09] text-white" : "text-gray-500 hover:text-[#0A0A09]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiForecast(true)}
              className="bg-[#0A0A09] hover:bg-[#C4973A] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
            >
              <Sparkles size={13} /> AI Forecast Insights
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white border border-[#E8E6E1] hover:border-[#0A0A09] text-[#0A0A09] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download size={13} /> Export Report
            </button>
            <button onClick={handleResetLayout} className="text-xs text-gray-400 hover:text-gray-600 underline">Reset Grid</button>
          </div>
        </div>

        {/* Dynamic widgets grid */}
        <div className="grid grid-cols-4 gap-5">
          {widgets.map(w => (
            <div key={w.id} className="bg-white rounded-2xl p-5 border border-[#E8E6E1] shadow-sm relative group animate-fade-in">
              <button
                onClick={() => handleHideWidget(w.id)}
                className="absolute top-2 right-2 hidden group-hover:flex p-1 bg-[#F4F3F0] text-gray-400 hover:text-red-500 rounded-lg"
              >
                <X size={10} />
              </button>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{w.name}</span>
                <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                  <ArrowUpRight size={10} /> {w.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#0A0A09]">{w.value}</div>
            </div>
          ))}
        </div>

        {/* Analytics Charts layout */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm flex flex-col h-[300px]">
            <h4 className="text-xs font-bold text-[#0A0A09] uppercase tracking-wider mb-4 flex items-center gap-1.5"><TrendingUp size={13} /> Sales Trend Line</h4>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TIMELINE_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4973A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C4973A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F3F0" />
                  <XAxis dataKey="name" stroke="#9E9B97" fontSize={10} />
                  <YAxis stroke="#9E9B97" fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Revenue" stroke="#C4973A" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Checkout funnel visualization */}
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm flex flex-col h-[300px]">
            <h4 className="text-xs font-bold text-[#0A0A09] uppercase tracking-wider mb-4 flex items-center gap-1.5"><Layers size={13} /> Checkout Conversion Funnel</h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {MOCK_FUNNEL_DATA.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#0A0A09]">{item.stage}</span>
                    <span className="text-gray-400">{item.count} sessions ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-[#F4F3F0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0A0A09] h-full rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product performance metrics */}
        <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#F4F3F0]">
            <h4 className="text-xs font-bold text-[#0A0A09] uppercase tracking-wider flex items-center gap-1.5"><BarChart2 size={13} /> Product Performance Rankings</h4>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider border-b border-[#F4F3F0] bg-gray-50/50">
                <th className="px-5 py-3">Product Item</th>
                <th>Sales Count</th>
                <th>Revenue (Gross)</th>
                <th>CR Rate</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PRODUCT_METRICS.map((p, idx) => (
                <tr key={idx} className="border-b border-[#F4F3F0] last:border-0 hover:bg-[#F4F3F0]/20">
                  <td className="px-5 py-3 font-semibold text-[#0A0A09]">{p.name}</td>
                  <td>{p.sales} units</td>
                  <td>₹{p.revenue.toLocaleString()}</td>
                  <td className="font-semibold text-[#C4973A]">{p.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── RIGHT DRAWER: AI INTELLIGENT INSIGHTS ── */}
      {showAiForecast && (
        <aside className="w-[320px] border-l border-[#E8E6E1] bg-white flex flex-col h-full overflow-hidden animate-slide-in">
          <div className="p-4 border-b border-[#F4F3F0] flex items-center justify-between bg-[#C4973A]/5">
            <div className="flex items-center gap-1.5 text-[#C4973A] font-bold text-xs uppercase tracking-wider">
              <Sparkles size={14} /> AI Predictive Studio
            </div>
            <button onClick={() => setShowAiForecast(false)} className="text-gray-400 hover:text-[#0A0A09]"><X size={15} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-2 bg-[#F4F3F0]/30 p-4 border border-[#E8E6E1] rounded-2xl text-xs leading-relaxed text-gray-700">
              <h5 className="font-bold text-[#0A0A09] flex items-center gap-1"><CheckCircle size={12} className="text-green-600" /> Sales Forecast Trend</h5>
              <p>Based on last 4 weeks volume, gross revenues are projected to increase by <b>8.4%</b> next weekend due to monsoon season conversions.</p>
            </div>

            <div className="space-y-2 bg-[#F4F3F0]/30 p-4 border border-[#E8E6E1] rounded-2xl text-xs leading-relaxed text-gray-700">
              <h5 className="font-bold text-[#0A0A09] flex items-center gap-1"><CheckCircle size={12} className="text-green-600" /> Inventory Restock Warning</h5>
              <p><b>Meridian Chronograph</b> watches are projected to stockout in 6 days. Recommended re-order quantity: 50 units.</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
