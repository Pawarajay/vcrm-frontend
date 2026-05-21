// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useCRM } from "@/contexts/crm-context";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import {
//   Phone, Mail, MessageSquare, Clock, UserCheck, Bell,
//   CheckCircle2, Circle, FileText, History, IndianRupee,
//   Briefcase, Globe, AlertCircle, CalendarIcon, X,
//   ChevronRight, Activity, User,
// } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import type { Lead } from "@/types/crm";

// // ─── Constants ────────────────────────────────────────────────────────────────

// // SOW §3: 6 Pipeline stages
// const PIPELINE_STAGES = [
//   { value: "lead",        label: "Lead",        dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600 border-slate-200" },
//   { value: "demo",        label: "Demo",        dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
//   { value: "proposal",    label: "Proposal",    dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
//   { value: "negotiation", label: "Negotiation", dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
//   { value: "won",         label: "Won",         dot: "bg-green-500",   badge: "bg-green-50 text-green-700 border-green-200" },
//   { value: "lost",        label: "Lost",        dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200" },
// ] as const;

// // SOW §5.2: Services
// const VASIFY_SERVICES: Record<string, string> = {
//   website:       "Website Development",
//   whatsapp:      "WhatsApp Automation",
//   lms:           "LMS (Learning Management System)",
//   crm:           "CRM Development",
//   "social-media":"Social Media",
//   other:         "Other",
// };

// // SOW §5.3: Sources
// const SOURCE_LABELS: Record<string, string> = {
//   website: "Website", whatsapp: "WhatsApp", referral: "Referral",
//   manual: "Manual", "social-media": "Social Media", other: "Other",
// };

// const PAYMENT_MODE_LABELS: Record<string, string> = {
//   upi: "UPI", bank: "Bank Transfer", bank_transfer: "Bank Transfer", cash: "Cash",
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmtDate = (v: unknown) => {
//   if (!v) return "—";
//   const d = v instanceof Date ? v : new Date(v as string);
//   if (isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
// };

// const fmtDateTime = (v: unknown) => {
//   if (!v) return "—";
//   const d = v instanceof Date ? v : new Date(v as string);
//   if (isNaN(d.getTime())) return "—";
//   return d.toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
// };

// const fmtCurrency = (v: unknown) => {
//   if (v === null || v === undefined || v === "") return "—";
//   const n = typeof v === "number" ? v : Number(v);
//   if (isNaN(n)) return "—";
//   return `₹${n.toLocaleString("en-IN")}`;
// };

// const isOverdue = (d?: string | null) => {
//   if (!d) return false;
//   const t = new Date(); t.setHours(0, 0, 0, 0);
//   return new Date(d) < t;
// };

// const stageMeta = (v: string) => PIPELINE_STAGES.find((s) => s.value === v) ?? PIPELINE_STAGES[0];

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface LeadDetailDialogProps {
//   open:               boolean;
//   onOpenChange:       (open: boolean) => void;
//   lead:               Lead | null;
//   onCallLead?:        (lead: Lead) => void;
//   onEmailLead?:       (lead: Lead) => void;
//   onWhatsAppLead?:    (lead: Lead) => void;
//   onCreateDeal?:      (lead: Lead) => void;
//   onConvertLead?:     (lead: Lead) => void;
//   onOpenSalesForm?:   (lead: Lead) => void;
//   onOpenFollowUp?:    (lead: Lead) => void;
// }

// // ─── Small reusable pieces ────────────────────────────────────────────────────

// function InfoRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
//   return (
//     <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
//       <span className="text-xs text-gray-400 font-medium shrink-0 pt-0.5">{label}</span>
//       <span className={cn("text-sm text-right font-medium leading-relaxed", muted ? "text-gray-400" : "text-gray-800")}>
//         {value || "—"}
//       </span>
//     </div>
//   );
// }

// function Card({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//       <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
//         <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
//       </div>
//       <div className="px-4 py-3">{children}</div>
//     </div>
//   );
// }

// function Tab({ active, onClick, label, count }: {
//   active: boolean; onClick: () => void; label: string; count?: number;
// }) {
//   return (
//     <button
//       type="button" onClick={onClick}
//       className={cn(
//         "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all",
//         active ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
//       )}
//     >
//       {label}
//       {count !== undefined && count > 0 && (
//         <span className="bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
//           {count}
//         </span>
//       )}
//     </button>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function LeadDetailDialog({
//   open, onOpenChange, lead,
//   onCallLead, onEmailLead, onWhatsAppLead,
//   onCreateDeal, onConvertLead, onOpenSalesForm, onOpenFollowUp,
// }: LeadDetailDialogProps) {
//   const { updateLead, users, currentUser } = useCRM();

//   const [activeTab,     setActiveTab]     = useState<"info" | "deal" | "followups">("info");
//   const [stage,         setStage]         = useState("lead");
//   const [followUpDate,  setFollowUpDate]  = useState<Date | undefined>(undefined);
//   const [followUpNote,  setFollowUpNote]  = useState("");
//   const [savingFU,      setSavingFU]      = useState(false);

//   useEffect(() => {
//     if (lead) {
//       setStage((lead.status as string) ?? "lead");
//       setFollowUpDate((lead as any).follow_up_date ? new Date((lead as any).follow_up_date) : undefined);
//       setFollowUpNote((lead as any).follow_up_notes ?? "");
//       setActiveTab("info");
//     }
//   }, [lead]);

//   if (!lead) return null;

//   const sm           = stageMeta(stage);
//   const serviceLabel = VASIFY_SERVICES[(lead as any).service ?? ""] ?? (lead as any).service ?? "—";
//   const sourceLabel  = SOURCE_LABELS[(lead as any).source ?? ""] ?? (lead as any).source ?? "—";
//   const fud          = (lead as any).follow_up_date as string | null | undefined;
//   const overdueFollowUp = isOverdue(fud);

//   const totalAmount    = Number(lead.estimatedValue ?? (lead as any).totalAmount ?? (lead as any).total_amount ?? 0);
//   const amountReceived = Number((lead as any).amountReceived ?? (lead as any).amount_received ?? 0);
//   const balance        = totalAmount - amountReceived;
//   const paymentStatus  = amountReceived === 0 ? "Pending" : amountReceived >= totalAmount ? "Paid" : "Partial";
//   const paymentHistory: any[] = (lead as any).paymentHistory ?? (lead as any).payment_history ?? [];
//   const followUpHistory: any[] = (lead as any).followUpHistory ?? (lead as any).follow_up_history ?? [];

//   const canConvert = stage === "won" && !lead.isConverted;

//   const getUserName = (id?: string | number) => {
//     if (!id) return "Unassigned";
//     return users.find((u) => String(u.id) === String(id))?.name ?? "Unknown";
//   };

//   const handleStageChange = async (v: string) => {
//     setStage(v);
//     await updateLead(lead.id, { status: v as Lead["status"] });
//   };

//   const handleSaveFollowUp = async () => {
//     if (!followUpDate) return;
//     setSavingFU(true);
//     try {
//       await updateLead(lead.id, {
//         followUpDate:  followUpDate.toISOString().slice(0, 10),
//         followUpNotes: followUpNote || undefined,
//       } as any);
//     } finally { setSavingFU(false); }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-xl p-0 gap-0">

//         {/* ── Header ──────────────────────────────────────────────────── */}
//         <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100">
//           <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
//             <span className="text-base font-bold text-gray-600">{lead.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-3">
//               <div className="min-w-0">
//                 <DialogTitle className="text-base font-semibold text-gray-900 truncate">{lead.name}</DialogTitle>
//                 <DialogDescription className="text-xs text-gray-400 mt-0.5">
//                   {sourceLabel} · {serviceLabel}
//                   {overdueFollowUp && (
//                     <span className="ml-2 text-red-500 font-semibold">· Follow-up overdue</span>
//                   )}
//                 </DialogDescription>
//               </div>
//               <div className="flex items-center gap-2 shrink-0">
//                 {/* Stage selector right in header */}
//                 <Select value={stage} onValueChange={handleStageChange}>
//                   <SelectTrigger className={cn("h-7 text-xs font-semibold border rounded-full px-2.5 w-auto min-w-[110px] focus:ring-0", sm.badge)}>
//                     <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 inline-block", sm.dot)} />
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {PIPELINE_STAGES.map((s) => (
//                       <SelectItem key={s.value} value={s.value}>
//                         <span className="flex items-center gap-2 text-sm">
//                           <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />{s.label}
//                         </span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <button
//                   type="button" onClick={() => onOpenChange(false)}
//                   className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Quick contact actions */}
//             <div className="flex items-center gap-2 mt-3">
//               {(lead as any).phone && (
//                 <button onClick={() => onCallLead?.(lead)}
//                   className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-2.5 py-1.5 rounded-lg transition-all font-medium">
//                   <Phone className="h-3 w-3" />{(lead as any).phone}
//                 </button>
//               )}
//               <button onClick={() => onWhatsAppLead?.(lead)}
//                 className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 px-2.5 py-1.5 rounded-lg transition-all font-medium">
//                 <MessageSquare className="h-3 w-3" />WhatsApp
//               </button>
//               {lead.email && !lead.email.includes("@whatsapp.") && (
//                 <button onClick={() => onEmailLead?.(lead)}
//                   className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 px-2.5 py-1.5 rounded-lg transition-all font-medium">
//                   <Mail className="h-3 w-3" />Email
//                 </button>
//               )}
//               <button onClick={() => { onOpenFollowUp?.(lead); onOpenChange(false); }}
//                 className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 px-2.5 py-1.5 rounded-lg transition-all font-medium">
//                 <Bell className="h-3 w-3" />Follow-up
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── Tab Bar ─────────────────────────────────────────────────── */}
//         <div className="flex border-b border-gray-100 bg-white px-6 overflow-x-auto">
//           <Tab active={activeTab === "info"}      onClick={() => setActiveTab("info")}      label="Overview" />
//           <Tab active={activeTab === "deal"}      onClick={() => setActiveTab("deal")}      label="Deal & Payments" />
//           <Tab active={activeTab === "followups"} onClick={() => setActiveTab("followups")} label="Follow-ups" count={followUpHistory.length} />
//         </div>

//         {/* ── Body ────────────────────────────────────────────────────── */}
//         <div className="p-5 bg-gray-50/30 grid grid-cols-1 lg:grid-cols-3 gap-4">

//           {/* Main content — 2 cols */}
//           <div className="lg:col-span-2 space-y-4">

//             {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
//             {activeTab === "info" && (
//               <>
//                 <Card title="Client Details">
//                   <InfoRow label="Name"       value={lead.name} />
//                   <InfoRow label="Phone"      value={(lead as any).phone} />
//                   <InfoRow label="Email"      value={
//                     lead.email && !lead.email.includes("@whatsapp.") ? lead.email : null
//                   } />
//                   <InfoRow label="WhatsApp"   value={lead.whatsappNumber} />
//                   <InfoRow label="Company"    value={(lead as any).company} />
//                   <InfoRow label="Referred By"value={(lead as any).referred_by} />
//                 </Card>

//                 <Card title="Lead Details">
//                   <InfoRow label="Service"    value={serviceLabel} />
//                   <InfoRow label="Source"     value={sourceLabel} />
//                   <InfoRow label="Priority"   value={
//                     <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
//                       lead.priority === "high"   ? "bg-red-50 text-red-600" :
//                       lead.priority === "medium" ? "bg-amber-50 text-amber-600" :
//                       "bg-gray-100 text-gray-500"
//                     )}>{lead.priority}</span>
//                   } />
//                   <InfoRow label="Created"    value={fmtDate(lead.createdAt)} />
//                   <InfoRow label="Closure Date" value={fmtDate(lead.expectedCloseDate)} muted={!lead.expectedCloseDate} />
//                   <InfoRow label="Follow-up"  value={
//                     fud ? (
//                       <span className={cn("font-medium", overdueFollowUp ? "text-red-600" : "text-amber-600")}>
//                         {fmtDate(fud)}{overdueFollowUp ? " · Overdue" : ""}
//                       </span>
//                     ) : null
//                   } />
//                   {currentUser?.role === "admin" && (
//                     <InfoRow label="Sales Owner" value={getUserName(lead.assignedTo ?? (lead as any).salesOwner)} />
//                   )}
//                 </Card>

//                 {lead.notes && (
//                   <Card title="Notes">
//                     <p className="text-sm text-gray-700 leading-relaxed">{lead.notes}</p>
//                   </Card>
//                 )}
//               </>
//             )}

//             {/* ── DEAL & PAYMENTS TAB ───────────────────────────────── */}
//             {activeTab === "deal" && (
//               <>
//                 {/* Amount summary */}
//                 <div className="grid grid-cols-3 gap-3">
//                   {[
//                     { label: "Total Deal",  value: fmtCurrency(totalAmount),    color: "text-gray-900" },
//                     { label: "Received",    value: fmtCurrency(amountReceived),  color: "text-green-600" },
//                     { label: "Balance Due", value: fmtCurrency(balance),         color: balance > 0 ? "text-red-600" : "text-green-600" },
//                   ].map((item) => (
//                     <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-3.5 text-center">
//                       <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">{item.label}</p>
//                       <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <Card title="Payment Details">
//                   <InfoRow label="Payment Status" value={
//                     <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
//                       paymentStatus === "Paid"    ? "bg-green-50 text-green-600" :
//                       paymentStatus === "Partial" ? "bg-amber-50 text-amber-600" :
//                       "bg-red-50 text-red-600"
//                     )}>{paymentStatus}</span>
//                   } />
//                   <InfoRow label="Expected Amount" value={fmtCurrency((lead as any).expectedAmount ?? (lead as any).expected_amount)} />
//                   <InfoRow label="Closure Date"    value={fmtDate(lead.expectedCloseDate)} />
//                 </Card>

//                 {/* Payment history table */}
//                 <Card title="Payment History">
//                   {paymentHistory.length > 0 ? (
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-gray-100">
//                             <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
//                             <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
//                             <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Mode</th>
//                             <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Note</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paymentHistory.map((p: any, i: number) => (
//                             <tr key={p.id ?? i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
//                               <td className="py-2.5 text-gray-600">{fmtDate(p.date ?? p.payment_date)}</td>
//                               <td className="py-2.5 font-semibold text-green-600 text-right">{fmtCurrency(p.amount)}</td>
//                               <td className="py-2.5 text-center">
//                                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium uppercase">
//                                   {PAYMENT_MODE_LABELS[String(p.mode ?? p.payment_mode).toLowerCase()] ?? p.mode ?? "—"}
//                                 </span>
//                               </td>
//                               <td className="py-2.5 text-gray-400 text-xs">{p.remarks || "—"}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="py-8 text-center">
//                       <IndianRupee className="h-8 w-8 text-gray-200 mx-auto mb-2" />
//                       <p className="text-sm text-gray-400">No payments recorded yet</p>
//                     </div>
//                   )}
//                   <div className="mt-3 pt-3 border-t border-gray-100">
//                     <Button size="sm" variant="outline" onClick={() => onCreateDeal?.(lead)}
//                       className="w-full h-8 text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
//                       <IndianRupee className="mr-1.5 h-3.5 w-3.5" />Record Payment
//                     </Button>
//                   </div>
//                 </Card>
//               </>
//             )}

//             {/* ── FOLLOW-UPS TAB ────────────────────────────────────── */}
//             {activeTab === "followups" && (
//               <>
//                 {/* Schedule follow-up */}
//                 <Card title={overdueFollowUp ? "⚠️ Follow-up Overdue — Reschedule" : "Schedule Follow-up"}>
//                   <div className="space-y-3">
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button variant="outline" type="button" size="sm"
//                           className={cn(
//                             "h-9 justify-start font-normal text-sm rounded-xl border-gray-200 hover:bg-gray-50",
//                             !followUpDate && "text-gray-400"
//                           )}>
//                           <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400" />
//                           {followUpDate ? format(followUpDate, "d MMM yyyy") : "Pick a date"}
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar mode="single" selected={followUpDate} onSelect={setFollowUpDate} initialFocus />
//                       </PopoverContent>
//                     </Popover>
//                     <Input
//                       placeholder="What to discuss, client blockers…"
//                       value={followUpNote}
//                       onChange={(e) => setFollowUpNote(e.target.value)}
//                       className="h-9 text-sm rounded-xl border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500"
//                     />
//                     <Button size="sm" onClick={handleSaveFollowUp}
//                       disabled={!followUpDate || savingFU}
//                       className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
//                       {savingFU ? "Saving…" : "Save Follow-up"}
//                     </Button>
//                   </div>
//                 </Card>

//                 {/* History */}
//                 <Card title="Follow-up History">
//                   {followUpHistory.length > 0 ? (
//                     <div className="space-y-2.5">
//                       {followUpHistory.map((fu: any, i: number) => (
//                         <div key={fu.id ?? i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
//                           <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
//                             fu.completed ? "bg-green-100" : "bg-amber-50")}>
//                             {fu.completed
//                               ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
//                               : <Clock className="h-3.5 w-3.5 text-amber-500" />}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between gap-2">
//                               <p className="text-sm font-medium text-gray-800">{fmtDate(fu.follow_up_date ?? fu.followUpDate)}</p>
//                               <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
//                                 fu.completed ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600")}>
//                                 {fu.completed ? "Done" : "Pending"}
//                               </span>
//                             </div>
//                             {fu.notes && <p className="text-xs text-gray-500 mt-0.5">{fu.notes}</p>}
//                             <p className="text-[10px] text-gray-300 mt-1">{fmtDateTime(fu.created_at ?? fu.createdAt)}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="py-8 text-center">
//                       <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
//                       <p className="text-sm text-gray-400">No follow-up history yet</p>
//                     </div>
//                   )}
//                 </Card>
//               </>
//             )}
//           </div>

//           {/* ── Right sidebar ────────────────────────────────────────── */}
//           <div className="space-y-4">

//             {/* Pipeline progress */}
//             <Card title="Pipeline Stage">
//               <div className="space-y-1">
//                 {PIPELINE_STAGES.map((s, i) => {
//                   const currentIdx = PIPELINE_STAGES.findIndex((x) => x.value === stage);
//                   const isActive   = stage === s.value;
//                   const isPassed   = currentIdx > i && s.value !== "lost";
//                   return (
//                     <div key={s.value} className={cn(
//                       "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all",
//                       isActive ? "bg-blue-50" : ""
//                     )}>
//                       <div className={cn("w-2 h-2 rounded-full shrink-0", s.dot,
//                         isActive ? "ring-4 ring-blue-100" : isPassed ? "opacity-40" : "opacity-20"
//                       )} />
//                       <span className={cn("text-xs font-medium flex-1",
//                         isActive ? "text-blue-700 font-semibold" :
//                         isPassed ? "text-gray-400" : "text-gray-300"
//                       )}>{s.label}</span>
//                       {isActive  && <span className="text-[10px] font-semibold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full">Now</span>}
//                       {isPassed  && <span className="text-[10px] text-gray-300">✓</span>}
//                     </div>
//                   );
//                 })}
//               </div>
//             </Card>

//             {/* Key numbers */}
//             <Card title="Key Numbers">
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
//                   <span className="text-xs text-gray-400">Deal Value</span>
//                   <span className="text-sm font-semibold text-gray-800">{fmtCurrency(totalAmount)}</span>
//                 </div>
//                 <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
//                   <span className="text-xs text-gray-400">Received</span>
//                   <span className="text-sm font-semibold text-green-600">{fmtCurrency(amountReceived)}</span>
//                 </div>
//                 <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
//                   <span className="text-xs text-gray-400">Balance</span>
//                   <span className={cn("text-sm font-semibold", balance > 0 ? "text-red-600" : "text-green-600")}>
//                     {fmtCurrency(balance)}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between py-1.5">
//                   <span className="text-xs text-gray-400">Payment</span>
//                   <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
//                     paymentStatus === "Paid"    ? "bg-green-50 text-green-600" :
//                     paymentStatus === "Partial" ? "bg-amber-50 text-amber-600" :
//                     "bg-red-50 text-red-600"
//                   )}>{paymentStatus}</span>
//                 </div>
//               </div>
//             </Card>

//             {/* Actions */}
//             <Card title="Actions">
//               <div className="space-y-2">
//                 <Button variant="outline" size="sm" onClick={() => onCallLead?.(lead)}
//                   className="w-full h-8 justify-start text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
//                   <Phone className="mr-2 h-3.5 w-3.5 text-blue-500" />Call Client
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={() => onWhatsAppLead?.(lead)}
//                   className="w-full h-8 justify-start text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 font-medium">
//                   <MessageSquare className="mr-2 h-3.5 w-3.5 text-green-500" />WhatsApp
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={() => onEmailLead?.(lead)}
//                   className="w-full h-8 justify-start text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
//                   <Mail className="mr-2 h-3.5 w-3.5 text-gray-400" />Send Email
//                 </Button>

//                 <div className="h-px bg-gray-100 my-1" />

//                 <Button variant="outline" size="sm"
//                   onClick={() => { onOpenFollowUp?.(lead); onOpenChange(false); }}
//                   className="w-full h-8 justify-start text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 font-medium">
//                   <Bell className="mr-2 h-3.5 w-3.5 text-amber-500" />Add Follow-up
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={() => onCreateDeal?.(lead)}
//                   className="w-full h-8 justify-start text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
//                   <IndianRupee className="mr-2 h-3.5 w-3.5 text-emerald-500" />Record Payment
//                 </Button>

//                 <div className="h-px bg-gray-100 my-1" />

//                 {/* SOW §2.4: Convert Won deal → Project/Retainer */}
//                 <Button
//                   size="sm"
//                   disabled={!canConvert}
//                   onClick={() => canConvert && onConvertLead?.(lead)}
//                   className={cn(
//                     "w-full h-9 justify-start text-xs rounded-xl font-semibold",
//                     canConvert
//                       ? "bg-blue-600 hover:bg-blue-700 text-white"
//                       : "bg-gray-100 text-gray-400 cursor-not-allowed"
//                   )}
//                 >
//                   <Briefcase className="mr-2 h-3.5 w-3.5" />Convert to Project
//                 </Button>
//                 {stage !== "won" && !lead.isConverted && (
//                   <p className="text-[11px] text-gray-400 text-center">
//                     Move to <strong>Won</strong> stage to convert
//                   </p>
//                 )}
//                 {lead.isConverted && (
//                   <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
//                     <CheckCircle2 className="h-3 w-3 text-green-500" />Already converted
//                   </p>
//                 )}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }




//testing

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Bell,
  CheckCircle2,
  IndianRupee,
  Briefcase,
  CalendarIcon,
  X,
  Heart,
  Settings,
  FileText,
  History,
  TrendingUp,
  AlertCircle,
  Globe,
  Activity,
  User,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/crm";

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { value: "lead",            label: "Lead",           color: "#64748b" },
  { value: "free-inspection", label: "Free Inspection", color: "#06b6d4" },
  { value: "demo",            label: "Demo",           color: "#3b82f6" },
  { value: "proposal",        label: "Proposal",       color: "#8b5cf6" },
  { value: "negotiation",     label: "Negotiation",    color: "#f59e0b" },
  { value: "won",             label: "Won",            color: "#10b981" },
  { value: "lost",            label: "Lost",           color: "#ef4444" },
] as const;

const VASIFY_SERVICES: Record<string, string> = {
  website:        "Website Development",
  whatsapp:       "WhatsApp Automation",
  lms:            "LMS (Learning Management System)",
  crm:            "CRM Development",
  "social-media": "Social Media",
  other:          "Other",
};

const SOURCE_LABELS: Record<string, string> = {
  website:       "Website",
  whatsapp:      "WhatsApp",
  referral:      "Referral",
  manual:        "Manual",
  "social-media":"Social Media",
  other:         "Other",
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  upi:           "UPI",
  bank:          "Bank Transfer",
  bank_transfer: "Bank Transfer",
  cash:          "Cash",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (v: unknown) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtDateTime = (v: unknown) => {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtCurrency = (v: unknown) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "number" ? v : Number(v);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
};

const isOverdue = (d?: string | null) => {
  if (!d) return false;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return new Date(d) < t;
};

const stageMeta = (v: string) =>
  PIPELINE_STAGES.find((s) => s.value === v) ?? PIPELINE_STAGES[0];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeadDetailDialogProps {
  open:             boolean;
  onOpenChange:     (open: boolean) => void;
  lead:             Lead | null;
  onCallLead?:      (lead: Lead) => void;
  onEmailLead?:     (lead: Lead) => void;
  onWhatsAppLead?:  (lead: Lead) => void;
  onCreateDeal?:    (lead: Lead) => void;
  onConvertLead?:   (lead: Lead) => void;
  onOpenSalesForm?: (lead: Lead) => void;
  onOpenFollowUp?:  (lead: Lead) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Dark header section card — matches screenshot style */
function Section({
  icon,
  title,
  children,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl overflow-hidden border border-gray-100 shadow-sm", className)}>
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#1e293b]">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

/** Labelled field */
function Field({
  label,
  value,
  icon,
  accent,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
        {icon && <span className={cn("opacity-70", accent)}>{icon}</span>}
        {label}
      </span>
      <span className={cn("text-sm font-semibold text-gray-800 leading-snug", accent)}>
        {value ?? <span className="text-gray-300">—</span>}
      </span>
    </div>
  );
}

/** Tab button */
function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all",
        active
          ? "border-teal-500 text-teal-600"
          : "border-transparent text-gray-400 hover:text-gray-600"
      )}
    >
      <span className={active ? "text-teal-500" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}

/** Status indicator pill */
function StatusPill({
  done,
  label,
  sublabel,
}: {
  done: boolean;
  label: string;
  sublabel: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
        done ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          done ? "bg-green-500" : "bg-gray-100 border-2 border-gray-300"
        )}
      >
        {done && <CheckCircle2 className="h-4 w-4 text-white" />}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={cn("text-sm font-bold", done ? "text-green-600" : "text-gray-500")}>
          {sublabel}
        </p>
      </div>
    </div>
  );
}

/** Metric row in right sidebar */
function MetricRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0 text-cyan-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={cn("text-sm font-bold text-gray-800", accent)}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadDetailDialog({
  open,
  onOpenChange,
  lead,
  onCallLead,
  onEmailLead,
  onWhatsAppLead,
  onCreateDeal,
  onConvertLead,
  onOpenSalesForm,
  onOpenFollowUp,
}: LeadDetailDialogProps) {
  const { updateLead, users, currentUser } = useCRM();

  const [activeTab,    setActiveTab]    = useState<"info" | "qualification" | "salesform" | "followups">("info");
  const [stage,        setStage]        = useState("lead");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNote, setFollowUpNote] = useState("");
  const [savingFU,     setSavingFU]     = useState(false);

  useEffect(() => {
    if (lead) {
      setStage((lead.status as string) ?? "lead");
      setFollowUpDate(
        (lead as any).follow_up_date ? new Date((lead as any).follow_up_date) : undefined
      );
      setFollowUpNote((lead as any).follow_up_notes ?? "");
      setActiveTab("info");
    }
  }, [lead]);

  if (!lead) return null;

  const sm           = stageMeta(stage);
  const serviceLabel = VASIFY_SERVICES[(lead as any).service ?? ""] ?? (lead as any).service ?? "—";
  const sourceLabel  = SOURCE_LABELS[(lead as any).source ?? ""] ?? (lead as any).source ?? "—";
  const fud          = (lead as any).follow_up_date as string | null | undefined;
  const overdueFollowUp = isOverdue(fud);

  const totalAmount    = Number(lead.estimatedValue ?? (lead as any).totalAmount ?? (lead as any).total_amount ?? 0);
  const amountReceived = Number((lead as any).amountReceived ?? (lead as any).amount_received ?? 0);
  const balance        = totalAmount - amountReceived;
  const paymentStatus  =
    amountReceived === 0
      ? "Pending"
      : amountReceived >= totalAmount
      ? "Paid"
      : "Partial";

  const paymentHistory: any[]  = (lead as any).paymentHistory  ?? (lead as any).payment_history  ?? [];
  const followUpHistory: any[] = (lead as any).followUpHistory ?? (lead as any).follow_up_history ?? [];

  const qualificationDone = !!(lead as any).qualificationComplete;
  const salesFormDone     = !!(lead as any).salesFormComplete;
  const canConvert        = stage === "won" && !lead.isConverted;

  const getUserName = (id?: string | number) => {
    if (!id) return "Unassigned";
    return users.find((u) => String(u.id) === String(id))?.name ?? "Unknown";
  };

  const handleStageChange = async (v: string) => {
    setStage(v);
    await updateLead(lead.id, { status: v as Lead["status"] });
  };

  const handleSaveFollowUp = async () => {
    if (!followUpDate) return;
    setSavingFU(true);
    try {
      await updateLead(lead.id, {
        followUpDate:  followUpDate.toISOString().slice(0, 10),
        followUpNotes: followUpNote || undefined,
      } as any);
    } finally {
      setSavingFU(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        [&>button]:hidden   → removes Radix's auto-generated close button
        flex flex-col       → lets the header shrink-0 and body scroll independently
      */}
      <DialogContent
        className="
          max-w-4xl w-[calc(100vw-2rem)]
          max-h-[92vh] overflow-hidden
          flex flex-col
          rounded-2xl border-0 shadow-2xl
          p-0 gap-0
          [&>button]:hidden
        "
      >

        {/* ── Teal Gradient Header ─────────────────────────────────────── */}
        <div
          className="relative shrink-0 px-6 pt-6 pb-5"
          style={{
            background: "linear-gradient(135deg, #0f766e 0%, #0891b2 55%, #06b6d4 100%)",
          }}
        >
          {/* Single close button — manually placed, Radix one is hidden */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Avatar + name + tags */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
              <span className="text-2xl font-black text-white">
                {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>

            <div className="flex-1 min-w-0 pr-12">
              <DialogTitle className="text-xl font-black text-white tracking-tight leading-tight">
                {lead.name}
              </DialogTitle>

              {/* Source / service / overdue tags */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 whitespace-nowrap">
                  <Globe className="h-3 w-3" />
                  {sourceLabel}
                </span>
                {serviceLabel !== "—" && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 whitespace-nowrap">
                    <Settings className="h-3 w-3" />
                    {serviceLabel}
                  </span>
                )}
                {overdueFollowUp && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full whitespace-nowrap">
                    <AlertCircle className="h-3 w-3" />
                    Follow-up overdue
                  </span>
                )}
              </div>

              <DialogDescription className="text-xs text-white/60 mt-1.5">
                Patient lead profile · Complete medical enquiry details
              </DialogDescription>
            </div>
          </div>

          {/* Status pills + action buttons */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
            {/* Left: qualification & sales form status */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap",
                qualificationDone
                  ? "bg-white/20 border-white/40 text-white"
                  : "bg-white/10 border-white/20 text-white/70"
              )}>
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center",
                  qualificationDone ? "bg-green-400" : "bg-white/20 border border-white/40"
                )}>
                  {qualificationDone && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                </div>
                Qualification: {qualificationDone ? "Complete" : "Pending"}
              </div>

              <div className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap",
                salesFormDone
                  ? "bg-white/20 border-white/40 text-white"
                  : "bg-white/10 border-white/20 text-white/70"
              )}>
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center",
                  salesFormDone ? "bg-green-400 border-transparent" : "bg-transparent border-white/50"
                )}>
                  {salesFormDone && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                </div>
                Sales Form: {salesFormDone ? "Filled" : "Not Filled"}
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { onOpenSalesForm?.(lead); onOpenChange(false); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-full shadow-sm transition-all whitespace-nowrap"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Open Sales Form
              </button>
              <button
                onClick={() => { onOpenFollowUp?.(lead); onOpenChange(false); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-full shadow-sm transition-all whitespace-nowrap"
              >
                <Bell className="h-3.5 w-3.5" />
                Add Follow-up
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ──────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 bg-white px-4 overflow-x-auto shrink-0">
          <Tab
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
            icon={<User className="h-3.5 w-3.5" />}
            label="Basic Info"
          />
          <Tab
            active={activeTab === "qualification"}
            onClick={() => setActiveTab("qualification")}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Qualification"
          />
          <Tab
            active={activeTab === "salesform"}
            onClick={() => setActiveTab("salesform")}
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Sales Form"
          />
          <Tab
            active={activeTab === "followups"}
            onClick={() => setActiveTab("followups")}
            icon={<History className="h-3.5 w-3.5" />}
            label="Follow-ups"
          />
        </div>

        {/* ── Scrollable Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-4">

            {/* ── LEFT — Main content ─────────────────────────────────── */}
            <div className="space-y-4">

              {/* ══ BASIC INFO ══════════════════════════════════════════ */}
              {activeTab === "info" && (
                <Section icon={<Heart className="h-3.5 w-3.5" />} title="Basic Information">
                  <div className="p-5 space-y-5">
                    {/* Name + Pipeline */}
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Full Name" value={lead.name} />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          Pipeline Status
                        </p>
                        <Select value={stage} onValueChange={handleStageChange}>
                          <SelectTrigger className="h-9 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-0 focus:border-teal-400 bg-white">
                            <span
                              className="w-2 h-2 rounded-full shrink-0 mr-2 inline-block"
                              style={{ background: sm.color }}
                            />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PIPELINE_STAGES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <span className="flex items-center gap-2 text-sm">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: s.color }}
                                  />
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-2 gap-5">
                      <Field
                        label="Phone"
                        value={(lead as any).phone}
                        icon={<Phone className="h-3 w-3" />}
                      />
                      <Field
                        label="Email"
                        value={
                          lead.email && !lead.email.includes("@whatsapp.")
                            ? lead.email
                            : undefined
                        }
                        icon={<Mail className="h-3 w-3" />}
                      />
                    </div>

                    {/* WhatsApp */}
                    <Field
                      label="WhatsApp"
                      value={lead.whatsappNumber ?? (lead as any).phone}
                      icon={<MessageSquare className="h-3 w-3" />}
                      accent="text-teal-600"
                    />

                    <div className="h-px bg-gray-100" />

                    {/* Age / Gender / Referred By */}
                    <div className="grid grid-cols-3 gap-5">
                      <Field label="Age"        value={(lead as any).age} />
                      <Field label="Gender"     value={(lead as any).gender} />
                      <Field label="Referred By" value={(lead as any).referred_by} />
                    </div>

                    {/* Service + Priority */}
                    <div className="grid grid-cols-2 gap-5">
                      <Field
                        label="Service"
                        value={serviceLabel}
                        icon={<Settings className="h-3 w-3" />}
                        accent="text-teal-600"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          Priority
                        </p>
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                          lead.priority === "high"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : lead.priority === "medium"
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        )}>
                          {lead.priority === "high"
                            ? "High Priority"
                            : lead.priority === "medium"
                            ? "Medium Priority"
                            : "Low Priority"}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Notes
                      </p>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 min-h-[60px]">
                        {lead.notes || (
                          <span className="text-gray-400 italic">No notes added</span>
                        )}
                      </div>
                    </div>

                    {/* Company + Sales Owner */}
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Company" value={(lead as any).company} />
                      {currentUser?.role === "admin" && (
                        <Field
                          label="Sales Owner"
                          icon={<User className="h-3 w-3" />}
                          value={getUserName(lead.assignedTo ?? (lead as any).salesOwner)}
                        />
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* ══ QUALIFICATION ══════════════════════════════════════ */}
              {activeTab === "qualification" && (
                <Section icon={<CheckCircle2 className="h-3.5 w-3.5" />} title="Qualification Details">
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <Field
                        label="Qualification Status"
                        value={
                          <span className={cn("font-bold", qualificationDone ? "text-green-600" : "text-gray-400")}>
                            {qualificationDone ? "Complete" : "Pending"}
                          </span>
                        }
                      />
                      <Field label="Qualified By" value={(lead as any).qualifiedBy} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Qualification Notes
                      </p>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 min-h-[80px]">
                        {(lead as any).qualificationNotes || (
                          <span className="text-gray-400 italic">No qualification notes</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Budget"         value={fmtCurrency((lead as any).budget)} />
                      <Field label="Decision Maker" value={(lead as any).decisionMaker} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Timeline"       value={(lead as any).timeline} />
                      <Field label="Pain Point"     value={(lead as any).painPoint} />
                    </div>
                  </div>
                </Section>
              )}

              {/* ══ SALES FORM ═════════════════════════════════════════ */}
              {activeTab === "salesform" && (
                <Section icon={<FileText className="h-3.5 w-3.5" />} title="Sales Form">
                  <div className="p-5 space-y-5">
                    {/* Amount summary */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Total Deal",  val: fmtCurrency(totalAmount),   cls: "text-gray-900" },
                        { label: "Received",    val: fmtCurrency(amountReceived), cls: "text-green-600" },
                        { label: "Balance Due", val: fmtCurrency(balance),        cls: balance > 0 ? "text-red-500" : "text-green-600" },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-xl border border-gray-100 p-3.5 text-center">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">{item.label}</p>
                          <p className={cn("text-base font-black", item.cls)}>{item.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <Field
                        label="Form Status"
                        value={
                          <span className={cn("font-bold", salesFormDone ? "text-green-600" : "text-red-500")}>
                            {salesFormDone ? "Filled" : "Not Filled"}
                          </span>
                        }
                      />
                      <Field label="Closure Date" value={fmtDate(lead.expectedCloseDate) ?? "Not set"} />
                    </div>

                    {/* Payment history */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                        Payment History
                      </p>
                      {paymentHistory.length > 0 ? (
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                {["Date", "Amount", "Mode", "Note"].map((h) => (
                                  <th key={h} className={cn(
                                    "py-2.5 px-3 text-[10px] font-black text-gray-400 uppercase tracking-wider",
                                    h === "Amount" ? "text-right" : h === "Mode" ? "text-center" : "text-left"
                                  )}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {paymentHistory.map((p: any, i: number) => (
                                <tr key={p.id ?? i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <td className="px-3 py-2.5 text-xs text-gray-600">{fmtDate(p.date ?? p.payment_date) ?? "—"}</td>
                                  <td className="px-3 py-2.5 text-xs font-bold text-green-600 text-right">{fmtCurrency(p.amount)}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase border border-teal-100">
                                      {PAYMENT_MODE_LABELS[String(p.mode ?? p.payment_mode).toLowerCase()] ?? p.mode ?? "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-gray-400">{p.remarks || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-8 text-center rounded-xl border border-dashed border-gray-200">
                          <IndianRupee className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No payments recorded yet</p>
                        </div>
                      )}
                      <button
                        onClick={() => onCreateDeal?.(lead)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-all"
                      >
                        <IndianRupee className="h-3.5 w-3.5" />
                        Record Payment
                      </button>
                    </div>
                  </div>
                </Section>
              )}

              {/* ══ FOLLOW-UPS ═════════════════════════════════════════ */}
              {activeTab === "followups" && (
                <Section icon={<History className="h-3.5 w-3.5" />} title="Follow-ups">
                  <div className="p-5 space-y-4">
                    {/* Schedule */}
                    <div className={cn(
                      "p-4 rounded-xl border",
                      overdueFollowUp ? "bg-red-50 border-red-200" : "bg-teal-50/50 border-teal-100"
                    )}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        {overdueFollowUp ? "⚠️ Overdue — Reschedule" : "Schedule Follow-up"}
                      </p>
                      <div className="space-y-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "h-9 flex items-center gap-2 px-3 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium",
                                !followUpDate && "text-gray-400"
                              )}
                            >
                              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                              {followUpDate ? format(followUpDate, "d MMM yyyy") : "Pick a date"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={followUpDate}
                              onSelect={setFollowUpDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          placeholder="What to discuss, client blockers…"
                          value={followUpNote}
                          onChange={(e) => setFollowUpNote(e.target.value)}
                          className="h-9 text-sm rounded-xl border-gray-200 bg-white focus-visible:ring-0 focus-visible:border-teal-400"
                        />
                        <button
                          onClick={handleSaveFollowUp}
                          disabled={!followUpDate || savingFU}
                          className="h-9 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold transition-colors"
                        >
                          {savingFU ? "Saving…" : "Save Follow-up"}
                        </button>
                      </div>
                    </div>

                    {/* History */}
                    {followUpHistory.length > 0 ? (
                      <div className="space-y-2.5">
                        {followUpHistory.map((fu: any, i: number) => (
                          <div
                            key={fu.id ?? i}
                            className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                              fu.completed ? "bg-green-100" : "bg-amber-50"
                            )}>
                              {fu.completed
                                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                : <Clock className="h-4 w-4 text-amber-500" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-gray-800">
                                  {fmtDate(fu.follow_up_date ?? fu.followUpDate) ?? "—"}
                                </p>
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                  fu.completed
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                                )}>
                                  {fu.completed ? "Done" : "Pending"}
                                </span>
                              </div>
                              {fu.notes && (
                                <p className="text-xs text-gray-500 mt-0.5">{fu.notes}</p>
                              )}
                              <p className="text-[10px] text-gray-300 mt-1">
                                {fmtDateTime(fu.created_at ?? fu.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center rounded-xl border border-dashed border-gray-200">
                        <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No follow-up history yet</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* ── RIGHT — Sidebar ──────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Status Indicators */}
              <Section icon={<Activity className="h-3.5 w-3.5" />} title="Status Indicators">
                <div className="p-4 space-y-2.5">
                  <StatusPill
                    done={qualificationDone}
                    label="Qualification Status"
                    sublabel={qualificationDone ? "Complete" : "Pending"}
                  />
                  <StatusPill
                    done={salesFormDone}
                    label="Form Completion"
                    sublabel={salesFormDone ? "Filled" : "Not Filled"}
                  />
                </div>
              </Section>

              {/* Key Metrics — blue gradient header */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)" }}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                    Key Metrics
                  </h3>
                </div>

                <div className="bg-white px-4 py-4">
                  {/* Highlighted estimated value */}
                  <div className="flex items-center gap-3 py-3 px-3 bg-green-50 rounded-xl border border-green-100 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Estimated Value
                      </p>
                      <p className="text-xl font-black text-gray-900">{fmtCurrency(totalAmount)}</p>
                    </div>
                  </div>

                  <MetricRow
                    icon={<CalendarIcon className="h-3.5 w-3.5" />}
                    label="Lead Created"
                    value={fmtDate(lead.createdAt) ?? "—"}
                  />
                  <MetricRow
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Appointment"
                    value={(lead as any).appointmentDate ? fmtDate((lead as any).appointmentDate)! : "Not scheduled"}
                    accent={(lead as any).appointmentDate ? undefined : "text-gray-400"}
                  />
                  {fud && (
                    <MetricRow
                      icon={<Bell className="h-3.5 w-3.5" />}
                      label="Follow-up Date"
                      value={fmtDate(fud) ?? "—"}
                      accent={overdueFollowUp ? "text-red-500" : "text-amber-500"}
                    />
                  )}
                  <MetricRow
                    icon={<IndianRupee className="h-3.5 w-3.5" />}
                    label="Payment Status"
                    value={
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full border",
                        paymentStatus === "Paid"    ? "bg-green-50 text-green-600 border-green-200"  :
                        paymentStatus === "Partial" ? "bg-amber-50 text-amber-600 border-amber-200"  :
                                                     "bg-red-50 text-red-500 border-red-200"
                      )}>
                        {paymentStatus}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <Section icon={<Activity className="h-3.5 w-3.5" />} title="Quick Actions">
                <div className="p-4 space-y-2">
                  {[
                    { label: "Call Client",   icon: <Phone className="h-4 w-4 text-blue-400" />,   hov: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",   fn: () => onCallLead?.(lead) },
                    { label: "WhatsApp",      icon: <MessageSquare className="h-4 w-4 text-green-400" />, hov: "hover:bg-green-50 hover:border-green-200 hover:text-green-700", fn: () => onWhatsAppLead?.(lead) },
                    { label: "Send Email",    icon: <Mail className="h-4 w-4 text-purple-400" />,  hov: "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700", fn: () => onEmailLead?.(lead) },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={a.fn}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 transition-all text-left",
                        a.hov
                      )}
                    >
                      <span className="shrink-0">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}

                  <div className="h-px bg-gray-100" />

                  {/* Convert button */}
                  <button
                    disabled={!canConvert}
                    onClick={() => canConvert && onConvertLead?.(lead)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all text-left",
                      canConvert
                        ? "bg-teal-600 border-teal-600 text-white hover:bg-teal-700"
                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Briefcase className="h-4 w-4 shrink-0" />
                    Convert to Project
                  </button>

                  {stage !== "won" && !lead.isConverted && (
                    <p className="text-[11px] text-gray-400 text-center pt-1">
                      Move to <strong>Won</strong> stage to convert
                    </p>
                  )}
                  {lead.isConverted && (
                    <p className="text-[11px] text-green-500 text-center flex items-center justify-center gap-1 pt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Already converted
                    </p>
                  )}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}