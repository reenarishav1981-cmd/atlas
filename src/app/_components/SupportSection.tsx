"use client";

import React, { useState } from "react";
import { Search, Tag, MessageSquare, Send, CheckCircle, Clock } from "lucide-react";

const MOCK_TICKETS = [
  {
    id: "ticket-1",
    ticketId: "#TIC-1024",
    name: "Rohan Sharma",
    subject: "Flickering screen on Meridian Chronograph watch",
    priority: "HIGH",
    status: "OPEN",
    messages: [
      { id: "m-1", senderName: "Rohan Sharma", message: "Hi support team, my Meridian Chronograph seems to have a slightly loose glass face that causes flickering shadows.", isInternal: false, time: "2 hours ago" },
      { id: "m-2", senderName: "Support Agent", message: "Needs checking with standard replacement inventory stock.", isInternal: true, time: "1 hour ago" }
    ]
  },
  {
    id: "ticket-2",
    ticketId: "#TIC-1025",
    name: "Priya Patel",
    subject: "Return address queries",
    priority: "LOW",
    status: "RESOLVED",
    messages: [
      { id: "m-3", senderName: "Priya Patel", message: "Can I drop off the return package at local hubs?", isInternal: false, time: "3 days ago" }
    ]
  }
];

export default function SupportSection() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>("ticket-1");
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [search, setSearch] = useState("");

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSendMessage = () => {
    if (!replyText || !activeTicket) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderName: isInternal ? "Support Agent (Note)" : "Support Response",
      message: replyText,
      isInternal,
      time: "Just now"
    };

    setTickets(tickets.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: isInternal ? t.status : "OPEN",
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    setReplyText("");
  };

  const handleToggleStatus = (id: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filtered = tickets.filter(t =>
    t.ticketId.includes(search) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#F4F3F0] p-6 gap-6 overflow-hidden">
      {/* Helpdesk ticket list */}
      <div className="w-[360px] bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#F4F3F0]">
          <h3 className="text-sm font-bold text-[#0A0A09] mb-3">Support Tickets Helpdesk</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              placeholder="Search by Ticket ID, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className={`w-full p-3 rounded-xl text-left transition-all border ${
                selectedTicketId === t.id
                  ? "bg-[#0A0A09] text-white border-transparent"
                  : "hover:bg-[#F4F3F0] text-gray-700 bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="text-xs">{t.ticketId}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  t.priority === "HIGH" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
                }`}>
                  {t.priority}
                </span>
              </div>
              <div className="text-[11px] truncate font-medium">{t.subject}</div>
              <div className={`text-[9px] mt-1.5 flex items-center gap-1 ${selectedTicketId === t.id ? "text-gray-300" : "text-gray-400"}`}>
                <span>{t.name}</span> · <span className="uppercase">{t.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket replies / chat threads view */}
      {activeTicket && (
        <div className="flex-1 bg-white rounded-2xl border border-[#E8E6E1] flex flex-col overflow-hidden shadow-sm animate-fade-in">
          {/* Header metadata summary */}
          <div className="p-6 border-b border-[#F4F3F0] flex items-center justify-between bg-gray-50/40">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{activeTicket.ticketId}</span>
              <h2 className="text-sm font-bold text-[#0A0A09] mt-0.5">{activeTicket.subject}</h2>
              <p className="text-xs text-gray-400 mt-1">Requester: {activeTicket.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeTicket.status}
                onChange={(e) => handleToggleStatus(activeTicket.id, e.target.value)}
                className="text-xs border border-[#E8E6E1] rounded-xl px-3 py-1.5 bg-white font-semibold text-[#0A0A09]"
              >
                <option value="OPEN">Status: Open</option>
                <option value="IN_PROGRESS">Status: In Progress</option>
                <option value="RESOLVED">Status: Resolved</option>
                <option value="CLOSED">Status: Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket Messages loop */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F4F3F0]/20">
            {activeTicket.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-sm space-y-1.5 ${
                  m.isInternal
                    ? "bg-amber-50 text-amber-900 border border-amber-200 ml-auto"
                    : "bg-white text-gray-700 mr-auto border border-[#E8E6E1]"
                }`}
              >
                <div className="flex items-center justify-between font-semibold gap-4">
                  <span className="text-[#0A0A09]">{m.senderName}</span>
                  {m.isInternal && <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded font-bold uppercase">Internal Note</span>}
                </div>
                <p className="leading-relaxed">{m.message}</p>
                <span className="text-[9px] text-gray-400 block pt-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Ticket Reply Form */}
          <div className="p-4 border-t border-[#F4F3F0] space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#0A0A09] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <span className="font-semibold text-amber-700">Internal Note memo</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                placeholder={isInternal ? "Write internal staff annotation..." : "Write customer response reply..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#C4973A]"
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-[#0A0A09] text-white rounded-xl hover:bg-[#C4973A] transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
