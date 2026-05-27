

"use client";

import type React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LeadDialog }        from "./lead-dialog";
import { LeadDetailDialog }  from "./lead-detail-dialog";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import { FollowUpDialog }    from "./follow-up-dialog";
import {
  Plus, Search, Phone, MessageSquare,
  MoreHorizontal, Edit, Trash2, Eye, UserCheck,
  Kanban, LayoutList, Bell, IndianRupee, AlertCircle,
  GripVertical, X, Users, TrendingUp,
  CheckCircle2, Clock, CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Lead } from "@/types/crm";

// ─── Pipeline Stages ──────────────────────────────────────────────────────────
const STAGES = [
  { value: "lead",        label: "Lead",        emoji: "🌱", bg: "bg-slate-50",  border: "border-slate-200", dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600" },
  { value: "demo",        label: "Demo",        emoji: "🎯", bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
  { value: "proposal",    label: "Proposal",    emoji: "📄", bg: "bg-violet-50", border: "border-violet-200",dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700" },
  { value: "negotiation", label: "Negotiation", emoji: "🤝", bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700" },
  { value: "won",         label: "Won",         emoji: "🎉", bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500",   badge: "bg-green-100 text-green-700" },
  { value: "lost",        label: "Lost",        emoji: "❌", bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-400",     badge: "bg-red-100 text-red-600" },
] as const;

type StageValue = typeof STAGES[number]["value"];

const SERVICES: Record<string, string> = {
  website:       "Website",
  whatsapp:      "WhatsApp",
  lms:           "LMS",
  crm:           "CRM",
  "social-media":"Social Media",
  other:         "Other",
};

const PRIORITIES = [
  { value: "high",   label: "High",   color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  { value: "low",    label: "Low",    color: "bg-gray-100 text-gray-600",      dot: "bg-gray-300" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

const fmtDate = (v: unknown) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const isOverdue = (d?: string | null) => {
  if (!d) return false;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return new Date(d) < t;
};

const stageMeta  = (v: string) => STAGES.find((s) => s.value === v) ?? STAGES[0];
const priMeta    = (v: string) => PRIORITIES.find((p) => p.value === v) ?? PRIORITIES[1];
const getService = (l: Lead)   => SERVICES[(l as any).service ?? ""] ?? (l as any).service ?? "";
const getAmount  = (l: Lead)   => {
  const v = (l as any).totalAmount ?? (l as any).total_amount ?? l.estimatedValue ?? 0;
  return typeof v === "number" ? v : Number(v ?? 0);
};
const getFollowUp = (l: Lead) => (l as any).follow_up_date as string | null | undefined;

// ─── Inline Editable Amount Cell ──────────────────────────────────────────────

function EditableAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
  const [editing, setEditing] = useState(false);
  const amount = getAmount(lead);
  const [val, setVal] = useState(String(amount || ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const n = Number(val);
    if (!isNaN(n) && n >= 0) onSave(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-emerald-500 text-xs">₹</span>
        <input
          ref={inputRef}
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="w-24 h-7 text-sm border border-blue-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(String(amount || "")); setEditing(true); }}
      className="flex items-center gap-0.5 text-sm font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group"
      title="Click to edit amount"
    >
      {amount > 0 ? (
        <>
          <IndianRupee className="h-3 w-3 text-emerald-500 group-hover:text-blue-500" />
          {amount.toLocaleString("en-IN")}
        </>
      ) : (
        <span className="text-gray-300 group-hover:text-blue-400 text-xs font-medium">+ Amount</span>
      )}
    </button>
  );
}

// ─── Inline Editable Follow-up Cell ───────────────────────────────────────────

function EditableFollowUp({ lead, onSave }: { lead: Lead; onSave: (date: Date | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const fud = getFollowUp(lead);
  const od  = isOverdue(fud);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
            fud
              ? od
                ? "text-red-600 hover:bg-red-50"
                : "text-amber-600 hover:bg-amber-50"
              : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
          )}
          title="Click to set follow-up date"
        >
          {fud ? (
            <>
              {od ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {fmtDate(fud)}
              {od && " ⚠️"}
            </>
          ) : (
            <>
              <CalendarIcon className="h-3 w-3" />
              + Set date
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={fud ? new Date(fud) : undefined}
          onSelect={(d) => { onSave(d); setOpen(false); }}
          initialFocus
        />
        {fud && (
          <div className="p-2 border-t">
            <button
              onClick={() => { onSave(undefined); setOpen(false); }}
              className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded"
            >
              Clear date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Inline Editable Priority Cell ────────────────────────────────────────────

function EditablePriority({ lead, onSave }: { lead: Lead; onSave: (priority: string) => void }) {
  const pm = priMeta(lead.priority as string);

  return (
    <Select value={lead.priority as string} onValueChange={onSave}>
      <SelectTrigger
        className={cn(
          "h-7 text-xs border-0 rounded-full px-2.5 font-semibold focus:ring-0 w-auto min-w-[80px] cursor-pointer",
          pm.color
        )}
        style={{ boxShadow: "none" }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            <span className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", p.dot)} />
              {p.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Lead Card (Kanban) ───────────────────────────────────────────────────────

function LeadCard({
  lead, onView, onEdit, onDelete, onCall, onWhatsApp, onFollowUp, onConvert,
  dragging, onDragStart, onDragEnd,
}: {
  lead: Lead;
  onView: () => void; onEdit: () => void; onDelete: () => void;
  onCall: () => void; onWhatsApp: () => void; onFollowUp: () => void;
  onConvert: () => void;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const pm      = priMeta(lead.priority as string);
  const amount  = getAmount(lead);
  const fud     = getFollowUp(lead);
  const overdue = isOverdue(fud);
  const svc     = getService(lead);
  const isWon   = lead.status === "won";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onView}
      className={cn(
        "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
        dragging ? "opacity-40 scale-95 border-blue-400" : "border-gray-100 hover:border-blue-200"
      )}
    >
      <div className={cn("h-1 w-full rounded-t-2xl", pm.value === "high" ? "bg-red-400" : pm.value === "medium" ? "bg-yellow-400" : "bg-gray-200")} />
      <div className="p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
              {(lead as any).company && <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 rounded-lg shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-44 text-sm">
              <DropdownMenuItem onClick={onView}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onFollowUp}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
              {isWon && !(lead as any).isConverted && (
                <DropdownMenuItem onClick={onConvert}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {svc && (
          <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg">
            {svc}
          </span>
        )}

        {amount > 0 && (
          <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
            <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
            {amount.toLocaleString("en-IN")}
          </div>
        )}

        {fud && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-medium",
            overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
          )}>
            {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            Follow-up: {fmtDate(fud)}
            {overdue && " · Overdue!"}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <button onClick={onCall} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
              <Phone className="h-3.5 w-3.5" />
            </button>
            <button onClick={onWhatsApp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            <button onClick={onFollowUp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
              <Bell className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", pm.color)}>
            {pm.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadsContent() {
  const { leads, deleteLead, updateLead } = useCRM();

  // ── View & filter state ── default is "table" (Fix #4)
  const [view,          setView]          = useState<"kanban" | "table">("table");
  const [search,        setSearch]        = useState("");
  const [stageFilter,   setStageFilter]   = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [priorityFilter,setPriorityFilter]= useState("all");

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [selected,      setSelected]      = useState<Lead | null>(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [convertOpen,   setConvertOpen]   = useState(false);
  const [followUpOpen,  setFollowUpOpen]  = useState(false);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [dropTarget,    setDropTarget]    = useState<string | null>(null);

  // ── Filtered leads ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (q && !l.name?.toLowerCase().includes(q) && !(l as any).company?.toLowerCase().includes(q)) return false;
      if (stageFilter    !== "all" && l.status !== stageFilter)           return false;
      if (serviceFilter  !== "all" && (l as any).service !== serviceFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter)      return false;
      return true;
    });
  }, [leads, search, stageFilter, serviceFilter, priorityFilter]);

  // ── Grouped for kanban ────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.value, [] as Lead[]]));
    filtered.forEach((l) => { if (map[l.status as string]) map[l.status as string].push(l); });
    return map as Record<StageValue, Lead[]>;
  }, [filtered]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    leads.length,
    won:      leads.filter((l) => l.status === "won").length,
    overdueFollowUps: leads.filter((l) => isOverdue(getFollowUp(l)) && !["won","lost"].includes(l.status as string)).length,
    pipeline: leads.reduce((s, l) => s + getAmount(l), 0),
  }), [leads]);

  // ── Action helpers ────────────────────────────────────────────────────────
  const open = (l: Lead) => { setSelected(l); setDetailOpen(true); };
  const edit = (l: Lead) => { setSelected(l); setEditOpen(true); };
  const del  = (id: string) => { if (window.confirm("Delete this lead?")) void deleteLead(id); };
  const call = (l: Lead) => { if ((l as any).phone) window.open(`tel:${(l as any).phone}`); };
  const wa   = (l: Lead) => {
    const n = l.whatsappNumber || (l as any).phone;
    if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("Hi, following up on your Vasifytech enquiry.")}`, "_blank");
  };
  const fu   = (l: Lead) => { setSelected(l); setFollowUpOpen(true); };
  const conv = (l: Lead) => { setSelected(l); setConvertOpen(true); };

  // ── Inline update helpers (Fix #3) ───────────────────────────────────────
  const saveAmount = useCallback(async (id: string, amount: number) => {
    await updateLead(id, { totalAmount: amount, estimatedValue: amount } as any);
  }, [updateLead]);

  const saveFollowUp = useCallback(async (id: string, date: Date | undefined) => {
    await updateLead(id, {
      followUpDate: date ? date.toISOString().split("T")[0] : null,
    } as any);
  }, [updateLead]);

  const savePriority = useCallback(async (id: string, priority: string) => {
    await updateLead(id, { priority: priority as Lead["priority"] });
  }, [updateLead]);

  // ── Stage change ──────────────────────────────────────────────────────────
  const changeStage = useCallback(async (id: string, stage: string) => {
    await updateLead(id, { status: stage as Lead["status"], pipelineStage: stage } as any);
  }, [updateLead]);

  const onDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("leadId");
    setDraggingId(null); setDropTarget(null);
    if (id) await changeStage(id, stage);
  };

  const activeFilters = [stageFilter !== "all", serviceFilter !== "all", priorityFilter !== "all"].filter(Boolean).length;
  const clearFilters  = () => { setStageFilter("all"); setServiceFilter("all"); setPriorityFilter("all"); setSearch(""); };

  // ─── Render ───────────────────────────────────────────────────────────────
  // Fix #1: Removed extra sidebar wrapper — this component renders inside the
  // existing layout's <main> area, so no extra full-page wrapper needed.
  return (
    <div className="flex flex-col h-full">

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      {/* Fix #2: Proper alignment with flex, consistent heights, no overflow */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title */}
          <div className="shrink-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Leads Pipeline</h1>
            <p className="text-xs text-gray-400">{leads.length} total leads</p>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-8 h-8 rounded-xl border-gray-200 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Stage filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className={cn("h-8 w-32 rounded-xl text-xs border shrink-0", stageFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Service filter */}
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className={cn("h-8 w-32 rounded-xl text-xs border shrink-0", serviceFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {Object.entries(SERVICES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border shrink-0", priorityFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 shrink-0">
              <X className="h-3 w-3" />Clear
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => setView("kanban")}
              className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
            >
              <Kanban className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setView("table")}
              className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
            >
              <LayoutList className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 text-xs font-medium flex items-center gap-1 shrink-0 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill icon={<Users className="h-5 w-5 text-blue-500" />}         label="Total Leads"     value={stats.total} />
          <StatPill icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Won Deals"       value={stats.won} />
          <StatPill icon={<TrendingUp className="h-5 w-5 text-violet-500" />}  label="Pipeline Value"  value={fmt(stats.pipeline)} />
          <StatPill
            icon={<Bell className={cn("h-5 w-5", stats.overdueFollowUps > 0 ? "text-red-500" : "text-amber-500")} />}
            label="Follow-ups Due"
            value={stats.overdueFollowUps}
          />
        </div>

        {/* ── KANBAN BOARD ──────────────────────────────────────────────── */}
        {view === "kanban" && (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {STAGES.map((stage) => {
                const colLeads = grouped[stage.value] ?? [];
                const colValue = colLeads.reduce((s, l) => s + getAmount(l), 0);
                const isTarget = dropTarget === stage.value && draggingId !== null;

                return (
                  <div
                    key={stage.value}
                    onDragOver={(e) => { e.preventDefault(); setDropTarget(stage.value); }}
                    onDrop={(e) => onDrop(e, stage.value)}
                    onDragLeave={() => setDropTarget(null)}
                    className={cn(
                      "w-64 flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-all shrink-0",
                      stage.border,
                      isTarget && "ring-2 ring-blue-400 ring-offset-1 shadow-lg scale-[1.01]"
                    )}
                  >
                    <div className={cn("px-3.5 py-3 flex items-center justify-between", stage.bg)}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{stage.emoji}</span>
                        <span className="font-semibold text-sm text-gray-800">{stage.label}</span>
                      </div>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stage.badge)}>
                        {colLeads.length}
                      </span>
                    </div>
                    {colValue > 0 && (
                      <div className={cn("px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 border-b flex items-center gap-1", stage.border)}>
                        <IndianRupee className="h-3 w-3" />{fmt(colValue)} total
                      </div>
                    )}
                    <div className={cn("p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[62vh] transition-colors", isTarget && "bg-blue-50/30")}>
                      {colLeads.length === 0 ? (
                        <div className={cn("flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed text-gray-300 transition-colors", isTarget ? "border-blue-300 bg-blue-50/20 text-blue-400" : "border-gray-100")}>
                          <Users className="h-6 w-6 mb-1 opacity-40" />
                          <p className="text-xs font-medium">{isTarget ? "Drop here" : "No leads"}</p>
                        </div>
                      ) : (
                        colLeads.map((lead) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            onView={() => open(lead)}
                            onEdit={() => edit(lead)}
                            onDelete={() => del(lead.id)}
                            onCall={() => call(lead)}
                            onWhatsApp={() => wa(lead)}
                            onFollowUp={() => fu(lead)}
                            onConvert={() => conv(lead)}
                            dragging={draggingId === lead.id}
                            onDragStart={(e) => { setDraggingId(lead.id); e.dataTransfer.setData("leadId", lead.id); e.dataTransfer.effectAllowed = "move"; }}
                            onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TABLE / LIST VIEW ──────────────────────────────────────────── */}
        {/* Fix #2: Proper column widths, alignment, consistent row height   */}
        {/* Fix #3: Amount, Follow-up, Priority are now inline-editable      */}
        {view === "table" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Column headers — fixed proportional widths */}
            <div className="grid gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
              style={{ gridTemplateColumns: "2.5fr 1fr 1.2fr 1.2fr 1fr 1.2fr 100px" }}
            >
              <div className="pl-12">Client</div>
              <div>Service</div>
              <div>Stage</div>
              <div>Amount</div>
              <div>Priority</div>
              <div>Follow-up</div>
              <div />
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Users className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium text-gray-400">
                  {search || activeFilters > 0 ? "No leads match your filters." : "No leads yet. Add your first one!"}
                </p>
                {(search || activeFilters > 0) && (
                  <button onClick={clearFilters} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                    <X className="h-3.5 w-3.5" />Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((lead) => {
                  const sm  = stageMeta(lead.status as string);
                  const svc = getService(lead);

                  return (
                    <div
                      key={lead.id}
                      onDoubleClick={() => open(lead)}
                      className="grid gap-0 px-4 py-3 items-center hover:bg-gray-50/60 transition-colors group"
                      style={{ gridTemplateColumns: "2.5fr 1fr 1.2fr 1.2fr 1fr 1.2fr 100px" }}
                    >
                      {/* Client */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-xs font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
                          {(lead as any).company && (
                            <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>
                          )}
                          {(lead as any).phone && (
                            <button
                              onClick={(e) => { e.stopPropagation(); call(lead); }}
                              className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium mt-0.5"
                            >
                              <Phone className="h-2.5 w-2.5" />{(lead as any).phone}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Service */}
                      <div className="pr-2">
                        {svc ? (
                          <span className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                            {svc}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </div>

                      {/* Stage — inline editable dropdown */}
                      <div onClick={(e) => e.stopPropagation()} className="pr-2">
                        <Select value={lead.status as string} onValueChange={(v) => changeStage(lead.id, v)}>
                          <SelectTrigger
                            className={cn("h-7 text-xs border rounded-full px-2.5 w-auto min-w-[100px] font-medium focus:ring-0", sm.badge, "border-transparent")}
                            style={{ boxShadow: "none" }}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 inline-block", sm.dot)} />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <span className="flex items-center gap-2">
                                  <span className={cn("w-2 h-2 rounded-full", s.dot)} />
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount — inline editable (Fix #3) */}
                      <div onClick={(e) => e.stopPropagation()} className="pr-2">
                        <EditableAmount lead={lead} onSave={(val) => saveAmount(lead.id, val)} />
                      </div>

                      {/* Priority — inline editable (Fix #3) */}
                      <div onClick={(e) => e.stopPropagation()} className="pr-2">
                        <EditablePriority lead={lead} onSave={(p) => savePriority(lead.id, p)} />
                      </div>

                      {/* Follow-up — inline editable (Fix #3) */}
                      <div onClick={(e) => e.stopPropagation()} className="pr-2">
                        <EditableFollowUp lead={lead} onSave={(d) => saveFollowUp(lead.id, d)} />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => call(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => wa(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-40 text-sm">
                            <DropdownMenuItem onClick={() => open(lead)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => edit(lead)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fu(lead)}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
                            {lead.status === "won" && !(lead as any).isConverted && (
                              <DropdownMenuItem onClick={() => conv(lead)}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => del(lead.id)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <LeadDialog open={addOpen}  onOpenChange={setAddOpen}  lead={null}     mode="add" />
      <LeadDialog open={editOpen} onOpenChange={setEditOpen} lead={selected} mode="edit" />

      <LeadDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        lead={selected}
        onCallLead={call}
        onEmailLead={(l) => { if (l.email) window.location.href = `mailto:${l.email}`; }}
        onWhatsAppLead={wa}
        onConvertLead={(l) => { setDetailOpen(false); conv(l); }}
        onOpenFollowUp={(l) => { setDetailOpen(false); fu(l); }}
      />

      <ConvertLeadDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        lead={selected}
        onSuccess={() => setSelected(null)}
      />

      <FollowUpDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        lead={selected}
      />
    </div>
  );
}