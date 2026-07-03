"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Smartphone, Tablet, Monitor, Undo, Redo, Save, Trash2, Copy,
  ArrowUp, ArrowDown, Search, HelpCircle, Eye, EyeOff, Lock, Unlock,
  Image, Layers, Play, Calendar, Sliders, Layout, RefreshCw, AlertCircle,
  ChevronDown, ChevronRight, Menu, Check, FileText, History, Settings,
  Zap, Info, Share2, HelpCircle as HelpIcon, ArrowRightLeft, Sparkles
} from "lucide-react";
import { BlockInstance } from "@/lib/types/blocks";
import BlockRenderer from "@/components/BlockRenderer";

const AVAILABLE_BLOCK_TEMPLATES = [
  {
    type: "hero",
    name: "Hero Section",
    category: "Hero",
    description: "Large banner section with headings, buttons, and image.",
    defaultData: {
      badgeText: "New Collection",
      headingLine1: "Elevate your space.",
      headingLine2: "Authentic design.",
      subtitle: "Discover products crafted by artisans, delivered straight to your home.",
      imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900",
      ctaPrimaryText: "Shop Now",
      ctaPrimaryUrl: "/products",
    }
  },
  {
    type: "announcement",
    name: "Announcement Bar",
    category: "Utility",
    description: "Alert bar for key messages or free shipping announcements.",
    defaultData: {
      text: "Free shipping on orders above ₹999",
      bgColor: "#0A0A09",
      textColor: "#FFFFFF"
    }
  },
  {
    type: "rich-text",
    name: "Rich Text Header",
    category: "Content",
    description: "Paragraph headings or brand narrative details.",
    defaultData: {
      title: "Our Philosophy",
      body: "<p>We prioritize materials, authentic craftsmanship, and structural durability in every product.</p>",
      align: "center"
    }
  },
  {
    type: "faq",
    name: "FAQ Accordion",
    category: "Utility",
    description: "Drop-down items for common queries and answers.",
    defaultData: {
      title: "Help Center",
      items: [
        { question: "What is your return policy?", answer: "We offer 30-day returns." },
        { question: "How long does shipping take?", answer: "Shipping takes 3-5 days." }
      ]
    }
  },
  {
    type: "countdown",
    name: "Countdown Timer",
    category: "Marketing",
    description: "Ticking clock banner to drive conversions.",
    defaultData: {
      title: "Flash Sale Ending In",
      endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      bgColor: "#F4F3F0"
    }
  },
  {
    type: "newsletter",
    name: "Newsletter Form",
    category: "Marketing",
    description: "Email collector block.",
    defaultData: {
      title: "Join the Club",
      subtitle: "Stay updated on product launches and early sale access.",
      buttonText: "Subscribe"
    }
  },
  {
    type: "categories-grid",
    name: "Categories Showcase",
    category: "Commerce",
    description: "Horizontal scroll list of active categories.",
    defaultData: { title: "Shop by Category" }
  },
  {
    type: "products-grid",
    name: "Products Showcase",
    category: "Commerce",
    description: "Grid of trending product catalog items.",
    defaultData: { title: "Trending Now", limit: "4" }
  },
  {
    type: "brand-story",
    name: "Brand Story Quote",
    category: "Content",
    description: "Full-width quote and editorial description block.",
    defaultData: { quote: "We did not set out to build a marketplace. We set out to build a standard.", body: "ATLAS was founded on a belief that the commerce experience itself should feel elevated." }
  },
  {
    type: "reviews",
    name: "Customer Testimonials",
    category: "Marketing",
    description: "Verified customer reviews cards layout.",
    defaultData: { title: "What our customers say" }
  },
  {
    type: "footer",
    name: "Storefront Footer",
    category: "Utility",
    description: "Responsive footer brand metadata and copyright.",
    defaultData: { siteName: "ATLAS", description: "Commerce, elevated. The platform for brands that refuse to compromise." }
  }
];

interface SymbolDefinition {
  id: string;
  name: string;
  type: string;
  content: any;
}

interface VersionLog {
  version: number;
  status: string;
  notes: string;
  blocks: BlockInstance[];
  updatedBy: string;
  timestamp: string;
}

export default function VisualBuilder() {
  const [blocks, setBlocks] = useState<BlockInstance[]>([
    {
      id: "ann-1",
      type: "announcement",
      name: "Header Announcement",
      isActive: true,
      sortOrder: 0,
      customCssClass: "",
      content: { text: "Free shipping on orders above ₹999 · Custom styling live now", bgColor: "#0A0A09", textColor: "#FFFFFF" },
      layoutSettings: { paddingTop: "py-2", paddingBottom: "py-2", maxWidth: "full-width", animate: false, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "hero-1",
      type: "hero",
      name: "Main Banner Hero",
      isActive: true,
      sortOrder: 1,
      customCssClass: "",
      content: {
        badgeText: "Crafted with Precision",
        headingLine1: "Design. Elevated.",
        headingLine2: "Built to Last.",
        subtitle: "Authentic wood carvings and custom frames. Perfect addition to modern living spaces.",
        imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900",
        ctaPrimaryText: "Shop Collection",
        ctaPrimaryUrl: "/products"
      },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "cats-1",
      type: "categories-grid",
      name: "Categories Showcase",
      isActive: true,
      sortOrder: 2,
      customCssClass: "",
      content: { title: "Shop by Category" },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "full-width", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "prods-1",
      type: "products-grid",
      name: "Products Showcase",
      isActive: true,
      sortOrder: 3,
      customCssClass: "",
      content: { title: "Trending Now", limit: "4" },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "story-1",
      type: "brand-story",
      name: "Brand Story Quote",
      isActive: true,
      sortOrder: 4,
      customCssClass: "",
      content: { quote: "We did not set out to build a marketplace. We set out to build a standard.", body: "ATLAS was founded on a belief that the commerce experience itself should feel elevated." },
      layoutSettings: { paddingTop: "py-16", paddingBottom: "py-16", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "revs-1",
      type: "reviews",
      name: "Customer Testimonials",
      isActive: true,
      sortOrder: 5,
      customCssClass: "",
      content: { title: "What our customers say" },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    },
    {
      id: "foot-1",
      type: "footer",
      name: "Storefront Footer",
      isActive: true,
      sortOrder: 6,
      customCssClass: "",
      content: { siteName: "ATLAS", description: "Commerce, elevated. The platform for brands that refuse to compromise." },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "full-width", animate: false, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    }
  ]);

  // Core visual state systems
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(["hero-1"]);
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [previewCategories, setPreviewCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then((r) => r.json())
      .then((d) => setPreviewProducts(d.items || []))
      .catch(() => {});
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setPreviewCategories(d.categories || []))
      .catch(() => {});
  }, []);
  const [lockedBlocks, setLockedBlocks] = useState<string[]>([]);
  const [history, setHistory] = useState<BlockInstance[][]>([[...blocks]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [responsiveMode, setResponsiveMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Global Symbols & Instances
  const [globalSymbols, setGlobalSymbols] = useState<SymbolDefinition[]>([]);
  const [linkedSymbolIds, setLinkedSymbolIds] = useState<Record<string, string>>({}); // blockId -> symbolId

  // Responsive overrides state mapping: blockId -> mode -> content/layoutSettings overrides
  const [responsiveOverrides, setResponsiveOverrides] = useState<Record<string, Record<string, any>>>({});
  const [overrideTargetMode, setOverrideTargetMode] = useState<"desktop" | "mobile">("desktop");

  // Animations configuration state: blockId -> animation values
  const [animationSettings, setAnimationSettings] = useState<Record<string, { preset: string; delay: number; duration: number; viewportTrigger: boolean }>>({});

  // Publishing history
  const [publishHistory, setPublishHistory] = useState<VersionLog[]>([
    {
      version: 1,
      status: "PUBLISHED",
      notes: "Initial launch layout config",
      blocks: [],
      updatedBy: "Admin Builder",
      timestamp: new Date(Date.now() - 86400000).toLocaleString()
    }
  ]);
  const [pageStatus, setPageStatus] = useState<"DRAFT" | "PUBLISHED" | "REVIEW" | "SCHEDULED">("DRAFT");
  const [publishNote, setPublishNote] = useState("");

  const [activeTab, setActiveTab] = useState<"blocks" | "hierarchy" | "symbols" | "versions">("blocks");
  const [draggingBlockIndex, setDraggingBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  const selectedBlockId = selectedBlockIds[0] || null;
  const selectedBlock = useMemo(() => {
    const raw = blocks.find(b => b.id === selectedBlockId);
    if (!raw) return null;

    // Apply responsive override adjustments for visual display if preview mode is mobile
    if (responsiveMode === "mobile" && responsiveOverrides[raw.id]?.mobile) {
      return {
        ...raw,
        content: { ...raw.content, ...responsiveOverrides[raw.id].mobile.content },
        layoutSettings: { ...raw.layoutSettings, ...responsiveOverrides[raw.id].mobile.layoutSettings }
      };
    }
    return raw;
  }, [blocks, selectedBlockId, responsiveMode, responsiveOverrides]);

  // Load symbols and overrides from storage on mount
  useEffect(() => {
    const savedSymbols = localStorage.getItem("titan_global_symbols");
    if (savedSymbols) {
      setGlobalSymbols(JSON.parse(savedSymbols));
    }
    const savedOverrides = localStorage.getItem("titan_responsive_overrides");
    if (savedOverrides) {
      setResponsiveOverrides(JSON.parse(savedOverrides));
    }
    const savedAnims = localStorage.getItem("titan_animations_settings");
    if (savedAnims) {
      setAnimationSettings(JSON.parse(savedAnims));
    }
  }, []);

  // Load initial page blocks from database on mount
  useEffect(() => {
    async function loadCMSData() {
      try {
        const res = await fetch("/api/admin/cms?slug=home");
        const data = await res.json();
        if (data.page && data.page.content) {
          const loadedBlocks = data.page.content as BlockInstance[];
          if (loadedBlocks.length > 0) {
            setBlocks(loadedBlocks);
            setHistory([loadedBlocks]);
            setHistoryIndex(0);
          }
          if (data.page.versions && data.page.versions.length > 0) {
            const historyLogs = data.page.versions.map((v: any) => ({
              version: v.version,
              status: "PUBLISHED",
              notes: v.title,
              blocks: v.content,
              updatedBy: v.createdByName,
              timestamp: new Date(v.createdAt).toLocaleString(),
            }));
            setPublishHistory(historyLogs);
          }
        }
      } catch (err) {
        console.error("Failed to load CMS data from DB:", err);
      }
    }
    loadCMSData();
  }, []);

  // Developer APIs & Analytics hooks
  useEffect(() => {
    (window as any).TitanBuilderAPI = {
      getBlocks: () => blocks,
      addBlock: (type: string) => handleAddBlock(type),
      deleteBlock: (id: string) => handleDelete(id),
      getGlobalSymbols: () => globalSymbols,
      createGlobalSymbol: (blockId: string, name: string) => handleCreateSymbol(blockId, name),
      triggerAnalytics: (blockId: string, event: "viewed" | "clicked" | "converted") => {
        console.log(`[Titan Analytics] Block ID ${blockId} triggered event: ${event}`);
      }
    };
    return () => {
      delete (window as any).TitanBuilderAPI;
    };
  }, [blocks, globalSymbols]);

  // Debounced Auto-Save
  useEffect(() => {
    if (!isDirty) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem("titan_builder_draft_home", JSON.stringify(blocks));
      localStorage.setItem("titan_responsive_overrides", JSON.stringify(responsiveOverrides));
      localStorage.setItem("titan_animations_settings", JSON.stringify(animationSettings));
      setIsDirty(false);
      setIsSaving(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [blocks, responsiveOverrides, animationSettings, isDirty]);

  // Layout check errors generator (Smart Layout Assistant)
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    blocks.forEach((block) => {
      if (!block.isActive) {
        warnings.push(`[${block.name}] section is hidden from viewers.`);
      }
      if (block.content.imageUrl === "") {
        warnings.push(`[${block.name}] has no image asset set.`);
      }
      if (block.type === "hero" && !block.content.ctaPrimaryUrl) {
        warnings.push(`[${block.name}] missing primary click CTA destination URL link.`);
      }
    });

    const blockIds = blocks.map(b => b.id);
    const hasDuplicates = blockIds.some((val, i) => blockIds.indexOf(val) !== i);
    if (hasDuplicates) {
      warnings.push("Canvas contains duplicate block identifier IDs.");
    }
    return warnings;
  }, [blocks]);

  const handleSelectBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey || e.ctrlKey) {
      if (selectedBlockIds.includes(id)) {
        setSelectedBlockIds(selectedBlockIds.filter(item => item !== id));
      } else {
        setSelectedBlockIds([...selectedBlockIds, id]);
      }
    } else {
      setSelectedBlockIds([id]);
    }
  };

  const recordHistory = (newBlocks: BlockInstance[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, [...newBlocks]]);
    setHistoryIndex(updatedHistory.length);
    setIsDirty(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks([...history[historyIndex - 1]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks([...history[historyIndex + 1]]);
    }
  };

  // Drag and Drop ordering handler
  const handleDragStart = (idx: number) => {
    setDraggingBlockIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverBlockIndex(idx);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggingBlockIndex === null) return;

    const updated = [...blocks];
    const draggedItem = updated[draggingBlockIndex];
    updated.splice(draggingBlockIndex, 1);
    updated.splice(targetIdx, 0, draggedItem);

    const normalized = updated.map((b, idx) => ({ ...b, sortOrder: idx }));
    setBlocks(normalized);
    recordHistory(normalized);

    setDraggingBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  // Global Symbols implementation
  const handleCreateSymbol = (blockId: string, name: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newSymbol: SymbolDefinition = {
      id: `symbol-${Date.now()}`,
      name,
      type: block.type,
      content: { ...block.content }
    };

    const updatedSymbols = [...globalSymbols, newSymbol];
    setGlobalSymbols(updatedSymbols);
    localStorage.setItem("titan_global_symbols", JSON.stringify(updatedSymbols));

    setLinkedSymbolIds({
      ...linkedSymbolIds,
      [blockId]: newSymbol.id
    });
  };

  const handleDetachSymbol = (blockId: string) => {
    const updated = { ...linkedSymbolIds };
    delete updated[blockId];
    setLinkedSymbolIds(updated);
  };

  // Updates parameters
  const handleUpdateBlockContent = (key: string, value: any) => {
    if (!selectedBlockId || lockedBlocks.includes(selectedBlockId)) return;

    if (overrideTargetMode === "mobile") {
      // Apply responsive overrides specifically for mobile
      const blockOverrides = responsiveOverrides[selectedBlockId] || {};
      const mobileOverrides = blockOverrides.mobile || { content: {}, layoutSettings: {} };

      const updated = {
        ...responsiveOverrides,
        [selectedBlockId]: {
          ...blockOverrides,
          mobile: {
            ...mobileOverrides,
            content: { ...mobileOverrides.content, [key]: value }
          }
        }
      };
      setResponsiveOverrides(updated);
      setIsDirty(true);
      return;
    }

    // Default global change
    const updated = blocks.map((b) => {
      if (b.id === selectedBlockId) {
        const symbolId = linkedSymbolIds[b.id];
        if (symbolId) {
          // Propagate change to all other instances of this symbol
          setGlobalSymbols(globalSymbols.map(s => s.id === symbolId ? { ...s, content: { ...s.content, [key]: value } } : s));
        }
        return { ...b, content: { ...b.content, [key]: value } };
      }
      return b;
    });

    // Update other instances linked to the same symbol
    const targetSymbolId = linkedSymbolIds[selectedBlockId];
    const finalBlocks = updated.map((b) => {
      if (linkedSymbolIds[b.id] === targetSymbolId && b.id !== selectedBlockId) {
        return { ...b, content: { ...b.content, [key]: value } };
      }
      return b;
    });

    setBlocks(finalBlocks);
    recordHistory(finalBlocks);
  };

  const handleUpdateBlockSettings = (field: string, key: string, value: any) => {
    if (!selectedBlockId || lockedBlocks.includes(selectedBlockId)) return;

    if (overrideTargetMode === "mobile") {
      const blockOverrides = responsiveOverrides[selectedBlockId] || {};
      const mobileOverrides = blockOverrides.mobile || { content: {}, layoutSettings: {} };

      const updated = {
        ...responsiveOverrides,
        [selectedBlockId]: {
          ...blockOverrides,
          mobile: {
            ...mobileOverrides,
            layoutSettings: { ...mobileOverrides.layoutSettings, [key]: value }
          }
        }
      };
      setResponsiveOverrides(updated);
      setIsDirty(true);
      return;
    }

    const updated = blocks.map((b) => {
      if (b.id === selectedBlockId) {
        const group = (b as any)[field] || {};
        return { ...b, [field]: { ...group, [key]: value } };
      }
      return b;
    });
    setBlocks(updated);
    recordHistory(updated);
  };

  // Add block
  const handleAddBlock = (type: string) => {
    const template = AVAILABLE_BLOCK_TEMPLATES.find(t => t.type === type);
    if (!template) return;

    const newBlock: BlockInstance = {
      id: `${type}-${Date.now()}`,
      type: template.type,
      name: `${template.name} (${blocks.length + 1})`,
      isActive: true,
      sortOrder: blocks.length,
      customCssClass: "",
      content: { ...template.defaultData },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    };

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setSelectedBlockIds([newBlock.id]);
    recordHistory(updated);
  };

  const handleDelete = (id: string) => {
    if (lockedBlocks.includes(id)) return;
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    if (selectedBlockIds.includes(id)) {
      setSelectedBlockIds(updated[0] ? [updated[0].id] : []);
    }
    recordHistory(updated);
  };

  const handleDuplicate = (block: BlockInstance) => {
    const newBlock: BlockInstance = {
      ...JSON.parse(JSON.stringify(block)),
      id: `${block.type}-${Date.now()}`,
      name: `${block.name} (Copy)`
    };
    const index = blocks.findIndex(b => b.id === block.id);
    const updated = [...blocks];
    updated.splice(index + 1, 0, newBlock);

    const normalized = updated.map((b, idx) => ({ ...b, sortOrder: idx }));
    setBlocks(normalized);
    setSelectedBlockIds([newBlock.id]);
    recordHistory(normalized);
  };

  const handleToggleLock = (id: string) => {
    if (lockedBlocks.includes(id)) {
      setLockedBlocks(lockedBlocks.filter(bId => bId !== id));
    } else {
      setLockedBlocks([...lockedBlocks, id]);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBlocks(updated);
    recordHistory(updated);
  };

  const handleSaveAsTemplate = (block: BlockInstance) => {
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: `${block.name} Template`,
      type: block.type,
      content: { ...block.content }
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem("titan_saved_templates", JSON.stringify(updated));
  };

  const handleApplyTemplate = (template: any) => {
    const newBlock: BlockInstance = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      name: `${template.name} Instance`,
      isActive: true,
      sortOrder: blocks.length,
      customCssClass: "",
      content: { ...template.content },
      layoutSettings: { paddingTop: "py-12", paddingBottom: "py-12", maxWidth: "container", animate: true, theme: "default" },
      visibility: { scheduledStart: null, scheduledEnd: null, deviceVisibility: "ALL", userSegmentId: null, abTestGroup: null }
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setSelectedBlockIds([newBlock.id]);
    recordHistory(updated);
  };

  const handlePublishPage = async () => {
    setIsSaving(true);
    const nextVer = publishHistory.length + 1;
    const notes = publishNote || `Published layout iteration ${nextVer}`;
    
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Homepage Layout",
          slug: "home",
          content: blocks,
          status: "PUBLISHED",
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const newLog: VersionLog = {
        version: nextVer,
        status: "PUBLISHED",
        notes,
        blocks: [...blocks],
        updatedBy: "Admin Builder",
        timestamp: new Date().toLocaleString()
      };
      setPublishHistory([newLog, ...publishHistory]);
      setPageStatus("PUBLISHED");
      setPublishNote("");
      setIsDirty(false);
      alert("✓ Layout published successfully to database!");
    } catch (err: any) {
      console.error("Failed to publish page to database:", err);
      alert(`Error publishing layout: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollbackVersion = (log: VersionLog) => {
    if (log.blocks.length > 0) {
      setBlocks([...log.blocks]);
      recordHistory(log.blocks);
    }
  };

  const filteredTemplates = AVAILABLE_BLOCK_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-60px)] bg-[#F4F3F0] overflow-hidden select-none">
      {/* ── LEFT SIDEBAR: EXPERIMENTAL WORKSPACE TABS ── */}
      <aside className="w-[300px] border-r border-[#E8E6E1] bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-[#F4F3F0] grid grid-cols-4 gap-1 bg-[#F4F3F0]/30">
          {[
            { id: "blocks", label: "Library" },
            { id: "hierarchy", label: "Outline" },
            { id: "symbols", label: "Symbols" },
            { id: "versions", label: "History" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all truncate px-1 ${
                activeTab === tab.id
                  ? "bg-[#0A0A09] text-white"
                  : "bg-white text-gray-500 hover:text-[#0A0A09] border border-[#E8E6E1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab body items */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "blocks" && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input
                  placeholder="Filter elements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#E8E6E1] rounded-xl text-xs outline-none focus:border-[#C4973A]"
                />
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Layout Sections</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.type}
                      onClick={() => handleAddBlock(template.type)}
                      className="w-full flex items-start gap-3 p-3 border border-[#E8E6E1] hover:border-[#C4973A] rounded-2xl text-left hover:shadow-md transition-all duration-300 bg-white"
                    >
                      <div className="w-8 h-8 bg-[#F4F3F0] text-[#C4973A] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Layout size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0A0A09]">{template.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "hierarchy" && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Outline Layers Tree</h4>
              <div className="space-y-1.5">
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    onClick={(e) => setSelectedBlockIds([block.id])}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                      selectedBlockId === block.id
                        ? "bg-[#0A0A09] text-white border-transparent"
                        : "hover:bg-[#F4F3F0] bg-white border-[#E8E6E1]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Menu size={12} className="cursor-grab text-gray-400 flex-shrink-0" />
                      <span className="truncate pr-1">{block.name}</span>
                    </div>
                    {linkedSymbolIds[block.id] && (
                      <span className="text-[9px] bg-[#C4973A]/20 text-[#C4973A] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Sparkles size={8} /> Symbol
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "symbols" && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Global Master Symbols</h4>
              <div className="space-y-2">
                {globalSymbols.map(sym => (
                  <div key={sym.id} className="p-3 border border-[#E8E6E1] rounded-2xl bg-white shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#0A0A09] flex items-center gap-1">
                        <Sparkles size={12} className="text-[#C4973A]" /> {sym.name}
                      </div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider">{sym.type} master</span>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(sym)}
                      className="text-[10px] bg-[#0A0A09] hover:bg-[#C4973A] text-white px-2.5 py-1.5 rounded-xl transition-all duration-300 font-semibold"
                    >
                      Insert Master
                    </button>
                  </div>
                ))}
                {globalSymbols.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-6">No global symbols defined yet. Convert a block in properties tab to create one.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Publish History logs</h4>
              <div className="space-y-3">
                {publishHistory.map(log => (
                  <div key={log.version} className="p-3 border border-[#E8E6E1] rounded-2xl bg-white space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A0A09]">Version {log.version}</span>
                      <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">{log.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-snug">{log.notes}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#F4F3F0] text-[9px] text-gray-400">
                      <span>{log.timestamp}</span>
                      {log.version > 1 && (
                        <button onClick={() => handleRollbackVersion(log)} className="text-[#C4973A] hover:underline font-bold flex items-center gap-0.5">
                          <History size={10} /> Rollback
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MIDDLE CANVAS: DRAG & DROP RESPONSIVE GRID ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Assistant Alerts Banner */}
        {validationWarnings.length > 0 && (
          <div className="bg-red-50 border-b border-red-100 text-red-700 px-6 py-2.5 text-xs flex items-center justify-between flex-shrink-0 animate-fade-in">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <span className="truncate font-medium">Smart Assistant: {validationWarnings[0]} ({validationWarnings.length} alert issues found)</span>
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="h-12 bg-white border-b border-[#E8E6E1] flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 border border-[#E8E6E1] rounded-xl p-0.5 bg-white shadow-sm">
            {[
              { mode: "desktop", icon: Monitor },
              { mode: "tablet", icon: Tablet },
              { mode: "mobile", icon: Smartphone }
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setResponsiveMode(mode as any)}
                className={`p-1.5 rounded-lg transition-all ${responsiveMode === mode ? "bg-[#0A0A09] text-white" : "text-gray-400 hover:text-[#0A0A09]"}`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center">
            {isSaving && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium animate-pulse">
                <RefreshCw size={10} className="animate-spin text-[#C4973A]" /> Syncing layout draft...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 border border-[#E8E6E1] rounded-xl text-[#0A0A09] disabled:opacity-30 bg-white">
              <Undo size={14} />
            </button>
            <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 border border-[#E8E6E1] rounded-xl text-[#0A0A09] disabled:opacity-30 bg-white">
              <Redo size={14} />
            </button>
          </div>
        </div>

        {/* Live Canvas Workspace */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#F4F3F0] scroll-smooth">
          <div
            className={`bg-white shadow-2xl transition-all duration-300 h-fit rounded-2xl overflow-hidden border border-[#E8E6E1] ${
              responsiveMode === "mobile"
                ? "w-[375px] min-h-[667px]"
                : responsiveMode === "tablet"
                ? "w-[768px] min-h-[1024px]"
                : "w-full"
            }`}
          >
            <div className="w-full flex flex-col">
              {blocks.map((block, idx) => {
                const isSelected = selectedBlockIds.includes(block.id);
                const isLocked = lockedBlocks.includes(block.id);
                const isOver = idx === dragOverBlockIndex;

                // Apply mobile overrides locally to the renderer if mobile mode is selected
                let displayBlock = block;
                if (responsiveMode === "mobile" && responsiveOverrides[block.id]?.mobile) {
                  displayBlock = {
                    ...block,
                    content: { ...block.content, ...responsiveOverrides[block.id].mobile.content },
                    layoutSettings: { ...block.layoutSettings, ...responsiveOverrides[block.id].mobile.layoutSettings }
                  };
                }

                return (
                  <div
                    key={block.id}
                    draggable={!isLocked}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={(e) => handleSelectBlock(block.id, e)}
                    className={`relative group border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-[#C4973A] bg-[#C4973A]/5 shadow-inner"
                        : "border-transparent hover:border-gray-200"
                    } ${isOver ? "border-t-4 border-t-[#C4973A] pt-4" : ""} ${!block.isActive ? "opacity-40" : ""}`}
                  >
                    {/* Symbol master header tag */}
                    {linkedSymbolIds[block.id] && (
                      <div className="absolute top-2 left-2 z-50 bg-[#C4973A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Sparkles size={8} /> Global Instance
                      </div>
                    )}

                    {/* Canvas Floating controls */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 z-50 bg-white border border-[#E8E6E1] p-1 rounded-lg shadow-lg">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleLock(block.id); }} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        {isLocked ? <Lock size={12} className="text-[#C4973A]" /> : <Unlock size={12} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(block.id); }} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        {block.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      {!isLocked && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicate(block); }} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Copy size={12} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(block.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                    
                    <BlockRenderer
                      blocks={[displayBlock]}
                      previewMode={true}
                      products={previewProducts}
                      categories={previewCategories}
                    />
                  </div>
                );
              })}
              {blocks.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-xs">
                  Your canvas page is empty.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR: DYNAMIC INSPECTOR & PUBLISHING FLOW ── */}
      <aside className="w-[320px] border-l border-[#E8E6E1] bg-white flex flex-col h-full overflow-hidden">
        {selectedBlock ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Properties header layout */}
            <div className="p-4 border-b border-[#F4F3F0] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0A0A09] truncate pr-2">{selectedBlock.name}</h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {linkedSymbolIds[selectedBlock.id] ? (
                    <button
                      onClick={() => handleDetachSymbol(selectedBlock.id)}
                      className="text-[9px] text-[#C4973A] border border-[#C4973A] px-2 py-0.5 rounded hover:bg-[#C4973A]/10 font-bold"
                    >
                      Detach
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateSymbol(selectedBlock.id, selectedBlock.name)}
                      className="text-[9px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded hover:border-[#0A0A09] font-medium"
                    >
                      Make Symbol
                    </button>
                  )}
                </div>
              </div>
              
              {/* Responsive Inheritance Override selectors */}
              <div className="flex items-center justify-between border-t border-[#F4F3F0] pt-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Screen Targets Override</span>
                <div className="flex gap-1.5 border border-[#E8E6E1] p-0.5 rounded-lg bg-gray-50">
                  <button
                    onClick={() => setOverrideTargetMode("desktop")}
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${overrideTargetMode === "desktop" ? "bg-[#0A0A09] text-white" : "text-gray-500"}`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setOverrideTargetMode("mobile")}
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${overrideTargetMode === "mobile" ? "bg-[#0A0A09] text-white animate-pulse" : "text-gray-500"}`}
                  >
                    Mobile Override
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Dynamic properties form matching schema fields */}
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><Sliders size={11} /> Content Properties</h4>
                <div className="space-y-4">
                  {Object.entries(selectedBlock.content).map(([k, val]) => (
                    <div key={k}>
                      <label className="block text-[10px] uppercase text-[#6B6966] font-medium mb-1">{k}</label>
                      <input
                        value={val as string}
                        disabled={lockedBlocks.includes(selectedBlock.id)}
                        onChange={(e) => handleUpdateBlockContent(k, e.target.value)}
                        className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C4973A] disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Animation Studio Settings */}
              <div className="border-t border-[#F4F3F0] pt-4">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><Play size={11} /> Animation Studio</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase text-[#6B6966] font-medium mb-1">Preset Trigger</label>
                    <select
                      value={animationSettings[selectedBlock.id]?.preset || "fade"}
                      onChange={(e) => {
                        const existing = animationSettings[selectedBlock.id] || { preset: "fade", delay: 0, duration: 600, viewportTrigger: true };
                        setAnimationSettings({ ...animationSettings, [selectedBlock.id]: { ...existing, preset: e.target.value } });
                        setIsDirty(true);
                      }}
                      className="w-full border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="scale">Scale In</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Publish Action block */}
              <div className="border-t border-[#F4F3F0] pt-4 space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Publish Changes</h4>
                <textarea
                  placeholder="Add version logs note (e.g. Added Hero copy details)"
                  value={publishNote}
                  onChange={(e) => setPublishNote(e.target.value)}
                  className="w-full border border-[#E8E6E1] rounded-xl p-2.5 text-xs outline-none resize-none h-16"
                />
                <button
                  onClick={handlePublishPage}
                  className="w-full bg-[#0A0A09] hover:bg-[#C4973A] text-white text-xs font-semibold py-2 rounded-xl transition-all duration-300"
                >
                  Publish Version
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 text-xs">
            <HelpIcon size={20} className="mb-2 text-[#E8E6E1]" />
            Select a block on the middle canvas to inspect and edit its properties.
          </div>
        )}
      </aside>
    </div>
  );
}
