// "use client";

// import type React from "react";
// import { useState, useMemo, useCallback, useRef, useEffect } from "react";
// import { useCRM } from "@/contexts/crm-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//   DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { LeadDialog }        from "./lead-dialog";
// import { LeadDetailDialog }  from "./lead-detail-dialog";
// import { ConvertLeadDialog } from "./convert-lead-dialog";
// import { FollowUpDialog }    from "./follow-up-dialog";
// import {
//   Plus, Search, Phone, MessageSquare,
//   MoreHorizontal, Edit, Trash2, Eye, UserCheck,
//   Kanban, LayoutList, Bell, IndianRupee, AlertCircle,
//   GripVertical, X, Users, TrendingUp,
//   CheckCircle2, Clock, CalendarIcon, ArrowUpRight,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import type { Lead } from "@/types/crm";

// // ─── Pipeline Stages ──────────────────────────────────────────────────────────
// const STAGES = [
//   { value: "lead",        label: "Lead",        emoji: "🌱", bg: "bg-slate-50",  border: "border-slate-200", dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600" },
//   { value: "demo",        label: "Demo",        emoji: "🎯", bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
//   { value: "proposal",    label: "Proposal",    emoji: "📄", bg: "bg-violet-50", border: "border-violet-200",dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700" },
//   { value: "negotiation", label: "Negotiation", emoji: "🤝", bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700" },
//   { value: "won",         label: "Won",         emoji: "🎉", bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500",   badge: "bg-green-100 text-green-700" },
//   { value: "lost",        label: "Lost",        emoji: "❌", bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-400",     badge: "bg-red-100 text-red-600" },
// ] as const;

// type StageValue = typeof STAGES[number]["value"];

// const SERVICES: Record<string, string> = {
//   website:       "Website",
//   whatsapp:      "WhatsApp",
//   lms:           "LMS",
//   crm:           "CRM",
//   "social-media":"Social Media",
//   other:         "Other",
// };

// const PRIORITIES = [
//   { value: "high",   label: "High",   color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
//   { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
//   { value: "low",    label: "Low",    color: "bg-gray-100 text-gray-600",      dot: "bg-gray-300" },
// ] as const;

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmt = (v: number) =>
//   v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

// const fmtDate = (v: unknown) => {
//   if (!v) return null;
//   const d = v instanceof Date ? v : new Date(v as string);
//   if (isNaN(d.getTime())) return null;
//   return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
// };

// const isOverdue = (d?: string | null) => {
//   if (!d) return false;
//   const t = new Date(); t.setHours(0, 0, 0, 0);
//   return new Date(d) < t;
// };

// const stageMeta  = (v: string) => STAGES.find((s) => s.value === v) ?? STAGES[0];
// const priMeta    = (v: string) => PRIORITIES.find((p) => p.value === v) ?? PRIORITIES[1];
// const getService = (l: Lead)   => SERVICES[(l as any).service ?? ""] ?? (l as any).service ?? "";

// const getAmount = (l: Lead) => {
//   const v = (l as any).totalAmount ?? (l as any).total_amount ?? l.estimatedValue ?? 0;
//   return typeof v === "number" ? v : Number(v ?? 0);
// };

// // ── NEW ──
// const getExpectedAmount = (l: Lead) => {
//   const v = (l as any).expectedAmount ?? (l as any).expected_amount ?? 0;
//   return typeof v === "number" ? v : Number(v ?? 0);
// };
// // ─────────

// const getFollowUp = (l: Lead) => (l as any).follow_up_date as string | null | undefined;

// // ─── Inline Editable Amount Cell ──────────────────────────────────────────────

// function EditableAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
//   const [editing, setEditing] = useState(false);
//   const amount = getAmount(lead);
//   const [val, setVal] = useState(String(amount || ""));
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

//   const commit = () => {
//     const n = Number(val);
//     if (!isNaN(n) && n >= 0) onSave(n);
//     setEditing(false);
//   };

//   if (editing) {
//     return (
//       <div className="flex items-center gap-1">
//         <span className="text-emerald-500 text-xs">₹</span>
//         <input
//           ref={inputRef}
//           type="number"
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           className="w-24 h-7 text-sm border border-blue-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-blue-400"
//         />
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={() => { setVal(String(amount || "")); setEditing(true); }}
//       className="flex items-center gap-0.5 text-sm font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group"
//       title="Click to edit amount"
//     >
//       {amount > 0 ? (
//         <>
//           <IndianRupee className="h-3 w-3 text-emerald-500 group-hover:text-blue-500" />
//           {amount.toLocaleString("en-IN")}
//         </>
//       ) : (
//         <span className="text-gray-300 group-hover:text-blue-400 text-xs font-medium">+ Amount</span>
//       )}
//     </button>
//   );
// }

// // ─── Inline Editable Expected Amount Cell ─────────────────────────────────────

// function EditableExpectedAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
//   const [editing, setEditing] = useState(false);
//   const amount = getExpectedAmount(lead);
//   const [val, setVal] = useState(String(amount || ""));
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

//   const commit = () => {
//     const n = Number(val);
//     if (!isNaN(n) && n >= 0) onSave(n);
//     setEditing(false);
//   };

//   if (editing) {
//     return (
//       <div className="flex items-center gap-1">
//         <span className="text-amber-500 text-xs">₹</span>
//         <input
//           ref={inputRef}
//           type="number"
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           className="w-24 h-7 text-sm border border-amber-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-amber-400"
//         />
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={() => { setVal(String(amount || "")); setEditing(true); }}
//       className="flex items-center gap-0.5 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors group"
//       title="Click to edit expected amount"
//     >
//       {amount > 0 ? (
//         <>
//           <IndianRupee className="h-3 w-3 text-amber-400 group-hover:text-amber-600" />
//           {amount.toLocaleString("en-IN")}
//         </>
//       ) : (
//         <span className="text-gray-300 group-hover:text-amber-400 text-xs font-medium">+ Expected</span>
//       )}
//     </button>
//   );
// }

// // ─── Inline Editable Follow-up Cell ───────────────────────────────────────────

// function EditableFollowUp({ lead, onSave }: { lead: Lead; onSave: (date: Date | undefined) => void }) {
//   const [open, setOpen] = useState(false);
//   const fud = getFollowUp(lead);
//   const od  = isOverdue(fud);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <button
//           className={cn(
//             "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
//             fud
//               ? od
//                 ? "text-red-600 hover:bg-red-50"
//                 : "text-amber-600 hover:bg-amber-50"
//               : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
//           )}
//           title="Click to set follow-up date"
//         >
//           {fud ? (
//             <>
//               {od ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
//               {fmtDate(fud)}
//               {od && " ⚠️"}
//             </>
//           ) : (
//             <>
//               <CalendarIcon className="h-3 w-3" />
//               + Set date
//             </>
//           )}
//         </button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar
//           mode="single"
//           selected={fud ? new Date(fud) : undefined}
//           onSelect={(d) => { onSave(d); setOpen(false); }}
//           initialFocus
//         />
//         {fud && (
//           <div className="p-2 border-t">
//             <button
//               onClick={() => { onSave(undefined); setOpen(false); }}
//               className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded"
//             >
//               Clear date
//             </button>
//           </div>
//         )}
//       </PopoverContent>
//     </Popover>
//   );
// }

// // ─── Inline Editable Priority Cell ────────────────────────────────────────────

// function EditablePriority({ lead, onSave }: { lead: Lead; onSave: (priority: string) => void }) {
//   const pm = priMeta(lead.priority as string);

//   return (
//     <Select value={lead.priority as string} onValueChange={onSave}>
//       <SelectTrigger
//         className={cn(
//           "h-7 text-xs border-0 rounded-full px-2.5 font-semibold focus:ring-0 w-auto min-w-[80px] cursor-pointer",
//           pm.color
//         )}
//         style={{ boxShadow: "none" }}
//       >
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         {PRIORITIES.map((p) => (
//           <SelectItem key={p.value} value={p.value}>
//             <span className="flex items-center gap-2">
//               <span className={cn("w-2 h-2 rounded-full", p.dot)} />
//               {p.label}
//             </span>
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

// // ─── Lead Card (Kanban) ───────────────────────────────────────────────────────

// function LeadCard({
//   lead, onView, onEdit, onDelete, onCall, onWhatsApp, onFollowUp, onConvert,
//   dragging, onDragStart, onDragEnd,
// }: {
//   lead: Lead;
//   onView: () => void; onEdit: () => void; onDelete: () => void;
//   onCall: () => void; onWhatsApp: () => void; onFollowUp: () => void;
//   onConvert: () => void;
//   dragging: boolean;
//   onDragStart: (e: React.DragEvent) => void;
//   onDragEnd: () => void;
// }) {
//   const pm             = priMeta(lead.priority as string);
//   const amount         = getAmount(lead);
//   const expectedAmount = getExpectedAmount(lead);
//   const fud            = getFollowUp(lead);
//   const overdue        = isOverdue(fud);
//   const svc            = getService(lead);
//   const isWon          = lead.status === "won";

//   return (
//     <div
//       draggable
//       onDragStart={onDragStart}
//       onDragEnd={onDragEnd}
//       onDoubleClick={onView}
//       className={cn(
//         "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
//         dragging ? "opacity-40 scale-95 border-blue-400" : "border-gray-100 hover:border-blue-200"
//       )}
//     >
//       <div className={cn("h-1 w-full rounded-t-2xl", pm.value === "high" ? "bg-red-400" : pm.value === "medium" ? "bg-yellow-400" : "bg-gray-200")} />
//       <div className="p-3.5 space-y-3">
//         <div className="flex items-start justify-between gap-2">
//           <div className="flex items-center gap-2.5 min-w-0">
//             <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
//             <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
//               <span className="text-sm font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
//             </div>
//             <div className="min-w-0">
//               <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
//               {(lead as any).company && <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>}
//             </div>
//           </div>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 rounded-lg shrink-0">
//                 <MoreHorizontal className="h-3.5 w-3.5" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="rounded-xl w-44 text-sm">
//               <DropdownMenuItem onClick={onView}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
//               <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
//               <DropdownMenuItem onClick={onFollowUp}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
//               {isWon && !(lead as any).isConverted && (
//                 <DropdownMenuItem onClick={onConvert}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
//               )}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
//                 <Trash2 className="mr-2 h-4 w-4" />Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {svc && (
//           <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg">
//             {svc}
//           </span>
//         )}

//         {/* Total amount */}
//         {amount > 0 && (
//           <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
//             <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
//             {amount.toLocaleString("en-IN")}
//           </div>
//         )}

//         {/* Expected amount — only show if different from total */}
//         {expectedAmount > 0 && expectedAmount !== amount && (
//           <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
//             <IndianRupee className="h-3 w-3 text-amber-400" />
//             {expectedAmount.toLocaleString("en-IN")}
//             <span className="text-gray-400 font-normal">expected</span>
//           </div>
//         )}

//         {fud && (
//           <div className={cn(
//             "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-medium",
//             overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
//           )}>
//             {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
//             Follow-up: {fmtDate(fud)}
//             {overdue && " · Overdue!"}
//           </div>
//         )}

//         <div className="flex items-center justify-between pt-1 border-t border-gray-50">
//           <div className="flex items-center gap-1">
//             <button onClick={onCall} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
//               <Phone className="h-3.5 w-3.5" />
//             </button>
//             <button onClick={onWhatsApp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
//               <MessageSquare className="h-3.5 w-3.5" />
//             </button>
//             <button onClick={onFollowUp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
//               <Bell className="h-3.5 w-3.5" />
//             </button>
//           </div>
//           <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", pm.color)}>
//             {pm.label}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Stat Card ────────────────────────────────────────────────────────────────

// function StatCard({
//   icon,
//   label,
//   value,
//   trend,
//   accentClass,
//   borderClass,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string | number;
//   trend?: string;
//   accentClass: string;
//   borderClass: string;
// }) {
//   return (
//     <div className={cn(
//       "flex items-center gap-3 bg-white rounded-xl border shadow-sm px-4 py-3 border-l-4",
//       borderClass,
//       accentClass,
//     )}>
//       <div className="shrink-0">{icon}</div>
//       <div className="min-w-0">
//         <div className="text-lg font-bold text-gray-900 leading-none">{value}</div>
//         <div className="text-[11px] text-gray-400 mt-0.5 font-medium">{label}</div>
//         {trend && (
//           <div className="flex items-center gap-0.5 mt-1">
//             <ArrowUpRight className="h-3 w-3 text-emerald-500" />
//             <span className="text-[10px] text-emerald-600 font-semibold">{trend}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function LeadsContent() {
//   const { leads, deleteLead, updateLead } = useCRM();

//   const [view,          setView]          = useState<"kanban" | "table">("table");
//   const [search,        setSearch]        = useState("");
//   const [stageFilter,   setStageFilter]   = useState("all");
//   const [serviceFilter, setServiceFilter] = useState("all");
//   const [priorityFilter,setPriorityFilter]= useState("all");

//   const [selected,      setSelected]      = useState<Lead | null>(null);
//   const [addOpen,       setAddOpen]       = useState(false);
//   const [editOpen,      setEditOpen]      = useState(false);
//   const [detailOpen,    setDetailOpen]    = useState(false);
//   const [convertOpen,   setConvertOpen]   = useState(false);
//   const [followUpOpen,  setFollowUpOpen]  = useState(false);

//   const [draggingId,    setDraggingId]    = useState<string | null>(null);
//   const [dropTarget,    setDropTarget]    = useState<string | null>(null);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return leads.filter((l) => {
//       if (q && !l.name?.toLowerCase().includes(q) && !(l as any).company?.toLowerCase().includes(q)) return false;
//       if (stageFilter    !== "all" && l.status !== stageFilter)           return false;
//       if (serviceFilter  !== "all" && (l as any).service !== serviceFilter) return false;
//       if (priorityFilter !== "all" && l.priority !== priorityFilter)      return false;
//       return true;
//     });
//   }, [leads, search, stageFilter, serviceFilter, priorityFilter]);

//   const grouped = useMemo(() => {
//     const map = Object.fromEntries(STAGES.map((s) => [s.value, [] as Lead[]]));
//     filtered.forEach((l) => { if (map[l.status as string]) map[l.status as string].push(l); });
//     return map as Record<StageValue, Lead[]>;
//   }, [filtered]);

//   const stats = useMemo(() => ({
//     total:    leads.length,
//     won:      leads.filter((l) => l.status === "won").length,
//     overdueFollowUps: leads.filter((l) => isOverdue(getFollowUp(l)) && !["won","lost"].includes(l.status as string)).length,
//     pipeline: leads.reduce((s, l) => s + getAmount(l), 0),
//   }), [leads]);

//   const open = (l: Lead) => { setSelected(l); setDetailOpen(true); };
//   const edit = (l: Lead) => { setSelected(l); setEditOpen(true); };
//   const del  = (id: string) => { if (window.confirm("Delete this lead?")) void deleteLead(id); };
//   const call = (l: Lead) => { if ((l as any).phone) window.open(`tel:${(l as any).phone}`); };
//   const wa   = (l: Lead) => {
//     const n = l.whatsappNumber || (l as any).phone;
//     if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("Hi, following up on your Vasifytech enquiry.")}`, "_blank");
//   };
//   const fu   = (l: Lead) => { setSelected(l); setFollowUpOpen(true); };
//   const conv = (l: Lead) => { setSelected(l); setConvertOpen(true); };

//   const saveAmount = useCallback(async (id: string, amount: number) => {
//     await updateLead(id, { totalAmount: amount, estimatedValue: amount } as any);
//   }, [updateLead]);

//   // ── NEW ──
//   const saveExpectedAmount = useCallback(async (id: string, amount: number) => {
//     await updateLead(id, { expectedAmount: amount } as any);
//   }, [updateLead]);
//   // ─────────

//   const saveFollowUp = useCallback(async (id: string, date: Date | undefined) => {
//     await updateLead(id, {
//       followUpDate: date ? date.toISOString().split("T")[0] : null,
//     } as any);
//   }, [updateLead]);

//   const savePriority = useCallback(async (id: string, priority: string) => {
//     await updateLead(id, { priority: priority as Lead["priority"] });
//   }, [updateLead]);

//   const changeStage = useCallback(async (id: string, stage: string) => {
//     await updateLead(id, { status: stage as Lead["status"], pipelineStage: stage } as any);
//   }, [updateLead]);

//   const onDrop = async (e: React.DragEvent, stage: string) => {
//     e.preventDefault();
//     const id = e.dataTransfer.getData("leadId");
//     setDraggingId(null); setDropTarget(null);
//     if (id) await changeStage(id, stage);
//   };

//   const activeFilters = [stageFilter !== "all", serviceFilter !== "all", priorityFilter !== "all"].filter(Boolean).length;
//   const clearFilters  = () => { setStageFilter("all"); setServiceFilter("all"); setPriorityFilter("all"); setSearch(""); };

//   return (
//     <div className="flex flex-col h-full">

//       {/* ── Top Bar ─────────────────────────────────────────────────────── */}
//       <div className="bg-transparent border-b border-gray-100 px-6 pt-4 pb-0 sticky top-0 z-10 bg-gray-50">

//         {/* Row 1: Title + view toggle + CTA */}
//         <div className="flex items-center justify-between gap-3 pb-3">
//           <div>
//             <h1 className="text-base font-bold text-gray-900 leading-tight">Leads Pipeline</h1>
//             <p className="text-xs text-gray-400 mt-0.5">{leads.length} total leads</p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-0.5">
//               <button
//                 onClick={() => setView("kanban")}
//                 className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
//               >
//                 <Kanban className="h-3.5 w-3.5" /> Board
//               </button>
//               <button
//                 onClick={() => setView("table")}
//                 className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
//               >
//                 <LayoutList className="h-3.5 w-3.5" /> List
//               </button>
//             </div>

//             <Button
//               onClick={() => setAddOpen(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 text-xs font-medium flex items-center gap-1 shadow-sm"
//             >
//               <Plus className="h-3.5 w-3.5" /> Add Lead
//             </Button>
//           </div>
//         </div>

//         {/* Row 2: Search + Filters */}
//         <div className="flex items-center gap-2 pb-3 flex-wrap">
//           <div className="relative flex-1 min-w-[160px] max-w-xs">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//             <Input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search leads..."
//               className="pl-8 h-8 rounded-xl border-gray-200 text-sm bg-white"
//             />
//             {search && (
//               <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                 <X className="h-3 w-3" />
//               </button>
//             )}
//           </div>

//           <Select value={stageFilter} onValueChange={setStageFilter}>
//             <SelectTrigger className={cn("h-8 w-32 rounded-xl text-xs border bg-white shrink-0", stageFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
//               <SelectValue placeholder="All Stages" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Stages</SelectItem>
//               {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           <Select value={serviceFilter} onValueChange={setServiceFilter}>
//             <SelectTrigger className={cn("h-8 w-32 rounded-xl text-xs border bg-white shrink-0", serviceFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
//               <SelectValue placeholder="All Services" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Services</SelectItem>
//               {Object.entries(SERVICES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//             <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border bg-white shrink-0", priorityFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200")}>
//               <SelectValue placeholder="Priority" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Priority</SelectItem>
//               {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           {activeFilters > 0 && (
//             <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 shrink-0">
//               <X className="h-3 w-3" />Clear
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto px-6 py-4 space-y-4">

//         {/* ── Stats row ─────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           <StatCard
//             icon={<Users className="h-4.5 w-4.5 text-blue-500" />}
//             label="Total Leads"
//             value={stats.total}
//             trend="this month"
//             accentClass="border-l-blue-500"
//             borderClass="border-gray-100"
//           />
//           <StatCard
//             icon={<CheckCircle2 className="h-4.5 w-4.5 text-green-500" />}
//             label="Won Deals"
//             value={stats.won}
//             trend="closed"
//             accentClass="border-l-green-500"
//             borderClass="border-gray-100"
//           />
//           <StatCard
//             icon={<TrendingUp className="h-4.5 w-4.5 text-violet-500" />}
//             label="Pipeline Value"
//             value={fmt(stats.pipeline)}
//             trend="estimated"
//             accentClass="border-l-violet-500"
//             borderClass="border-gray-100"
//           />
//           <StatCard
//             icon={<Bell className={cn("h-4.5 w-4.5", stats.overdueFollowUps > 0 ? "text-red-500" : "text-amber-500")} />}
//             label="Follow-ups Due"
//             value={stats.overdueFollowUps}
//             trend={stats.overdueFollowUps > 0 ? "needs attention" : "all clear"}
//             accentClass={stats.overdueFollowUps > 0 ? "border-l-red-400" : "border-l-amber-400"}
//             borderClass="border-gray-100"
//           />
//         </div>

//         {/* ── KANBAN BOARD ──────────────────────────────────────────────── */}
//         {view === "kanban" && (
//           <div className="overflow-x-auto pb-2">
//             <div className="flex gap-3 min-w-max">
//               {STAGES.map((stage) => {
//                 const colLeads = grouped[stage.value] ?? [];
//                 const colValue = colLeads.reduce((s, l) => s + getAmount(l), 0);
//                 const isTarget = dropTarget === stage.value && draggingId !== null;

//                 return (
//                   <div
//                     key={stage.value}
//                     onDragOver={(e) => { e.preventDefault(); setDropTarget(stage.value); }}
//                     onDrop={(e) => onDrop(e, stage.value)}
//                     onDragLeave={() => setDropTarget(null)}
//                     className={cn(
//                       "w-64 flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-all shrink-0",
//                       stage.border,
//                       isTarget && "ring-2 ring-blue-400 ring-offset-1 shadow-lg scale-[1.01]"
//                     )}
//                   >
//                     <div className={cn("px-3.5 py-3 flex items-center justify-between", stage.bg)}>
//                       <div className="flex items-center gap-2">
//                         <span className="text-base">{stage.emoji}</span>
//                         <span className="font-semibold text-sm text-gray-800">{stage.label}</span>
//                       </div>
//                       <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stage.badge)}>
//                         {colLeads.length}
//                       </span>
//                     </div>
//                     {colValue > 0 && (
//                       <div className={cn("px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 border-b flex items-center gap-1", stage.border)}>
//                         <IndianRupee className="h-3 w-3" />{fmt(colValue)} total
//                       </div>
//                     )}
//                     <div className={cn("p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[62vh] transition-colors", isTarget && "bg-blue-50/30")}>
//                       {colLeads.length === 0 ? (
//                         <div className={cn("flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed text-gray-300 transition-colors", isTarget ? "border-blue-300 bg-blue-50/20 text-blue-400" : "border-gray-100")}>
//                           <Users className="h-6 w-6 mb-1 opacity-40" />
//                           <p className="text-xs font-medium">{isTarget ? "Drop here" : "No leads"}</p>
//                         </div>
//                       ) : (
//                         colLeads.map((lead) => (
//                           <LeadCard
//                             key={lead.id}
//                             lead={lead}
//                             onView={() => open(lead)}
//                             onEdit={() => edit(lead)}
//                             onDelete={() => del(lead.id)}
//                             onCall={() => call(lead)}
//                             onWhatsApp={() => wa(lead)}
//                             onFollowUp={() => fu(lead)}
//                             onConvert={() => conv(lead)}
//                             dragging={draggingId === lead.id}
//                             onDragStart={(e) => { setDraggingId(lead.id); e.dataTransfer.setData("leadId", lead.id); e.dataTransfer.effectAllowed = "move"; }}
//                             onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
//                           />
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── TABLE / LIST VIEW ─────────────────────────────────────────── */}
//         {view === "table" && (
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

//             {/* Column headers */}
//             <div
//               className="grid gap-0 px-4 py-2.5 bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
//               style={{ gridTemplateColumns: "2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px" }}
//             >
//               <div className="pl-12">Client</div>
//               <div>Service</div>
//               <div>Stage</div>
//               <div>Total Amt</div>
//               <div>Expected</div>
//               <div>Priority</div>
//               <div>Follow-up</div>
//               <div />
//             </div>

//             {filtered.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-gray-300">
//                 <Users className="h-10 w-10 mb-3 opacity-30" />
//                 <p className="text-sm font-medium text-gray-400">
//                   {search || activeFilters > 0 ? "No leads match your filters." : "No leads yet. Add your first one!"}
//                 </p>
//                 {(search || activeFilters > 0) ? (
//                   <button onClick={clearFilters} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
//                     <X className="h-3.5 w-3.5" />Clear filters
//                   </button>
//                 ) : (
//                   <Button
//                     onClick={() => setAddOpen(true)}
//                     className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-4 text-xs font-medium flex items-center gap-1 shadow-sm"
//                   >
//                     <Plus className="h-3.5 w-3.5" /> Add your first lead
//                   </Button>
//                 )}
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-50">
//                 {filtered.map((lead, idx) => {
//                   const sm  = stageMeta(lead.status as string);
//                   const svc = getService(lead);

//                   return (
//                     <div
//                       key={lead.id}
//                       onDoubleClick={() => open(lead)}
//                       className={cn(
//                         "grid gap-0 px-4 py-2.5 items-center transition-colors group relative",
//                         "hover:bg-blue-50/40",
//                         idx % 2 === 0 ? "bg-white" : "bg-gray-50/50",
//                       )}
//                       style={{ gridTemplateColumns: "2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px" }}
//                     >
//                       {/* Left accent bar on hover */}
//                       <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />

//                       {/* Client */}
//                       <div className="flex items-center gap-3 min-w-0 pr-2">
//                         <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
//                           <span className="text-xs font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
//                           {(lead as any).company && (
//                             <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>
//                           )}
//                           {(lead as any).phone && (
//                             <button
//                               onClick={(e) => { e.stopPropagation(); call(lead); }}
//                               className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium mt-0.5"
//                             >
//                               <Phone className="h-2.5 w-2.5" />{(lead as any).phone}
//                             </button>
//                           )}
//                         </div>
//                       </div>

//                       {/* Service */}
//                       <div className="pr-2">
//                         {svc ? (
//                           <span className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
//                             {svc}
//                           </span>
//                         ) : <span className="text-gray-300 text-xs">—</span>}
//                       </div>

//                       {/* Stage */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <Select value={lead.status as string} onValueChange={(v) => changeStage(lead.id, v)}>
//                           <SelectTrigger
//                             className={cn("h-7 text-xs border rounded-full px-2.5 w-auto min-w-[100px] font-medium focus:ring-0", sm.badge, "border-transparent")}
//                             style={{ boxShadow: "none" }}
//                           >
//                             <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 inline-block", sm.dot)} />
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {STAGES.map((s) => (
//                               <SelectItem key={s.value} value={s.value}>
//                                 <span className="flex items-center gap-2">
//                                   <span className={cn("w-2 h-2 rounded-full", s.dot)} />
//                                   {s.label}
//                                 </span>
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       {/* Total Amount */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableAmount lead={lead} onSave={(val) => saveAmount(lead.id, val)} />
//                       </div>

//                       {/* Expected Amount — NEW */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableExpectedAmount lead={lead} onSave={(val) => saveExpectedAmount(lead.id, val)} />
//                       </div>

//                       {/* Priority */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditablePriority lead={lead} onSave={(p) => savePriority(lead.id, p)} />
//                       </div>

//                       {/* Follow-up */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableFollowUp lead={lead} onSave={(d) => saveFollowUp(lead.id, d)} />
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
//                         <button onClick={() => call(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
//                           <Phone className="h-3.5 w-3.5" />
//                         </button>
//                         <button onClick={() => wa(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600">
//                           <MessageSquare className="h-3.5 w-3.5" />
//                         </button>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
//                               <MoreHorizontal className="h-3.5 w-3.5" />
//                             </button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="rounded-xl w-40 text-sm">
//                             <DropdownMenuItem onClick={() => open(lead)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => edit(lead)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => fu(lead)}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
//                             {lead.status === "won" && !(lead as any).isConverted && (
//                               <DropdownMenuItem onClick={() => conv(lead)}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
//                             )}
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem onClick={() => del(lead.id)} className="text-red-600 focus:text-red-600">
//                               <Trash2 className="mr-2 h-4 w-4" />Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Dialogs ───────────────────────────────────────────────────────── */}
//       <LeadDialog open={addOpen}  onOpenChange={setAddOpen}  lead={null}     mode="add" />
//       <LeadDialog open={editOpen} onOpenChange={setEditOpen} lead={selected} mode="edit" />

//       <LeadDetailDialog
//         open={detailOpen}
//         onOpenChange={setDetailOpen}
//         lead={selected}
//         onCallLead={call}
//         onEmailLead={(l) => { if (l.email) window.location.href = `mailto:${l.email}`; }}
//         onWhatsAppLead={wa}
//         onConvertLead={(l) => { setDetailOpen(false); conv(l); }}
//         onOpenFollowUp={(l) => { setDetailOpen(false); fu(l); }}
//       />

//       <ConvertLeadDialog
//         open={convertOpen}
//         onOpenChange={setConvertOpen}
//         lead={selected}
//         onSuccess={() => setSelected(null)}
//       />

//       <FollowUpDialog
//         open={followUpOpen}
//         onOpenChange={setFollowUpOpen}
//         lead={selected}
//       />
//     </div>
//   );
// }




//testing (24-6-2026)





// "use client";

// import type React from "react";
// import { useState, useMemo, useCallback, useRef, useEffect } from "react";
// import { useCRM } from "@/contexts/crm-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//   DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { LeadDialog }        from "./lead-dialog";
// import { LeadDetailDialog }  from "./lead-detail-dialog";
// import { ConvertLeadDialog } from "./convert-lead-dialog";
// import { FollowUpDialog }    from "./follow-up-dialog";
// import {
//   Plus, Search, Phone, MessageSquare,
//   MoreHorizontal, Edit, Trash2, Eye, UserCheck,
//   Kanban, LayoutList, Bell, IndianRupee, AlertCircle,
//   GripVertical, X, Users, TrendingUp,
//   CheckCircle2, Clock, CalendarIcon, ArrowUpRight,
//   Target, Filter, SlidersHorizontal,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
// import type { Lead } from "@/types/crm";

// // ─── Pipeline Stages ──────────────────────────────────────────────────────────
// const STAGES = [
//   { value: "lead",        label: "Lead",        emoji: "🌱", bg: "bg-slate-50",  border: "border-slate-200", dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600" },
//   { value: "demo",        label: "Demo",        emoji: "🎯", bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
//   { value: "proposal",    label: "Proposal",    emoji: "📄", bg: "bg-violet-50", border: "border-violet-200",dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700" },
//   { value: "negotiation", label: "Negotiation", emoji: "🤝", bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700" },
//   { value: "won",         label: "Won",         emoji: "🎉", bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500",   badge: "bg-green-100 text-green-700" },
//   { value: "lost",        label: "Lost",        emoji: "❌", bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-400",     badge: "bg-red-100 text-red-600" },
// ] as const;

// type StageValue = typeof STAGES[number]["value"];

// const SERVICES: Record<string, string> = {
//   website:       "Website",
//   whatsapp:      "WhatsApp",
//   lms:           "LMS",
//   crm:           "CRM",
//   "social-media":"Social Media",
//   other:         "Other",
// };

// const PRIORITIES = [
//   { value: "high",   label: "High",   color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
//   { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
//   { value: "low",    label: "Low",    color: "bg-gray-100 text-gray-600",      dot: "bg-gray-300" },
// ] as const;

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmt = (v: number) =>
//   v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

// const fmtDate = (v: unknown) => {
//   if (!v) return null;
//   const d = v instanceof Date ? v : new Date(v as string);
//   if (isNaN(d.getTime())) return null;
//   return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
// };

// const isOverdue = (d?: string | null) => {
//   if (!d) return false;
//   const t = new Date(); t.setHours(0, 0, 0, 0);
//   return new Date(d) < t;
// };

// const stageMeta  = (v: string) => STAGES.find((s) => s.value === v) ?? STAGES[0];
// const priMeta    = (v: string) => PRIORITIES.find((p) => p.value === v) ?? PRIORITIES[1];
// const getService = (l: Lead)   => SERVICES[(l as any).service ?? ""] ?? (l as any).service ?? "";

// const getAmount = (l: Lead) => {
//   const v = (l as any).totalAmount ?? (l as any).total_amount ?? l.estimatedValue ?? 0;
//   return typeof v === "number" ? v : Number(v ?? 0);
// };

// const getExpectedAmount = (l: Lead) => {
//   const v = (l as any).expectedAmount ?? (l as any).expected_amount ?? 0;
//   return typeof v === "number" ? v : Number(v ?? 0);
// };

// const getFollowUp = (l: Lead) => (l as any).follow_up_date as string | null | undefined;

// const getUpdatedAt = (l: Lead): number => {
//   const v = (l as any).updatedAt ?? (l as any).updated_at ?? (l as any).createdAt ?? (l as any).created_at;
//   if (!v) return 0;
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? 0 : d.getTime();
// };

// // ─── Inline Editable Amount Cell ──────────────────────────────────────────────

// function EditableAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
//   const [editing, setEditing] = useState(false);
//   const amount = getAmount(lead);
//   const [val, setVal] = useState(String(amount || ""));
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

//   const commit = () => {
//     const n = Number(val);
//     if (!isNaN(n) && n >= 0) onSave(n);
//     setEditing(false);
//   };

//   if (editing) {
//     return (
//       <div className="flex items-center gap-1">
//         <span className="text-emerald-500 text-xs">₹</span>
//         <input
//           ref={inputRef}
//           type="number"
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           className="w-24 h-7 text-sm border border-blue-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-blue-400"
//         />
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={() => { setVal(String(amount || "")); setEditing(true); }}
//       className="flex items-center gap-0.5 text-sm font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group"
//       title="Click to edit amount"
//     >
//       {amount > 0 ? (
//         <>
//           <IndianRupee className="h-3 w-3 text-emerald-500 group-hover:text-blue-500" />
//           {amount.toLocaleString("en-IN")}
//         </>
//       ) : (
//         <span className="text-gray-300 group-hover:text-blue-400 text-xs font-medium">+ Amount</span>
//       )}
//     </button>
//   );
// }

// // ─── Inline Editable Expected Amount Cell ─────────────────────────────────────

// function EditableExpectedAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
//   const [editing, setEditing] = useState(false);
//   const amount = getExpectedAmount(lead);
//   const [val, setVal] = useState(String(amount || ""));
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

//   const commit = () => {
//     const n = Number(val);
//     if (!isNaN(n) && n >= 0) onSave(n);
//     setEditing(false);
//   };

//   if (editing) {
//     return (
//       <div className="flex items-center gap-1">
//         <span className="text-amber-500 text-xs">₹</span>
//         <input
//           ref={inputRef}
//           type="number"
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           className="w-24 h-7 text-sm border border-amber-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-amber-400"
//         />
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={() => { setVal(String(amount || "")); setEditing(true); }}
//       className="flex items-center gap-0.5 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors group"
//       title="Click to edit expected amount"
//     >
//       {amount > 0 ? (
//         <>
//           <IndianRupee className="h-3 w-3 text-amber-400 group-hover:text-amber-600" />
//           {amount.toLocaleString("en-IN")}
//         </>
//       ) : (
//         <span className="text-gray-300 group-hover:text-amber-400 text-xs font-medium">+ Expected</span>
//       )}
//     </button>
//   );
// }

// // ─── Inline Editable Follow-up Cell ───────────────────────────────────────────

// function EditableFollowUp({ lead, onSave }: { lead: Lead; onSave: (date: Date | undefined) => void }) {
//   const [open, setOpen] = useState(false);
//   const fud = getFollowUp(lead);
//   const od  = isOverdue(fud);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <button
//           className={cn(
//             "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
//             fud
//               ? od
//                 ? "text-red-600 hover:bg-red-50"
//                 : "text-amber-600 hover:bg-amber-50"
//               : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
//           )}
//           title="Click to set follow-up date"
//         >
//           {fud ? (
//             <>
//               {od ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
//               {fmtDate(fud)}
//               {od && " ⚠️"}
//             </>
//           ) : (
//             <>
//               <CalendarIcon className="h-3 w-3" />
//               + Set date
//             </>
//           )}
//         </button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar
//           mode="single"
//           selected={fud ? new Date(fud) : undefined}
//           onSelect={(d) => { onSave(d); setOpen(false); }}
//           initialFocus
//         />
//         {fud && (
//           <div className="p-2 border-t">
//             <button
//               onClick={() => { onSave(undefined); setOpen(false); }}
//               className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded"
//             >
//               Clear date
//             </button>
//           </div>
//         )}
//       </PopoverContent>
//     </Popover>
//   );
// }

// // ─── Inline Editable Priority Cell ────────────────────────────────────────────

// function EditablePriority({ lead, onSave }: { lead: Lead; onSave: (priority: string) => void }) {
//   const pm = priMeta(lead.priority as string);

//   return (
//     <Select value={lead.priority as string} onValueChange={onSave}>
//       <SelectTrigger
//         className={cn(
//           "h-7 text-xs border-0 rounded-full px-2.5 font-semibold focus:ring-0 w-auto min-w-[80px] cursor-pointer",
//           pm.color
//         )}
//         style={{ boxShadow: "none" }}
//       >
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         {PRIORITIES.map((p) => (
//           <SelectItem key={p.value} value={p.value}>
//             <span className="flex items-center gap-2">
//               <span className={cn("w-2 h-2 rounded-full", p.dot)} />
//               {p.label}
//             </span>
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

// // ─── Lead Card (Kanban) ───────────────────────────────────────────────────────

// function LeadCard({
//   lead, onView, onEdit, onDelete, onCall, onWhatsApp, onFollowUp, onConvert,
//   dragging, onDragStart, onDragEnd,
// }: {
//   lead: Lead;
//   onView: () => void; onEdit: () => void; onDelete: () => void;
//   onCall: () => void; onWhatsApp: () => void; onFollowUp: () => void;
//   onConvert: () => void;
//   dragging: boolean;
//   onDragStart: (e: React.DragEvent) => void;
//   onDragEnd: () => void;
// }) {
//   const pm             = priMeta(lead.priority as string);
//   const amount         = getAmount(lead);
//   const expectedAmount = getExpectedAmount(lead);
//   const fud            = getFollowUp(lead);
//   const overdue        = isOverdue(fud);
//   const svc            = getService(lead);
//   const isWon          = lead.status === "won";

//   return (
//     <div
//       draggable
//       onDragStart={onDragStart}
//       onDragEnd={onDragEnd}
//       onDoubleClick={onView}
//       className={cn(
//         "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
//         dragging ? "opacity-40 scale-95 border-blue-400" : "border-gray-100 hover:border-blue-200"
//       )}
//     >
//       <div className={cn("h-1 w-full rounded-t-2xl", pm.value === "high" ? "bg-red-400" : pm.value === "medium" ? "bg-yellow-400" : "bg-gray-200")} />
//       <div className="p-3.5 space-y-3">
//         <div className="flex items-start justify-between gap-2">
//           <div className="flex items-center gap-2.5 min-w-0">
//             <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
//             <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
//               <span className="text-sm font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
//             </div>
//             <div className="min-w-0">
//               <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
//               {(lead as any).company && <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>}
//             </div>
//           </div>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 rounded-lg shrink-0">
//                 <MoreHorizontal className="h-3.5 w-3.5" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="rounded-xl w-44 text-sm">
//               <DropdownMenuItem onClick={onView}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
//               <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
//               <DropdownMenuItem onClick={onFollowUp}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
//               {isWon && !(lead as any).isConverted && (
//                 <DropdownMenuItem onClick={onConvert}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
//               )}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
//                 <Trash2 className="mr-2 h-4 w-4" />Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {svc && (
//           <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg">
//             {svc}
//           </span>
//         )}

//         {amount > 0 && (
//           <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
//             <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
//             {amount.toLocaleString("en-IN")}
//           </div>
//         )}

//         {expectedAmount > 0 && expectedAmount !== amount && (
//           <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
//             <IndianRupee className="h-3 w-3 text-amber-400" />
//             {expectedAmount.toLocaleString("en-IN")}
//             <span className="text-gray-400 font-normal">expected</span>
//           </div>
//         )}

//         {fud && (
//           <div className={cn(
//             "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-medium",
//             overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
//           )}>
//             {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
//             Follow-up: {fmtDate(fud)}
//             {overdue && " · Overdue!"}
//           </div>
//         )}

//         <div className="flex items-center justify-between pt-1 border-t border-gray-50">
//           <div className="flex items-center gap-1">
//             <button onClick={onCall} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
//               <Phone className="h-3.5 w-3.5" />
//             </button>
//             <button onClick={onWhatsApp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
//               <MessageSquare className="h-3.5 w-3.5" />
//             </button>
//             <button onClick={onFollowUp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
//               <Bell className="h-3.5 w-3.5" />
//             </button>
//           </div>
//           <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", pm.color)}>
//             {pm.label}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Premium Stat Card ────────────────────────────────────────────────────────

// function StatCard({
//   icon,
//   label,
//   value,
//   sub,
//   accentColor,
//   gradient,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string | number;
//   sub?: string;
//   accentColor: string;
//   gradient: string;
// }) {
//   return (
//     <div className={cn(
//       "relative overflow-hidden rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-200 group cursor-default",
//       gradient,
//     )}>
//       {/* Decorative circle */}
//       <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: accentColor }} />
//       <div className="relative px-4 py-3.5 flex items-center gap-3">
//         <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: `${accentColor}18` }}>
//           {icon}
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="text-xl font-extrabold text-gray-900 leading-none tabular-nums">{value}</div>
//           <div className="text-[11px] font-semibold text-gray-500 mt-0.5 truncate">{label}</div>
//           {sub && (
//             <div className="flex items-center gap-0.5 mt-1">
//               <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
//               <span className="text-[10px] text-emerald-600 font-bold truncate">{sub}</span>
//             </div>
//           )}
//         </div>
//       </div>
//       {/* Bottom accent bar */}
//       <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: accentColor, opacity: 0.35 }} />
//     </div>
//   );
// }

// // ─── Date Range Picker ────────────────────────────────────────────────────────

// function DateRangePicker({
//   from, to, onFromChange, onToChange, onClear,
// }: {
//   from: Date | undefined;
//   to: Date | undefined;
//   onFromChange: (d: Date | undefined) => void;
//   onToChange: (d: Date | undefined) => void;
//   onClear: () => void;
// }) {
//   const hasDate = from || to;

//   return (
//     <div className={cn(
//       "flex items-center gap-1.5 rounded-xl border px-2 py-1 bg-white text-xs transition-all",
//       hasDate ? "border-blue-400 bg-blue-50" : "border-gray-200"
//     )}>
//       <CalendarIcon className={cn("h-3.5 w-3.5 shrink-0", hasDate ? "text-blue-500" : "text-gray-400")} />

//       {/* From */}
//       <Popover>
//         <PopoverTrigger asChild>
//           <button className={cn("font-medium transition-colors whitespace-nowrap", from ? "text-blue-700" : "text-gray-400 hover:text-gray-600")}>
//             {from ? format(from, "d MMM") : "From"}
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             mode="single"
//             selected={from}
//             onSelect={onFromChange}
//             disabled={(d) => (to ? d > to : false)}
//             initialFocus
//           />
//           {from && (
//             <div className="p-2 border-t">
//               <button onClick={() => onFromChange(undefined)} className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded">
//                 Clear
//               </button>
//             </div>
//           )}
//         </PopoverContent>
//       </Popover>

//       <span className="text-gray-300">→</span>

//       {/* To */}
//       <Popover>
//         <PopoverTrigger asChild>
//           <button className={cn("font-medium transition-colors whitespace-nowrap", to ? "text-blue-700" : "text-gray-400 hover:text-gray-600")}>
//             {to ? format(to, "d MMM") : "To"}
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             mode="single"
//             selected={to}
//             onSelect={onToChange}
//             disabled={(d) => (from ? d < from : false)}
//             initialFocus
//           />
//           {to && (
//             <div className="p-2 border-t">
//               <button onClick={() => onToChange(undefined)} className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded">
//                 Clear
//               </button>
//             </div>
//           )}
//         </PopoverContent>
//       </Popover>

//       {hasDate && (
//         <button onClick={onClear} className="ml-0.5 text-blue-400 hover:text-blue-600 transition-colors">
//           <X className="h-3 w-3" />
//         </button>
//       )}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function LeadsContent() {
//   const { leads, deleteLead, updateLead } = useCRM();

//   const [view,          setView]          = useState<"kanban" | "table">("table");
//   const [search,        setSearch]        = useState("");
//   const [stageFilter,   setStageFilter]   = useState("all");
//   const [serviceFilter, setServiceFilter] = useState("all");
//   const [priorityFilter,setPriorityFilter]= useState("all");

//   // Date range filter
//   const [dateFrom,      setDateFrom]      = useState<Date | undefined>(undefined);
//   const [dateTo,        setDateTo]        = useState<Date | undefined>(undefined);

//   // Recently touched lead IDs — for floating to top (Change #4)
//   const [recentlyTouched, setRecentlyTouched] = useState<Set<string>>(new Set());

//   const [selected,      setSelected]      = useState<Lead | null>(null);
//   const [addOpen,       setAddOpen]       = useState(false);
//   const [editOpen,      setEditOpen]      = useState(false);
//   const [detailOpen,    setDetailOpen]    = useState(false);
//   const [convertOpen,   setConvertOpen]   = useState(false);
//   const [followUpOpen,  setFollowUpOpen]  = useState(false);

//   const [draggingId,    setDraggingId]    = useState<string | null>(null);
//   const [dropTarget,    setDropTarget]    = useState<string | null>(null);

//   // Mark a lead as recently touched and float it to top
//   const touchLead = useCallback((id: string) => {
//     setRecentlyTouched((prev) => new Set([id, ...prev]));
//   }, []);

//   // Date range filter predicate
//   const inDateRange = useCallback((lead: Lead) => {
//     if (!dateFrom && !dateTo) return true;
//     const raw = (lead as any).createdAt ?? (lead as any).created_at;
//     if (!raw) return false;
//     const d = new Date(raw);
//     if (isNaN(d.getTime())) return false;
//     if (dateFrom && d < startOfDay(dateFrom)) return false;
//     if (dateTo && d > endOfDay(dateTo)) return false;
//     return true;
//   }, [dateFrom, dateTo]);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     const base = leads.filter((l) => {
//       if (q && !l.name?.toLowerCase().includes(q) && !(l as any).company?.toLowerCase().includes(q)) return false;
//       if (stageFilter    !== "all" && l.status !== stageFilter)             return false;
//       if (serviceFilter  !== "all" && (l as any).service !== serviceFilter) return false;
//       if (priorityFilter !== "all" && l.priority !== priorityFilter)        return false;
//       if (!inDateRange(l))                                                  return false;
//       return true;
//     });

//     // Sort: recently touched float to top, then by updatedAt desc
//     return [...base].sort((a, b) => {
//       const aTouched = recentlyTouched.has(a.id) ? 1 : 0;
//       const bTouched = recentlyTouched.has(b.id) ? 1 : 0;
//       if (bTouched !== aTouched) return bTouched - aTouched;
//       return getUpdatedAt(b) - getUpdatedAt(a);
//     });
//   }, [leads, search, stageFilter, serviceFilter, priorityFilter, inDateRange, recentlyTouched]);

//   const grouped = useMemo(() => {
//     const map = Object.fromEntries(STAGES.map((s) => [s.value, [] as Lead[]]));
//     filtered.forEach((l) => { if (map[l.status as string]) map[l.status as string].push(l); });
//     return map as Record<StageValue, Lead[]>;
//   }, [filtered]);

//   // Stat cards are computed from the *filtered* leads (Change #3)
//   const stats = useMemo(() => {
//     const src = filtered;
//     return {
//       total:    src.length,
//       won:      src.filter((l) => l.status === "won").length,
//       pipeline: src.reduce((s, l) => s + getAmount(l), 0),
//       expected: src.reduce((s, l) => s + getExpectedAmount(l), 0),
//       overdueFollowUps: src.filter((l) =>
//         isOverdue(getFollowUp(l)) && !["won", "lost"].includes(l.status as string)
//       ).length,
//     };
//   }, [filtered]);

//   const open = (l: Lead) => { setSelected(l); setDetailOpen(true); };
//   const edit = (l: Lead) => { setSelected(l); setEditOpen(true); };
//   const del  = (id: string) => {
//     if (window.confirm("Delete this lead?")) void deleteLead(id);
//   };
//   const call = (l: Lead) => { if ((l as any).phone) window.open(`tel:${(l as any).phone}`); };
//   const wa   = (l: Lead) => {
//     const n = l.whatsappNumber || (l as any).phone;
//     if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("Hi, following up on your Vasifytech enquiry.")}`, "_blank");
//   };
//   const fu   = (l: Lead) => { setSelected(l); setFollowUpOpen(true); };
//   const conv = (l: Lead) => { setSelected(l); setConvertOpen(true); };

//   const saveAmount = useCallback(async (id: string, amount: number) => {
//     await updateLead(id, { totalAmount: amount, estimatedValue: amount } as any);
//     touchLead(id);
//   }, [updateLead, touchLead]);

//   const saveExpectedAmount = useCallback(async (id: string, amount: number) => {
//     await updateLead(id, { expectedAmount: amount } as any);
//     touchLead(id);
//   }, [updateLead, touchLead]);

//   const saveFollowUp = useCallback(async (id: string, date: Date | undefined) => {
//     await updateLead(id, {
//       followUpDate: date ? date.toISOString().split("T")[0] : null,
//     } as any);
//     touchLead(id);
//   }, [updateLead, touchLead]);

//   const savePriority = useCallback(async (id: string, priority: string) => {
//     await updateLead(id, { priority: priority as Lead["priority"] });
//     touchLead(id);
//   }, [updateLead, touchLead]);

//   const changeStage = useCallback(async (id: string, stage: string) => {
//     await updateLead(id, { status: stage as Lead["status"], pipelineStage: stage } as any);
//     touchLead(id);
//   }, [updateLead, touchLead]);

//   const onDrop = async (e: React.DragEvent, stage: string) => {
//     e.preventDefault();
//     const id = e.dataTransfer.getData("leadId");
//     setDraggingId(null); setDropTarget(null);
//     if (id) await changeStage(id, stage);
//   };

//   const activeFilters = [
//     stageFilter !== "all",
//     serviceFilter !== "all",
//     priorityFilter !== "all",
//     !!dateFrom || !!dateTo,
//   ].filter(Boolean).length;

//   const clearFilters = () => {
//     setStageFilter("all"); setServiceFilter("all"); setPriorityFilter("all");
//     setSearch(""); setDateFrom(undefined); setDateTo(undefined);
//   };

//   // Filter label for stat cards context hint
//   const filterLabel = useMemo(() => {
//     const parts: string[] = [];
//     if (priorityFilter !== "all") parts.push(`${priorityFilter} priority`);
//     if (stageFilter !== "all")    parts.push(stageFilter);
//     if (serviceFilter !== "all")  parts.push(SERVICES[serviceFilter] ?? serviceFilter);
//     if (dateFrom || dateTo)       parts.push("date range");
//     if (search)                   parts.push(`"${search}"`);
//     return parts.length > 0 ? parts.join(", ") : null;
//   }, [priorityFilter, stageFilter, serviceFilter, dateFrom, dateTo, search]);

//   return (
//     <div className="flex flex-col h-full bg-[#F4F6FB]">

//       {/* ── Top Bar ─────────────────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-4 pb-0 sticky top-0 z-20 shadow-sm">

//         {/* Row 1: Title + view toggle + CTA */}
//         <div className="flex items-center justify-between gap-3 pb-3">
//           <div>
//             <h1 className="text-base font-extrabold text-gray-900 leading-tight tracking-tight">Leads Pipeline</h1>
//             <p className="text-xs text-gray-400 mt-0.5 font-medium">
//               {leads.length} total leads
//               {filterLabel && (
//                 <span className="ml-1.5 inline-flex items-center gap-1 text-blue-600 font-semibold">
//                   <Filter className="h-2.5 w-2.5" />
//                   {filterLabel}
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-0.5">
//               <button
//                 onClick={() => setView("kanban")}
//                 className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all", view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
//               >
//                 <Kanban className="h-3.5 w-3.5" /> Board
//               </button>
//               <button
//                 onClick={() => setView("table")}
//                 className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all", view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
//               >
//                 <LayoutList className="h-3.5 w-3.5" /> List
//               </button>
//             </div>

//             <Button
//               onClick={() => setAddOpen(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
//             >
//               <Plus className="h-3.5 w-3.5" /> Add Lead
//             </Button>
//           </div>
//         </div>

//         {/* Row 2: Search + Filters */}
//         <div className="flex items-center gap-2 pb-3 flex-wrap">
//           <div className="relative min-w-[150px] max-w-xs flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//             <Input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search leads..."
//               className="pl-8 h-8 rounded-xl border-gray-200 text-sm bg-white"
//             />
//             {search && (
//               <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                 <X className="h-3 w-3" />
//               </button>
//             )}
//           </div>

//           {/* Date range picker — Change #1 */}
//           <DateRangePicker
//             from={dateFrom}
//             to={dateTo}
//             onFromChange={setDateFrom}
//             onToChange={setDateTo}
//             onClear={() => { setDateFrom(undefined); setDateTo(undefined); }}
//           />

//           <Select value={stageFilter} onValueChange={setStageFilter}>
//             <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border bg-white shrink-0", stageFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
//               <SelectValue placeholder="All Stages" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Stages</SelectItem>
//               {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           <Select value={serviceFilter} onValueChange={setServiceFilter}>
//             <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border bg-white shrink-0", serviceFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
//               <SelectValue placeholder="All Services" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Services</SelectItem>
//               {Object.entries(SERVICES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//             <SelectTrigger className={cn("h-8 w-24 rounded-xl text-xs border bg-white shrink-0", priorityFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
//               <SelectValue placeholder="Priority" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Priority</SelectItem>
//               {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           {activeFilters > 0 && (
//             <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
//               <X className="h-3 w-3" />
//               Clear {activeFilters > 1 ? `(${activeFilters})` : ""}
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4">

//         {/* ── Stats row — filter-aware (Changes #2, #3) ─────────────────── */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//           <StatCard
//             icon={<Users className="h-4 w-4" style={{ color: "#4F46E5" }} />}
//             label="Total Leads"
//             value={stats.total}
//             sub={filterLabel ? `filtered · ${leads.length} total` : "all leads"}
//             accentColor="#4F46E5"
//             gradient="bg-gradient-to-br from-white to-indigo-50/60"
//           />
//           <StatCard
//             icon={<CheckCircle2 className="h-4 w-4" style={{ color: "#059669" }} />}
//             label="Won Deals"
//             value={stats.won}
//             sub="closed"
//             accentColor="#059669"
//             gradient="bg-gradient-to-br from-white to-emerald-50/60"
//           />
//           <StatCard
//             icon={<TrendingUp className="h-4 w-4" style={{ color: "#7C3AED" }} />}
//             label="Pipeline Value"
//             value={fmt(stats.pipeline)}
//             sub="total amount"
//             accentColor="#7C3AED"
//             gradient="bg-gradient-to-br from-white to-violet-50/60"
//           />
//           {/* Change #2 — Expected amount stat card */}
//           <StatCard
//             icon={<Target className="h-4 w-4" style={{ color: "#D97706" }} />}
//             label="Expected Value"
//             value={fmt(stats.expected)}
//             sub="what you'll collect"
//             accentColor="#D97706"
//             gradient="bg-gradient-to-br from-white to-amber-50/60"
//           />
//           <StatCard
//             icon={<Bell className="h-4 w-4" style={{ color: stats.overdueFollowUps > 0 ? "#E11D48" : "#F59E0B" }} />}
//             label="Follow-ups Due"
//             value={stats.overdueFollowUps}
//             sub={stats.overdueFollowUps > 0 ? "needs attention" : "all clear"}
//             accentColor={stats.overdueFollowUps > 0 ? "#E11D48" : "#F59E0B"}
//             gradient={stats.overdueFollowUps > 0
//               ? "bg-gradient-to-br from-white to-red-50/60"
//               : "bg-gradient-to-br from-white to-amber-50/60"
//             }
//           />
//         </div>

//         {/* ── KANBAN BOARD ──────────────────────────────────────────────── */}
//         {view === "kanban" && (
//           <div className="overflow-x-auto pb-2">
//             <div className="flex gap-3 min-w-max">
//               {STAGES.map((stage) => {
//                 const colLeads = grouped[stage.value] ?? [];
//                 const colValue = colLeads.reduce((s, l) => s + getAmount(l), 0);
//                 const isTarget = dropTarget === stage.value && draggingId !== null;

//                 return (
//                   <div
//                     key={stage.value}
//                     onDragOver={(e) => { e.preventDefault(); setDropTarget(stage.value); }}
//                     onDrop={(e) => onDrop(e, stage.value)}
//                     onDragLeave={() => setDropTarget(null)}
//                     className={cn(
//                       "w-64 flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-all shrink-0",
//                       stage.border,
//                       isTarget && "ring-2 ring-blue-400 ring-offset-1 shadow-lg scale-[1.01]"
//                     )}
//                   >
//                     <div className={cn("px-3.5 py-3 flex items-center justify-between", stage.bg)}>
//                       <div className="flex items-center gap-2">
//                         <span className="text-base">{stage.emoji}</span>
//                         <span className="font-bold text-sm text-gray-800">{stage.label}</span>
//                       </div>
//                       <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stage.badge)}>
//                         {colLeads.length}
//                       </span>
//                     </div>
//                     {colValue > 0 && (
//                       <div className={cn("px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 border-b flex items-center gap-1", stage.border)}>
//                         <IndianRupee className="h-3 w-3" />{fmt(colValue)} total
//                       </div>
//                     )}
//                     <div className={cn("p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[62vh] transition-colors", isTarget && "bg-blue-50/30")}>
//                       {colLeads.length === 0 ? (
//                         <div className={cn("flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed text-gray-300 transition-colors", isTarget ? "border-blue-300 bg-blue-50/20 text-blue-400" : "border-gray-100")}>
//                           <Users className="h-6 w-6 mb-1 opacity-40" />
//                           <p className="text-xs font-medium">{isTarget ? "Drop here" : "No leads"}</p>
//                         </div>
//                       ) : (
//                         colLeads.map((lead) => (
//                           <LeadCard
//                             key={lead.id}
//                             lead={lead}
//                             onView={() => open(lead)}
//                             onEdit={() => { touchLead(lead.id); edit(lead); }}
//                             onDelete={() => del(lead.id)}
//                             onCall={() => call(lead)}
//                             onWhatsApp={() => wa(lead)}
//                             onFollowUp={() => fu(lead)}
//                             onConvert={() => conv(lead)}
//                             dragging={draggingId === lead.id}
//                             onDragStart={(e) => { setDraggingId(lead.id); e.dataTransfer.setData("leadId", lead.id); e.dataTransfer.effectAllowed = "move"; }}
//                             onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
//                           />
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── TABLE / LIST VIEW ─────────────────────────────────────────── */}
//         {view === "table" && (
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

//             {/* Column headers */}
//             <div
//               className="grid gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest"
//               style={{ gridTemplateColumns: "2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px" }}
//             >
//               <div className="pl-12">Client</div>
//               <div>Service</div>
//               <div>Stage</div>
//               <div>Total Amt</div>
//               <div>Expected</div>
//               <div>Priority</div>
//               <div>Follow-up</div>
//               <div />
//             </div>

//             {filtered.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-gray-300">
//                 <Users className="h-10 w-10 mb-3 opacity-30" />
//                 <p className="text-sm font-semibold text-gray-400">
//                   {search || activeFilters > 0 ? "No leads match your filters." : "No leads yet. Add your first one!"}
//                 </p>
//                 {(search || activeFilters > 0) ? (
//                   <button onClick={clearFilters} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1">
//                     <X className="h-3.5 w-3.5" />Clear filters
//                   </button>
//                 ) : (
//                   <Button
//                     onClick={() => setAddOpen(true)}
//                     className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
//                   >
//                     <Plus className="h-3.5 w-3.5" /> Add your first lead
//                   </Button>
//                 )}
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-50">
//                 {filtered.map((lead, idx) => {
//                   const sm  = stageMeta(lead.status as string);
//                   const svc = getService(lead);
//                   const isRecent = recentlyTouched.has(lead.id);

//                   return (
//                     <div
//                       key={lead.id}
//                       onDoubleClick={() => open(lead)}
//                       className={cn(
//                         "grid gap-0 px-4 py-2.5 items-center transition-colors group relative",
//                         "hover:bg-blue-50/40",
//                         isRecent ? "bg-blue-50/20" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
//                       )}
//                       style={{ gridTemplateColumns: "2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px" }}
//                     >
//                       {/* Left accent bar on hover */}
//                       <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />

//                       {/* Recently-touched indicator */}
//                       {isRecent && (
//                         <span className="absolute left-0 top-0 h-full w-[3px] bg-indigo-400 rounded-r opacity-60" />
//                       )}

//                       {/* Client */}
//                       <div className="flex items-center gap-3 min-w-0 pr-2">
//                         <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
//                           <span className="text-xs font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
//                         </div>
//                         <div className="min-w-0">
//                           <div className="flex items-center gap-1.5">
//                             <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
//                             {isRecent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" title="Recently updated" />}
//                           </div>
//                           {(lead as any).company && (
//                             <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>
//                           )}
//                           {(lead as any).phone && (
//                             <button
//                               onClick={(e) => { e.stopPropagation(); call(lead); }}
//                               className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium mt-0.5"
//                             >
//                               <Phone className="h-2.5 w-2.5" />{(lead as any).phone}
//                             </button>
//                           )}
//                         </div>
//                       </div>

//                       {/* Service */}
//                       <div className="pr-2">
//                         {svc ? (
//                           <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
//                             {svc}
//                           </span>
//                         ) : <span className="text-gray-300 text-xs">—</span>}
//                       </div>

//                       {/* Stage */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <Select value={lead.status as string} onValueChange={(v) => changeStage(lead.id, v)}>
//                           <SelectTrigger
//                             className={cn("h-7 text-xs border rounded-full px-2.5 w-auto min-w-[100px] font-semibold focus:ring-0", sm.badge, "border-transparent")}
//                             style={{ boxShadow: "none" }}
//                           >
//                             <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 inline-block", sm.dot)} />
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {STAGES.map((s) => (
//                               <SelectItem key={s.value} value={s.value}>
//                                 <span className="flex items-center gap-2">
//                                   <span className={cn("w-2 h-2 rounded-full", s.dot)} />
//                                   {s.label}
//                                 </span>
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       {/* Total Amount */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableAmount lead={lead} onSave={(val) => saveAmount(lead.id, val)} />
//                       </div>

//                       {/* Expected Amount */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableExpectedAmount lead={lead} onSave={(val) => saveExpectedAmount(lead.id, val)} />
//                       </div>

//                       {/* Priority */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditablePriority lead={lead} onSave={(p) => savePriority(lead.id, p)} />
//                       </div>

//                       {/* Follow-up */}
//                       <div onClick={(e) => e.stopPropagation()} className="pr-2">
//                         <EditableFollowUp lead={lead} onSave={(d) => saveFollowUp(lead.id, d)} />
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
//                         <button onClick={() => call(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
//                           <Phone className="h-3.5 w-3.5" />
//                         </button>
//                         <button onClick={() => wa(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600">
//                           <MessageSquare className="h-3.5 w-3.5" />
//                         </button>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
//                               <MoreHorizontal className="h-3.5 w-3.5" />
//                             </button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="rounded-xl w-40 text-sm">
//                             <DropdownMenuItem onClick={() => open(lead)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => { touchLead(lead.id); edit(lead); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => { touchLead(lead.id); fu(lead); }}><Bell className="mr-2 h-4 w-4" />Follow-up</DropdownMenuItem>
//                             {lead.status === "won" && !(lead as any).isConverted && (
//                               <DropdownMenuItem onClick={() => { touchLead(lead.id); conv(lead); }}><UserCheck className="mr-2 h-4 w-4" />Convert</DropdownMenuItem>
//                             )}
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem onClick={() => del(lead.id)} className="text-red-600 focus:text-red-600">
//                               <Trash2 className="mr-2 h-4 w-4" />Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Dialogs ───────────────────────────────────────────────────────── */}
//       <LeadDialog open={addOpen}  onOpenChange={setAddOpen}  lead={null}     mode="add" />
//       <LeadDialog
//         open={editOpen}
//         onOpenChange={(o) => {
//           setEditOpen(o);
//           if (!o && selected) touchLead(selected.id);
//         }}
//         lead={selected}
//         mode="edit"
//       />

//       <LeadDetailDialog
//         open={detailOpen}
//         onOpenChange={setDetailOpen}
//         lead={selected}
//         onCallLead={call}
//         onEmailLead={(l) => { if (l.email) window.location.href = `mailto:${l.email}`; }}
//         onWhatsAppLead={wa}
//         onConvertLead={(l) => { setDetailOpen(false); touchLead(l.id); conv(l); }}
//         onOpenFollowUp={(l) => { setDetailOpen(false); touchLead(l.id); fu(l); }}
//       />

//       <ConvertLeadDialog
//         open={convertOpen}
//         onOpenChange={(o) => {
//           setConvertOpen(o);
//           if (!o && selected) touchLead(selected.id);
//         }}
//         lead={selected}
//         onSuccess={() => setSelected(null)}
//       />

//       <FollowUpDialog
//         open={followUpOpen}
//         onOpenChange={(o) => {
//           setFollowUpOpen(o);
//           if (!o && selected) touchLead(selected.id);
//         }}
//         lead={selected}
//       />
//     </div>
//   );
// }



//testing 2 (Ui improvement)



"use client";

import type React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle2, Clock, CalendarIcon, ArrowUpRight,
  Target, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay } from "date-fns";
import type { Lead } from "@/types/crm";

const STAGES = [
  { value: "lead",        label: "Lead",        emoji: "🌱", color: "#64748B", bg: "bg-slate-50",  border: "border-slate-200", dot: "bg-slate-400",  badge: "bg-slate-100 text-slate-600" },
  { value: "demo",        label: "Demo",        emoji: "🎯", color: "#3B82F6", bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  { value: "proposal",    label: "Proposal",    emoji: "📄", color: "#8B5CF6", bg: "bg-violet-50", border: "border-violet-200",dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  { value: "negotiation", label: "Negotiation", emoji: "🤝", color: "#F59E0B", bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  { value: "won",         label: "Won",         emoji: "🎉", color: "#10B981", bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500",  badge: "bg-green-100 text-green-700" },
  { value: "lost",        label: "Lost",        emoji: "❌", color: "#EF4444", bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-400",    badge: "bg-red-100 text-red-600" },
] as const;

type StageValue = typeof STAGES[number]["value"];

const SERVICES: Record<string, string> = {
  website: "Website", whatsapp: "WhatsApp", lms: "LMS",
  crm: "CRM", "social-media": "Social Media", other: "Other",
};

const PRIORITIES = [
  { value: "high",   label: "High",   color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  { value: "low",    label: "Low",    color: "bg-gray-100 text-gray-600",      dot: "bg-gray-300" },
] as const;

const TILE_GRADIENTS = {
  total:       ["#6D5DF6", "#8B7CF8"] as [string,string],
  won:         ["#1E5FE0", "#2E7BF6"] as [string,string],
  pipeline:    ["#0E8FD9", "#23B6E0"] as [string,string],
  expected:    ["#D97706", "#F59E0B"] as [string,string],
  followup:    ["#E11D48", "#F43F5E"] as [string,string],
  followup_ok: ["#0FA968", "#22C97E"] as [string,string],
};

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

const fmtDate = (v: unknown) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const isOverdue = (d?: string | null) => {
  if (!d) return false;
  const t = new Date(); t.setHours(0,0,0,0);
  return new Date(d) < t;
};

const stageMeta  = (v: string) => STAGES.find(s => s.value === v) ?? STAGES[0];
const priMeta    = (v: string) => PRIORITIES.find(p => p.value === v) ?? PRIORITIES[1];
const getService = (l: Lead)   => SERVICES[(l as any).service ?? ""] ?? (l as any).service ?? "";
const getAmount  = (l: Lead)   => { const v = (l as any).totalAmount ?? (l as any).total_amount ?? l.estimatedValue ?? 0; return typeof v === "number" ? v : Number(v ?? 0); };
const getExpectedAmount = (l: Lead) => { const v = (l as any).expectedAmount ?? (l as any).expected_amount ?? 0; return typeof v === "number" ? v : Number(v ?? 0); };
const getFollowUp  = (l: Lead) => (l as any).follow_up_date as string | null | undefined;
const getUpdatedAt = (l: Lead): number => { const v = (l as any).updatedAt ?? (l as any).updated_at ?? (l as any).createdAt ?? (l as any).created_at; if (!v) return 0; const d = new Date(v); return isNaN(d.getTime()) ? 0 : d.getTime(); };

// ── count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef  = useRef(0);
  useEffect(() => {
    fromRef.current = value; startRef.current = null;
    let raf: number;
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / durationMs, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setValue(fromRef.current + (target - fromRef.current) * e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

// ── GradientTile — mirrors dashboard exactly ──────────────────────────────────
function GradientTile({ label, rawValue, displayValue, gradient, sub, icon: Icon }: {
  label: string; rawValue: number; displayValue?: string;
  gradient: [string,string]; sub?: string; icon: React.ElementType;
}) {
  const animated = useCountUp(rawValue);
  const display  = displayValue ?? Math.round(animated).toLocaleString("en-IN");
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default select-none"
      style={{ background: `linear-gradient(135deg,${gradient[0]},${gradient[1]})` }}>
      <div className="absolute -right-4 -top-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-1 -bottom-6 w-14 h-14 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 truncate">{label}</p>
          <p className="text-2xl font-extrabold mt-1.5 tabular-nums leading-none tracking-tight">{display}</p>
          {sub && (
            <div className="flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="h-3 w-3 text-white/60 shrink-0" />
              <span className="text-[11px] font-semibold text-white/75 truncate">{sub}</span>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Icon className="h-[18px] w-[18px] text-white" />
        </div>
      </div>
    </div>
  );
}

// ── EditableAmount ────────────────────────────────────────────────────────────
function EditableAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
  const [editing, setEditing] = useState(false);
  const amount = getAmount(lead);
  const [val, setVal] = useState(String(amount || ""));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { const n = Number(val); if (!isNaN(n) && n >= 0) onSave(n); setEditing(false); };
  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-emerald-500 text-xs">₹</span>
      <input ref={ref} type="number" value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") setEditing(false); }}
        className="w-24 h-7 text-sm border border-blue-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-blue-400" />
    </div>
  );
  return (
    <button onClick={() => { setVal(String(amount||"")); setEditing(true); }}
      className="flex items-center gap-0.5 text-sm font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group">
      {amount > 0 ? <><IndianRupee className="h-3 w-3 text-emerald-500 group-hover:text-blue-500" />{amount.toLocaleString("en-IN")}</> : <span className="text-gray-300 group-hover:text-blue-400 text-xs font-medium">+ Amount</span>}
    </button>
  );
}

// ── EditableExpectedAmount ────────────────────────────────────────────────────
function EditableExpectedAmount({ lead, onSave }: { lead: Lead; onSave: (val: number) => void }) {
  const [editing, setEditing] = useState(false);
  const amount = getExpectedAmount(lead);
  const [val, setVal] = useState(String(amount || ""));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { const n = Number(val); if (!isNaN(n) && n >= 0) onSave(n); setEditing(false); };
  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-amber-500 text-xs">₹</span>
      <input ref={ref} type="number" value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") setEditing(false); }}
        className="w-24 h-7 text-sm border border-amber-400 rounded-lg px-2 outline-none focus:ring-1 focus:ring-amber-400" />
    </div>
  );
  return (
    <button onClick={() => { setVal(String(amount||"")); setEditing(true); }}
      className="flex items-center gap-0.5 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors group">
      {amount > 0 ? <><IndianRupee className="h-3 w-3 text-amber-400 group-hover:text-amber-600" />{amount.toLocaleString("en-IN")}</> : <span className="text-gray-300 group-hover:text-amber-400 text-xs font-medium">+ Expected</span>}
    </button>
  );
}

// ── EditableFollowUp ──────────────────────────────────────────────────────────
function EditableFollowUp({ lead, onSave }: { lead: Lead; onSave: (date: Date|undefined) => void }) {
  const [open, setOpen] = useState(false);
  const fud = getFollowUp(lead);
  const od  = isOverdue(fud);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
          fud ? od ? "text-red-600 hover:bg-red-50" : "text-amber-600 hover:bg-amber-50" : "text-gray-300 hover:text-blue-500 hover:bg-blue-50")}>
          {fud ? <>{od ? <AlertCircle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>}{fmtDate(fud)}{od && " ⚠️"}</> : <><CalendarIcon className="h-3 w-3"/>+ Set date</>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={fud ? new Date(fud) : undefined} onSelect={d => { onSave(d); setOpen(false); }} initialFocus />
        {fud && <div className="p-2 border-t"><button onClick={() => { onSave(undefined); setOpen(false); }} className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded">Clear date</button></div>}
      </PopoverContent>
    </Popover>
  );
}

// ── EditablePriority ──────────────────────────────────────────────────────────
function EditablePriority({ lead, onSave }: { lead: Lead; onSave: (p: string) => void }) {
  const pm = priMeta(lead.priority as string);
  return (
    <Select value={lead.priority as string} onValueChange={onSave}>
      <SelectTrigger className={cn("h-7 text-xs border-0 rounded-full px-2.5 font-semibold focus:ring-0 w-auto min-w-[80px] cursor-pointer", pm.color)} style={{ boxShadow:"none" }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}><span className="flex items-center gap-2"><span className={cn("w-2 h-2 rounded-full", p.dot)}/>{p.label}</span></SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ── DateRangePicker ───────────────────────────────────────────────────────────
function DateRangePicker({ from, to, onFromChange, onToChange, onClear }: {
  from: Date|undefined; to: Date|undefined;
  onFromChange: (d: Date|undefined) => void;
  onToChange:   (d: Date|undefined) => void;
  onClear: () => void;
}) {
  const hasDate = !!(from || to);
  return (
    <div className={cn("flex items-center gap-1.5 rounded-xl border px-2.5 h-8 bg-white text-xs transition-all shrink-0",
      hasDate ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300")}>
      <CalendarIcon className={cn("h-3.5 w-3.5 shrink-0", hasDate ? "text-blue-500" : "text-gray-400")} />
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn("font-semibold transition-colors whitespace-nowrap", from ? "text-blue-700" : "text-gray-400 hover:text-gray-600")}>{from ? format(from,"d MMM") : "From"}</button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={from} onSelect={onFromChange} disabled={d => to ? d > to : false} initialFocus />
          {from && <div className="p-2 border-t"><button onClick={() => onFromChange(undefined)} className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded">Clear</button></div>}
        </PopoverContent>
      </Popover>
      <span className="text-gray-300 font-normal">→</span>
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn("font-semibold transition-colors whitespace-nowrap", to ? "text-blue-700" : "text-gray-400 hover:text-gray-600")}>{to ? format(to,"d MMM") : "To"}</button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={to} onSelect={onToChange} disabled={d => from ? d < from : false} initialFocus />
          {to && <div className="p-2 border-t"><button onClick={() => onToChange(undefined)} className="w-full text-xs text-red-500 hover:text-red-700 py-1 rounded">Clear</button></div>}
        </PopoverContent>
      </Popover>
      {hasDate && <button onClick={onClear} className="ml-0.5 text-blue-400 hover:text-blue-600"><X className="h-3 w-3"/></button>}
    </div>
  );
}

// ── LeadCard (Kanban) ─────────────────────────────────────────────────────────
function LeadCard({ lead, onView, onEdit, onDelete, onCall, onWhatsApp, onFollowUp, onConvert, dragging, onDragStart, onDragEnd }: {
  lead: Lead; onView:()=>void; onEdit:()=>void; onDelete:()=>void;
  onCall:()=>void; onWhatsApp:()=>void; onFollowUp:()=>void; onConvert:()=>void;
  dragging: boolean; onDragStart:(e:React.DragEvent)=>void; onDragEnd:()=>void;
}) {
  const pm = priMeta(lead.priority as string);
  const amount = getAmount(lead);
  const expectedAmount = getExpectedAmount(lead);
  const fud = getFollowUp(lead);
  const overdue = isOverdue(fud);
  const svc = getService(lead);
  const isWon = lead.status === "won";
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onDoubleClick={onView}
      className={cn("bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
        dragging ? "opacity-40 scale-95 border-blue-400" : "border-gray-100 hover:border-blue-200")}>
      <div className={cn("h-[3px] w-full rounded-t-2xl", pm.value==="high" ? "bg-red-400" : pm.value==="medium" ? "bg-yellow-400" : "bg-gray-200")} />
      <div className="p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background:"linear-gradient(135deg,#2563EB,#3B82F6)" }}>
              <span className="text-sm font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
              {(lead as any).company && <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 rounded-lg shrink-0"><MoreHorizontal className="h-3.5 w-3.5"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-44 text-sm">
              <DropdownMenuItem onClick={onView}><Eye className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onFollowUp}><Bell className="mr-2 h-4 w-4"/>Follow-up</DropdownMenuItem>
              {isWon && !(lead as any).isConverted && <DropdownMenuItem onClick={onConvert}><UserCheck className="mr-2 h-4 w-4"/>Convert</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {svc && <span className="inline-block text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg">{svc}</span>}
        {amount > 0 && <div className="flex items-center gap-1 text-sm font-bold text-gray-800"><IndianRupee className="h-3.5 w-3.5 text-emerald-500"/>{amount.toLocaleString("en-IN")}</div>}
        {expectedAmount > 0 && expectedAmount !== amount && (
          <div className="flex items-center gap-1 text-xs font-medium text-amber-600"><IndianRupee className="h-3 w-3 text-amber-400"/>{expectedAmount.toLocaleString("en-IN")}<span className="text-gray-400 font-normal">expected</span></div>
        )}
        {fud && (
          <div className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-medium", overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700")}>
            {overdue ? <AlertCircle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>}Follow-up: {fmtDate(fud)}{overdue && " · Overdue!"}
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <button onClick={onCall} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Phone className="h-3.5 w-3.5"/></button>
            <button onClick={onWhatsApp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><MessageSquare className="h-3.5 w-3.5"/></button>
            <button onClick={onFollowUp} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Bell className="h-3.5 w-3.5"/></button>
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", pm.color)}>{pm.label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function LeadsContent() {
  const { leads, deleteLead, updateLead } = useCRM();

  const [view,            setView]            = useState<"kanban"|"table">("table");
  const [search,          setSearch]          = useState("");
  const [stageFilter,     setStageFilter]     = useState("all");
  const [serviceFilter,   setServiceFilter]   = useState("all");
  const [priorityFilter,  setPriorityFilter]  = useState("all");
  const [dateFrom,        setDateFrom]        = useState<Date|undefined>(undefined);
  const [dateTo,          setDateTo]          = useState<Date|undefined>(undefined);
  const [recentlyTouched, setRecentlyTouched] = useState<Set<string>>(new Set());

  const [selected,     setSelected]     = useState<Lead|null>(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [convertOpen,  setConvertOpen]  = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [draggingId,   setDraggingId]   = useState<string|null>(null);
  const [dropTarget,   setDropTarget]   = useState<string|null>(null);

  const touchLead = useCallback((id: string) => {
    setRecentlyTouched(prev => new Set([id, ...prev]));
  }, []);

  const inDateRange = useCallback((lead: Lead) => {
    if (!dateFrom && !dateTo) return true;
    const raw = (lead as any).createdAt ?? (lead as any).created_at;
    if (!raw) return false;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return false;
    if (dateFrom && d < startOfDay(dateFrom)) return false;
    if (dateTo   && d > endOfDay(dateTo))     return false;
    return true;
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = leads.filter(l => {
      if (q && !l.name?.toLowerCase().includes(q) && !(l as any).company?.toLowerCase().includes(q)) return false;
      if (stageFilter    !== "all" && l.status !== stageFilter)             return false;
      if (serviceFilter  !== "all" && (l as any).service !== serviceFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter)        return false;
      if (!inDateRange(l))                                                  return false;
      return true;
    });
    return [...base].sort((a,b) => {
      const aT = recentlyTouched.has(a.id) ? 1 : 0;
      const bT = recentlyTouched.has(b.id) ? 1 : 0;
      if (bT !== aT) return bT - aT;
      return getUpdatedAt(b) - getUpdatedAt(a);
    });
  }, [leads, search, stageFilter, serviceFilter, priorityFilter, inDateRange, recentlyTouched]);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map(s => [s.value, [] as Lead[]]));
    filtered.forEach(l => { if (map[l.status as string]) map[l.status as string].push(l); });
    return map as Record<StageValue, Lead[]>;
  }, [filtered]);

  // All stats reflect the current filter set
  const stats = useMemo(() => ({
    total:    filtered.length,
    won:      filtered.filter(l => l.status === "won").length,
    pipeline: filtered.reduce((s,l) => s + getAmount(l), 0),
    expected: filtered.reduce((s,l) => s + getExpectedAmount(l), 0),
    overdueFollowUps: filtered.filter(l => isOverdue(getFollowUp(l)) && !["won","lost"].includes(l.status as string)).length,
  }), [filtered]);

  const open = (l: Lead) => { setSelected(l); setDetailOpen(true); };
  const edit = (l: Lead) => { setSelected(l); setEditOpen(true); };
  const del  = (id: string) => { if (window.confirm("Delete this lead?")) void deleteLead(id); };
  const call = (l: Lead) => { if ((l as any).phone) window.open(`tel:${(l as any).phone}`); };
  const wa   = (l: Lead) => { const n = l.whatsappNumber || (l as any).phone; if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("Hi, following up on your Vasifytech enquiry.")}`, "_blank"); };
  const fu   = (l: Lead) => { setSelected(l); setFollowUpOpen(true); };
  const conv = (l: Lead) => { setSelected(l); setConvertOpen(true); };

  const saveAmount         = useCallback(async (id:string, amount:number)   => { await updateLead(id, { totalAmount: amount, estimatedValue: amount } as any); touchLead(id); }, [updateLead, touchLead]);
  const saveExpectedAmount = useCallback(async (id:string, amount:number)   => { await updateLead(id, { expectedAmount: amount } as any); touchLead(id); }, [updateLead, touchLead]);
  const saveFollowUp       = useCallback(async (id:string, date:Date|undefined) => { await updateLead(id, { followUpDate: date ? date.toISOString().split("T")[0] : null } as any); touchLead(id); }, [updateLead, touchLead]);
  const savePriority       = useCallback(async (id:string, priority:string) => { await updateLead(id, { priority: priority as Lead["priority"] }); touchLead(id); }, [updateLead, touchLead]);
  const changeStage        = useCallback(async (id:string, stage:string)    => { await updateLead(id, { status: stage as Lead["status"], pipelineStage: stage } as any); touchLead(id); }, [updateLead, touchLead]);

  const onDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("leadId");
    setDraggingId(null); setDropTarget(null);
    if (id) await changeStage(id, stage);
  };

  const activeFilters = [stageFilter!=="all", serviceFilter!=="all", priorityFilter!=="all", !!(dateFrom||dateTo)].filter(Boolean).length;
  const clearFilters  = () => { setStageFilter("all"); setServiceFilter("all"); setPriorityFilter("all"); setSearch(""); setDateFrom(undefined); setDateTo(undefined); };

  return (
    <div className="flex flex-col h-full" style={{ background: "#F4F6FB" }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-4 pb-0 sticky top-0 z-20"
        style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.06)" }}>

        {/* Row 1 */}
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-gray-900 leading-tight tracking-tight">Leads Pipeline</h1>
              {activeFilters > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white leading-none">
                  <Filter className="h-2.5 w-2.5"/>{activeFilters}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              {activeFilters > 0
                ? <><span className="text-blue-600 font-bold">{filtered.length}</span> of {leads.length} leads</>
                : <>{leads.length} total leads</>}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-0.5">
              <button onClick={() => setView("kanban")}
                className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all",
                  view==="kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                <Kanban className="h-3.5 w-3.5"/> Board
              </button>
              <button onClick={() => setView("table")}
                className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all",
                  view==="table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                <LayoutList className="h-3.5 w-3.5"/> List
              </button>
            </div>
            <Button onClick={() => setAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5"/> Add Lead
            </Button>
          </div>
        </div>

        {/* Row 2 — filters */}
        <div className="flex items-center gap-2 pb-3 flex-wrap">
          <div className="relative min-w-[140px] max-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
              className="pl-8 h-8 rounded-xl border-gray-200 text-sm bg-white focus-visible:ring-1 focus-visible:ring-blue-400"/>
            {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3 w-3"/></button>}
          </div>

          <DateRangePicker from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo}
            onClear={() => { setDateFrom(undefined); setDateTo(undefined); }}/>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border bg-white shrink-0",
              stageFilter!=="all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
              <SelectValue placeholder="All Stages"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className={cn("h-8 w-28 rounded-xl text-xs border bg-white shrink-0",
              serviceFilter!=="all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
              <SelectValue placeholder="All Services"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {Object.entries(SERVICES).map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className={cn("h-8 w-24 rounded-xl text-xs border bg-white shrink-0",
              priorityFilter!=="all" ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200")}>
              <SelectValue placeholder="Priority"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              <X className="h-3 w-3"/>Clear{activeFilters > 1 ? ` (${activeFilters})` : ""}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 space-y-4">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <GradientTile label="Total Leads"    rawValue={stats.total}    gradient={TILE_GRADIENTS.total}    sub={activeFilters > 0 ? `of ${leads.length} total` : "all leads"} icon={Users}/>
          <GradientTile label="Won Deals"      rawValue={stats.won}      gradient={TILE_GRADIENTS.won}      sub="closed"               icon={CheckCircle2}/>
          <GradientTile label="Pipeline Value" rawValue={stats.pipeline} displayValue={fmt(stats.pipeline)} gradient={TILE_GRADIENTS.pipeline} sub="total amount"    icon={TrendingUp}/>
          <GradientTile label="Expected Value" rawValue={stats.expected} displayValue={fmt(stats.expected)} gradient={TILE_GRADIENTS.expected} sub="what you'll collect" icon={Target}/>
          <GradientTile
            label={stats.overdueFollowUps > 0 ? "Follow-ups Due" : "Follow-ups"}
            rawValue={stats.overdueFollowUps}
            gradient={stats.overdueFollowUps > 0 ? TILE_GRADIENTS.followup : TILE_GRADIENTS.followup_ok}
            sub={stats.overdueFollowUps > 0 ? "needs attention" : "all clear ✓"}
            icon={Bell}
          />
        </div>

        {/* ── Kanban ────────────────────────────────────────────────── */}
        {view === "kanban" && (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {STAGES.map(stage => {
                const colLeads = grouped[stage.value] ?? [];
                const colValue = colLeads.reduce((s,l) => s + getAmount(l), 0);
                const isTarget = dropTarget === stage.value && draggingId !== null;
                return (
                  <div key={stage.value}
                    onDragOver={e => { e.preventDefault(); setDropTarget(stage.value); }}
                    onDrop={e => onDrop(e, stage.value)}
                    onDragLeave={() => setDropTarget(null)}
                    className={cn("w-64 flex flex-col rounded-2xl bg-white overflow-hidden transition-all shrink-0 shadow-sm border border-gray-100",
                      isTarget && "ring-2 ring-blue-400 ring-offset-1 shadow-lg scale-[1.01]")}>
                    {/* Coloured top stripe per column */}
                    <div className="h-[3px] w-full" style={{ background: stage.color }}/>
                    <div className={cn("px-3.5 py-3 flex items-center justify-between", stage.bg)}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{stage.emoji}</span>
                        <span className="font-bold text-sm text-gray-800">{stage.label}</span>
                      </div>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stage.badge)}>{colLeads.length}</span>
                    </div>
                    {colValue > 0 && (
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 border-b border-gray-100 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3"/>{fmt(colValue)} total
                      </div>
                    )}
                    <div className={cn("p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[62vh] transition-colors", isTarget && "bg-blue-50/30")}>
                      {colLeads.length === 0 ? (
                        <div className={cn("flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed text-gray-300 transition-colors",
                          isTarget ? "border-blue-300 bg-blue-50/20 text-blue-400" : "border-gray-100")}>
                          <Users className="h-6 w-6 mb-1 opacity-40"/>
                          <p className="text-xs font-medium">{isTarget ? "Drop here" : "No leads"}</p>
                        </div>
                      ) : colLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead}
                          onView={() => open(lead)}
                          onEdit={() => { touchLead(lead.id); edit(lead); }}
                          onDelete={() => del(lead.id)}
                          onCall={() => call(lead)}
                          onWhatsApp={() => wa(lead)}
                          onFollowUp={() => fu(lead)}
                          onConvert={() => conv(lead)}
                          dragging={draggingId === lead.id}
                          onDragStart={e => { setDraggingId(lead.id); e.dataTransfer.setData("leadId", lead.id); e.dataTransfer.effectAllowed = "move"; }}
                          onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────── */}
        {view === "table" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header — distinct bg + thicker border */}
            <div className="grid gap-0 px-4 py-3 border-b-2 border-gray-200 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest"
              style={{ gridTemplateColumns:"2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px", background:"#F1F4F8" }}>
              <div className="pl-11">Client</div>
              <div>Service</div>
              <div>Stage</div>
              <div>Total Amt</div>
              <div>Expected</div>
              <div>Priority</div>
              <div>Follow-up</div>
              <div/>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Users className="h-10 w-10 mb-3 opacity-30"/>
                <p className="text-sm font-semibold text-gray-400">
                  {search || activeFilters > 0 ? "No leads match your filters." : "No leads yet. Add your first one!"}
                </p>
                {(search || activeFilters > 0)
                  ? <button onClick={clearFilters} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1"><X className="h-3.5 w-3.5"/>Clear filters</button>
                  : <Button onClick={() => setAddOpen(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm"><Plus className="h-3.5 w-3.5"/> Add your first lead</Button>
                }
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((lead, idx) => {
                  const sm       = stageMeta(lead.status as string);
                  const svc      = getService(lead);
                  const isRecent = recentlyTouched.has(lead.id);
                  return (
                    <div key={lead.id} onDoubleClick={() => open(lead)}
                      className={cn("grid gap-0 px-4 py-2.5 items-center transition-all duration-150 group relative hover:bg-blue-50/50",
                        isRecent ? "bg-indigo-50/40" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/30")}
                      style={{ gridTemplateColumns:"2fr 1fr 1.1fr 1fr 1fr 1fr 1fr 90px" }}>

                      {/* Left accent */}
                      <span className={cn("absolute left-0 top-0 h-full w-[4px] rounded-r transition-opacity duration-150",
                        isRecent ? "bg-indigo-400 opacity-70" : "bg-blue-500 opacity-0 group-hover:opacity-100")}/>

                      {/* Client */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ background:"linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                          <span className="text-xs font-bold text-white">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
                          {isRecent && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-white"/>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{lead.name}</p>
                          {(lead as any).company && <p className="text-xs text-gray-400 truncate">{(lead as any).company}</p>}
                          {(lead as any).phone && (
                            <button onClick={e => { e.stopPropagation(); call(lead); }}
                              className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium mt-0.5">
                              <Phone className="h-2.5 w-2.5"/>{(lead as any).phone}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Service */}
                      <div className="pr-2">
                        {svc
                          ? <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg whitespace-nowrap">{svc}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </div>

                      {/* Stage */}
                      <div onClick={e => e.stopPropagation()} className="pr-2">
                        <Select value={lead.status as string} onValueChange={v => changeStage(lead.id, v)}>
                          <SelectTrigger className={cn("h-7 text-xs border rounded-full px-2.5 w-auto min-w-[100px] font-semibold focus:ring-0", sm.badge, "border-transparent")} style={{ boxShadow:"none" }}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 inline-block", sm.dot)}/>
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map(s => <SelectItem key={s.value} value={s.value}><span className="flex items-center gap-2"><span className={cn("w-2 h-2 rounded-full", s.dot)}/>{s.label}</span></SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Total */}
                      <div onClick={e => e.stopPropagation()} className="pr-2">
                        <EditableAmount lead={lead} onSave={val => saveAmount(lead.id, val)}/>
                      </div>

                      {/* Expected */}
                      <div onClick={e => e.stopPropagation()} className="pr-2">
                        <EditableExpectedAmount lead={lead} onSave={val => saveExpectedAmount(lead.id, val)}/>
                      </div>

                      {/* Priority */}
                      <div onClick={e => e.stopPropagation()} className="pr-2">
                        <EditablePriority lead={lead} onSave={p => savePriority(lead.id, p)}/>
                      </div>

                      {/* Follow-up */}
                      <div onClick={e => e.stopPropagation()} className="pr-2">
                        <EditableFollowUp lead={lead} onSave={d => saveFollowUp(lead.id, d)}/>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => call(lead)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Phone className="h-3.5 w-3.5"/></button>
                        <button onClick={() => wa(lead)}   className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><MessageSquare className="h-3.5 w-3.5"/></button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><MoreHorizontal className="h-3.5 w-3.5"/></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-40 text-sm">
                            <DropdownMenuItem onClick={() => open(lead)}><Eye className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { touchLead(lead.id); edit(lead); }}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { touchLead(lead.id); fu(lead); }}><Bell className="mr-2 h-4 w-4"/>Follow-up</DropdownMenuItem>
                            {lead.status === "won" && !(lead as any).isConverted && (
                              <DropdownMenuItem onClick={() => { touchLead(lead.id); conv(lead); }}><UserCheck className="mr-2 h-4 w-4"/>Convert</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => del(lead.id)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
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

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <LeadDialog open={addOpen}  onOpenChange={setAddOpen}  lead={null}     mode="add"/>
      <LeadDialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o && selected) touchLead(selected.id); }} lead={selected} mode="edit"/>
      <LeadDetailDialog open={detailOpen} onOpenChange={setDetailOpen} lead={selected}
        onCallLead={call}
        onEmailLead={l => { if (l.email) window.location.href = `mailto:${l.email}`; }}
        onWhatsAppLead={wa}
        onConvertLead={l => { setDetailOpen(false); touchLead(l.id); conv(l); }}
        onOpenFollowUp={l => { setDetailOpen(false); touchLead(l.id); fu(l); }}
      />
      <ConvertLeadDialog open={convertOpen} onOpenChange={o => { setConvertOpen(o); if (!o && selected) touchLead(selected.id); }} lead={selected} onSuccess={() => setSelected(null)}/>
      <FollowUpDialog    open={followUpOpen} onOpenChange={o => { setFollowUpOpen(o); if (!o && selected) touchLead(selected.id); }} lead={selected}/>
    </div>
  );
}