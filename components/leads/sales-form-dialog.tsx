

// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useCRM } from "@/contexts/crm-context";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
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
// import {
//   ClipboardList, CheckCircle2, AlertCircle, Save, Cloud, CloudOff, FileEdit,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { Lead } from "@/types/crm";

// // ─── Questions — identical to original, not changed ──────────────────────────

// const SALES_FORM_QUESTIONS = [
//   {
//     id: "call_outcome",
//     label: "1. How did the call go?",
//     type: "radio" as const,
//     options: ["Interested — Wants more info", "Needs time to decide", "Not interested", "Call not answered", "Wrong number"],
//   },
//   {
//     id: "patient_condition",
//     label: "2. What is the patient's current condition?",
//     type: "dropdown" as const,
//     options: ["Acute kidney injury", "Chronic kidney disease (CKD)", "End-stage renal disease (ESRD)", "Post-transplant care", "Other"],
//   },
//   {
//     id: "dialysis_frequency",
//     label: "3. How many times per week does the patient need dialysis?",
//     type: "radio" as const,
//     options: ["1 time/week", "2 times/week", "3 times/week", "Daily", "Not sure yet"],
//   },
//   {
//     id: "current_provider",
//     label: "4. Is the patient currently getting dialysis elsewhere?",
//     type: "radio" as const,
//     options: ["Yes — in hospital", "Yes — at another home care provider", "No — new to dialysis", "Not sure"],
//   },
//   {
//     id: "urgency",
//     label: "5. How urgent is the need for home dialysis?",
//     type: "radio" as const,
//     options: ["Immediate (within 1 week)", "Within 2–4 weeks", "Within 1–2 months", "Planning ahead (3+ months)"],
//   },
//   {
//     id: "location_city",
//     label: "6. Patient's city / area",
//     type: "dropdown" as const,
//     options: ["Mumbai", "Navi Mumbai", "Thane", "Pune", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Ahmedabad", "Other"],
//   },
//   {
//     id: "caregiver_available",
//     label: "7. Is a trained caregiver / family member available at home?",
//     type: "radio" as const,
//     options: ["Yes — family member", "Yes — hired nurse/caregiver", "No — will need Renalease nurse", "Not sure"],
//   },
//   {
//     id: "insurance_coverage",
//     label: "8. Does the patient have insurance / government scheme coverage?",
//     type: "radio" as const,
//     options: ["Yes — private insurance", "Yes — government scheme (CGHS / PMJAY)", "No insurance", "Not sure"],
//   },
//   {
//     id: "concerns",
//     label: "9. What are the patient's main concerns? (Select all that apply)",
//     type: "checkbox" as const,
//     options: ["Cost / affordability", "Quality of care at home", "Equipment reliability", "Training for caregiver", "Doctor oversight", "Transportation to clinic"],
//   },
//   {
//     id: "nephrologist_referred",
//     label: "10. Has a nephrologist recommended home dialysis?",
//     type: "radio" as const,
//     options: ["Yes — nephrologist recommended", "Patient self-researched", "Family/friend referred", "Doctor referral (other specialty)"],
//   },
//   {
//     id: "budget_range",
//     label: "11. What is the patient's monthly budget expectation?",
//     type: "dropdown" as const,
//     options: ["Below ₹30,000", "₹30,000–₹50,000", "₹50,000–₹80,000", "Above ₹80,000", "Not discussed"],
//   },
//   {
//     id: "additional_notes",
//     label: "12. Additional notes from the call",
//     type: "textarea" as const,
//     options: [],
//   },
// ] as const;

// type QuestionId = typeof SALES_FORM_QUESTIONS[number]["id"];
// type FormAnswers = Partial<Record<QuestionId, string | string[]>>;

// // ─── Status helpers — unchanged ───────────────────────────────────────────────

// const getFormStatus = (answers: FormAnswers): "not-filled" | "partial" | "completed" => {
//   const filled = Object.values(answers).filter(
//     (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
//   ).length;
//   if (filled === 0) return "not-filled";
//   if (filled >= SALES_FORM_QUESTIONS.length) return "completed";
//   return "partial";
// };

// const statusMeta = {
//   "not-filled": { label: "Not Filled",       color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
//   "partial":    { label: "Partially Filled", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
//   "completed":  { label: "Completed",        color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
// };

// const AUTO_SAVE_DELAY_MS = 2500;

// interface SalesFormDialogProps {
//   open:          boolean;
//   onOpenChange:  (open: boolean) => void;
//   lead:          Lead | null;
//   onSuccess?:    () => void;
//   dialogTitle?:  string;  // accepted from parent, not used (title is always "Lead Form")
//   allowDraft?:   boolean; // accepted from parent, draft is always enabled
// }

// export function SalesFormDialog({ open, onOpenChange, lead, onSuccess }: SalesFormDialogProps) {
//   const { updateLead } = useCRM();

//   const [answers,        setAnswers]        = useState<FormAnswers>({});
//   const [submitting,     setSubmitting]     = useState(false);
//   const [savingDraft,    setSavingDraft]    = useState(false);
//   const [manualSaved,    setManualSaved]    = useState(false);
//   const [draftSaved,     setDraftSaved]     = useState(false);
//   const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
//   const [error,          setError]          = useState<string | null>(null);

//   const isDirtyRef       = useRef(false);
//   const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const lastSavedRef     = useRef<string>("{}");

//   // ── Load existing draft on open ───────────────────────────────────────────
//   // Reads from lead_form_draft (new column) with fallback to sales_form_data
//   // so any data already stored in the old column is not lost.
//   useEffect(() => {
//     if (!open || !lead) return;

//     const existing =
//       (lead as any).lead_form_draft  ??   // new DB column (priority)
//       (lead as any).leadFormDraft    ??   // camelCase API variant
//       (lead as any).sales_form_data  ??   // legacy column fallback
//       null;

//     let loaded: FormAnswers = {};
//     if (existing) {
//       try {
//         loaded = typeof existing === "string" ? JSON.parse(existing) : existing;
//       } catch {
//         loaded = {};
//       }
//     }

//     setAnswers(loaded);
//     lastSavedRef.current = JSON.stringify(loaded);
//     isDirtyRef.current   = false;
//     setManualSaved(false);
//     setDraftSaved(false);
//     setAutoSaveStatus("idle");
//     setError(null);

//     return () => {
//       if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//     };
//   }, [open, lead]);

//   const leadId = lead?.id ?? "";

//   // ── Auto-save → lead_form_draft ───────────────────────────────────────────
//   // Fires 2.5s after the last answer change.
//   // Sets lead_form_is_draft = 1 so the "Draft" badge shows in the table.
//   const triggerAutoSave = useCallback(
//     async (answersSnapshot: FormAnswers) => {
//       if (!leadId) return;
//       const serialised = JSON.stringify(answersSnapshot);
//       if (serialised === lastSavedRef.current) return;

//       const filled = Object.values(answersSnapshot).filter(
//         (v) => v !== undefined && v !== "" && !(Array.isArray(v) && (v as string[]).length === 0)
//       ).length;
//       if (filled === 0) return;

//       setAutoSaveStatus("saving");
//       try {
//         const ok = await updateLead(leadId, {
//           lead_form_draft:    serialised,
//           lead_form_is_draft: 1,
//           lead_form_saved_at: new Date().toISOString(),
//         } as any);
//         if (ok) {
//           lastSavedRef.current = serialised;
//           isDirtyRef.current   = false;
//           setAutoSaveStatus("saved");
//           onSuccess?.();
//           setTimeout(() => setAutoSaveStatus((s) => (s === "saved" ? "idle" : s)), 3000);
//         } else {
//           setAutoSaveStatus("error");
//         }
//       } catch {
//         setAutoSaveStatus("error");
//       }
//     },
//     [leadId, updateLead, onSuccess]
//   );

//   // All hooks must be above this guard
//   if (!lead) return null;

//   const formStatus  = getFormStatus(answers);
//   const meta        = statusMeta[formStatus];
//   const hasSavedDraft = !!(
//     (lead as any).lead_form_is_draft ||
//     (lead as any).leadFormIsDraft
//   );

//   const setAnswer = (id: QuestionId, value: string | string[]) => {
//     setManualSaved(false);
//     setDraftSaved(false);
//     setAnswers((prev) => {
//       const next = { ...prev, [id]: value };
//       if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//       isDirtyRef.current = true;
//       autoSaveTimerRef.current = setTimeout(() => {
//         void triggerAutoSave(next);
//       }, AUTO_SAVE_DELAY_MS);
//       return next;
//     });
//   };

//   const toggleCheckbox = (id: QuestionId, option: string) => {
//     const current = (answers[id] as string[]) ?? [];
//     const next = current.includes(option)
//       ? current.filter((v) => v !== option)
//       : [...current, option];
//     setAnswer(id, next);
//   };

//   // ── Save as Draft — saves without closing the dialog ─────────────────────
//   // Admin can close and reopen later; answers will be restored from the draft.
//   const handleSaveAsDraft = async () => {
//     setSavingDraft(true);
//     setError(null);
//     if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//     try {
//       const serialised = JSON.stringify(answers);
//       const ok = await updateLead(lead.id, {
//         lead_form_draft:    serialised,
//         lead_form_is_draft: 1,
//         lead_form_saved_at: new Date().toISOString(),
//       } as any);
//       if (ok) {
//         lastSavedRef.current = serialised;
//         isDirtyRef.current   = false;
//         setDraftSaved(true);
//         setAutoSaveStatus("idle");
//         onSuccess?.();
//         setTimeout(() => setDraftSaved(false), 4000);
//       } else {
//         setError("Failed to save draft. Please try again.");
//       }
//     } catch {
//       setError("An error occurred while saving draft.");
//     } finally {
//       setSavingDraft(false);
//     }
//   };

//   // ── Save Form (final) — clears draft flag ─────────────────────────────────
//   // lead_form_is_draft = 0 removes the amber "Draft" badge from the table row.
//   const handleSave = async () => {
//     setSubmitting(true);
//     setError(null);
//     if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//     try {
//       const serialised = JSON.stringify(answers);
//       const ok = await updateLead(lead.id, {
//         lead_form_draft:    serialised,
//         lead_form_is_draft: 0,
//         lead_form_saved_at: new Date().toISOString(),
//       } as any);
//       if (ok) {
//         lastSavedRef.current = serialised;
//         isDirtyRef.current   = false;
//         setManualSaved(true);
//         setAutoSaveStatus("idle");
//         onSuccess?.();
//       } else {
//         setError("Failed to save. Please try again.");
//       }
//     } catch {
//       setError("An error occurred while saving.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const filled = Object.values(answers).filter(
//     (v) => v !== undefined && v !== "" && !(Array.isArray(v) && (v as string[]).length === 0)
//   ).length;
//   const total = SALES_FORM_QUESTIONS.length;
//   const pct   = Math.round((filled / total) * 100);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">

//         {/* ── Header ─────────────────────────────────────────────────────── */}
//         <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5 rounded-t-2xl sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
//               <ClipboardList className="h-6 w-6 text-white" />
//             </div>
//             <div className="flex-1 min-w-0">
//               {/* CHANGE 1: Renamed from "Sales Call Form" → "Lead Form" */}
//               <DialogTitle className="text-white font-black text-lg">Lead Form</DialogTitle>
//               <DialogDescription className="text-blue-100 text-xs mt-0.5 truncate">
//                 {lead.name} · {(lead as any).phone}
//               </DialogDescription>
//             </div>
//             <div className="flex flex-col items-end gap-1.5">
//               <Badge className={`${meta.color} text-xs font-bold border-0`}>
//                 <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} mr-1.5`} />{meta.label}
//               </Badge>
//               {/* CHANGE 2: Show "Draft saved" badge when a draft exists */}
//               {hasSavedDraft && formStatus !== "completed" && (
//                 <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-0 px-2 py-0.5">
//                   <FileEdit className="h-2.5 w-2.5 mr-1" />Draft saved
//                 </Badge>
//               )}
//               <div className="text-white/70 text-[10px] font-semibold">{filled}/{total} answered</div>
//             </div>
//           </div>

//           {/* Progress bar */}
//           <div className="mt-3">
//             <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-white rounded-full transition-all duration-500"
//                 style={{ width: `${pct}%` }}
//               />
//             </div>
//           </div>

//           {/* Auto-save status */}
//           <div className="mt-2 flex items-center gap-1.5 h-4">
//             {autoSaveStatus === "saving" && (
//               <span className="flex items-center gap-1 text-[10px] text-blue-200 font-semibold">
//                 <span className="h-3 w-3 border border-blue-200 border-t-transparent rounded-full animate-spin" />
//                 Auto-saving...
//               </span>
//             )}
//             {autoSaveStatus === "saved" && (
//               <span className="flex items-center gap-1 text-[10px] text-green-200 font-semibold">
//                 <Cloud className="h-3 w-3" />Auto-saved
//               </span>
//             )}
//             {autoSaveStatus === "error" && (
//               <span className="flex items-center gap-1 text-[10px] text-red-200 font-semibold">
//                 <CloudOff className="h-3 w-3" />Auto-save failed — save manually
//               </span>
//             )}
//           </div>
//         </div>

//         {/* CHANGE 3: Draft restore notice banner */}
//         {hasSavedDraft && (
//           <div className="mx-6 mt-5 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
//             <FileEdit className="h-4 w-4 shrink-0" />
//             <span>Draft restored — your previous answers are loaded. Continue filling or click <strong>Save Form</strong> when done.</span>
//           </div>
//         )}

//         {/* ── Form body — identical to original ───────────────────────────── */}
//         <div className="p-6 space-y-6 bg-slate-50">
//           {SALES_FORM_QUESTIONS.map((q) => (
//             <div key={q.id} className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
//               <Label className="text-sm font-bold text-slate-800 mb-3 block leading-relaxed">
//                 {q.label}
//               </Label>

//               {q.type === "radio" && (
//                 <div className="grid grid-cols-1 gap-2 mt-2">
//                   {q.options.map((opt) => {
//                     const selected = answers[q.id as QuestionId] === opt;
//                     return (
//                       <button
//                         key={opt}
//                         type="button"
//                         onClick={() => setAnswer(q.id as QuestionId, opt)}
//                         className={cn(
//                           "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150",
//                           selected
//                             ? "border-blue-500 bg-blue-50 text-blue-800"
//                             : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
//                         )}
//                       >
//                         <span className={cn(
//                           "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
//                           selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
//                         )}>
//                           {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
//                         </span>
//                         {opt}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}

//               {q.type === "dropdown" && (
//                 <Select
//                   value={(answers[q.id as QuestionId] as string) ?? ""}
//                   onValueChange={(v) => setAnswer(q.id as QuestionId, v)}
//                 >
//                   <SelectTrigger className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 h-11 mt-2">
//                     <SelectValue placeholder="Select an option..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {q.options.map((opt) => (
//                       <SelectItem key={opt} value={opt}>{opt}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}

//               {q.type === "checkbox" && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
//                   {q.options.map((opt) => {
//                     const checked = ((answers[q.id as QuestionId] as string[]) ?? []).includes(opt);
//                     return (
//                       <button
//                         key={opt}
//                         type="button"
//                         onClick={() => toggleCheckbox(q.id as QuestionId, opt)}
//                         className={cn(
//                           "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150",
//                           checked
//                             ? "border-blue-500 bg-blue-50 text-blue-800"
//                             : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
//                         )}
//                       >
//                         <span className={cn(
//                           "w-4 h-4 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
//                           checked ? "border-blue-500 bg-blue-500" : "border-slate-300"
//                         )}>
//                           {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
//                         </span>
//                         {opt}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}

//               {q.type === "textarea" && (
//                 <Textarea
//                   className="mt-2 rounded-xl border-2 border-slate-200 focus:border-blue-400 resize-none"
//                   rows={3}
//                   placeholder="Add notes from the call..."
//                   value={(answers[q.id as QuestionId] as string) ?? ""}
//                   onChange={(e) => setAnswer(q.id as QuestionId, e.target.value)}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* ── Footer ─────────────────────────────────────────────────────── */}
//         <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">

//           {/* Status messages */}
//           <div className="flex items-center gap-2 mb-3 min-h-[28px]">
//             {manualSaved && (
//               <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
//                 <CheckCircle2 className="h-3.5 w-3.5" />Form saved successfully
//               </div>
//             )}
//             {draftSaved && (
//               <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
//                 <FileEdit className="h-3.5 w-3.5" />Draft saved — you can continue later
//               </div>
//             )}
//             {error && (
//               <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
//                 <AlertCircle className="h-3.5 w-3.5" />{error}
//               </div>
//             )}
//             {!manualSaved && !draftSaved && !error && filled > 0 && autoSaveStatus === "idle" && (
//               <p className="text-[10px] text-slate-400 font-medium">Auto-saves as you answer</p>
//             )}
//           </div>

//           {/* Buttons */}
//           <div className="flex items-center justify-between gap-3">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={submitting || savingDraft}
//               className="rounded-xl border-2 border-slate-200 font-bold px-5"
//             >
//               Close
//             </Button>

//             <div className="flex items-center gap-2">
//               {/* CHANGE 4: Save as Draft button — stays open, stores draft */}
//               <Button
//                 variant="outline"
//                 onClick={() => void handleSaveAsDraft()}
//                 disabled={submitting || savingDraft || filled === 0}
//                 className="rounded-xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-bold px-5"
//               >
//                 {savingDraft ? (
//                   <span className="flex items-center gap-2">
//                     <span className="h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
//                     Saving draft...
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-2">
//                     <FileEdit className="h-4 w-4" />Save as Draft
//                   </span>
//                 )}
//               </Button>

//               {/* Save Form — final, clears draft flag */}
//               <Button
//                 onClick={() => void handleSave()}
//                 disabled={submitting || savingDraft || filled === 0}
//                 className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold px-6 shadow-lg shadow-blue-200"
//               >
//                 {submitting ? (
//                   <span className="flex items-center gap-2">
//                     <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Saving...
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-2">
//                     <Save className="h-4 w-4" />Save Form
//                   </span>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>

//       </DialogContent>
//     </Dialog>
//   );
// }

//testing (5-5-2026)




"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList, CheckCircle2, AlertCircle, Save, Cloud, CloudOff, FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/crm";

// ─── Questions ────────────────────────────────────────────────────────────────

const SALES_FORM_QUESTIONS = [
  {
    id: "patient_name",
    label: "1️⃣  Name of patient",
    type: "text" as const,
    options: [],
    placeholder: "Enter patient's full name",
  },
  {
    id: "patient_age",
    label: "2️⃣  Age",
    type: "text" as const,
    options: [],
    placeholder: "e.g. 52",
  },
  {
    id: "nephrologist_name",
    label: "3️⃣  Name of Nephrologist",
    type: "text" as const,
    options: [],
    placeholder: "e.g. Dr. Mehta",
  },
  {
    id: "referral_source",
    label: "4️⃣  How did you come to know about us?",
    type: "radio" as const,
    options: ["Doctor", "Google", "Friend", "Patient Referral"],
  },
  {
    id: "current_dialysis_location",
    label: "5️⃣  Where is the patient taking dialysis currently?",
    type: "radio" as const,
    options: ["Home", "Centre"],
    hasOther: true,
    otherPlaceholder: "Centre name (if Centre selected)",
  },
  {
    id: "dialysis_duration",
    label: "6️⃣  Since how long on dialysis?",
    type: "text" as const,
    options: [],
    placeholder: "e.g. 6 months, 2 years",
  },
  {
    id: "access_type",
    label: "7️⃣  Access type",
    type: "radio" as const,
    options: ["AVF", "Cannula", "Permcath"],
  },
  {
    id: "patient_location_now",
    label: "8️⃣  Is the patient admitted or at home right now?",
    type: "radio" as const,
    options: ["Admitted", "At home"],
  },
  {
    id: "start_timeline",
    label: "9️⃣  When do they want to start Home Dialysis?",
    type: "radio" as const,
    options: ["This week", "Later"],
  },
  {
    id: "health_issues",
    label: "🔟  Any major health issues?",
    type: "checkbox" as const,
    options: ["Recent surgery", "Amputation", "Heart problem", "Breathing issue", "Infection"],
    hasOther: true,
    otherPlaceholder: "Other health issue",
  },
  {
    id: "dialysis_per_week",
    label: "1️⃣1️⃣  No. of dialysis per week",
    type: "radio" as const,
    options: ["1", "2", "3", "4"],
  },
  {
    id: "relative_name",
    label: "1️⃣2️⃣  Name of relative spoken to",
    type: "text" as const,
    options: [],
    placeholder: "e.g. Rajesh Kumar (Son)",
  },
  {
    id: "address_location",
    label: "1️⃣3️⃣  Address / Location",
    type: "textarea" as const,
    options: [],
    placeholder: "Full address or area/landmark for inspection visit",
  },
] as const;

type QuestionId = typeof SALES_FORM_QUESTIONS[number]["id"];
type FormAnswers = Partial<Record<QuestionId, string | string[]>>;

// ─── Status helpers ───────────────────────────────────────────────────────────

const getFormStatus = (answers: FormAnswers): "not-filled" | "partial" | "completed" => {
  const filled = Object.values(answers).filter(
    (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;
  if (filled === 0) return "not-filled";
  if (filled >= SALES_FORM_QUESTIONS.length) return "completed";
  return "partial";
};

const statusMeta = {
  "not-filled": { label: "Not Filled",       color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  "partial":    { label: "Partially Filled", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "completed":  { label: "Completed",        color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
};

const AUTO_SAVE_DELAY_MS = 2500;

// ─── "Other" field state key ──────────────────────────────────────────────────
// For questions with hasOther, we store the free-text in a sibling key e.g. "current_dialysis_location_other"
type OtherId = `${QuestionId}_other`;
type ExtendedAnswers = FormAnswers & Partial<Record<OtherId, string>>;

interface SalesFormDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  lead:          Lead | null;
  onSuccess?:    () => void;
  dialogTitle?:  string;
  allowDraft?:   boolean;
}

export function SalesFormDialog({ open, onOpenChange, lead, onSuccess }: SalesFormDialogProps) {
  const { updateLead } = useCRM();

  const [answers,        setAnswers]        = useState<ExtendedAnswers>({});
  const [submitting,     setSubmitting]     = useState(false);
  const [savingDraft,    setSavingDraft]    = useState(false);
  const [manualSaved,    setManualSaved]    = useState(false);
  const [draftSaved,     setDraftSaved]     = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error,          setError]          = useState<string | null>(null);

  const isDirtyRef       = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef     = useRef<string>("{}");

  // ── Load existing draft on open ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !lead) return;

    const existing =
      (lead as any).lead_form_draft  ??
      (lead as any).leadFormDraft    ??
      (lead as any).sales_form_data  ??
      null;

    let loaded: ExtendedAnswers = {};
    if (existing) {
      try {
        loaded = typeof existing === "string" ? JSON.parse(existing) : existing;
      } catch {
        loaded = {};
      }
    }

    setAnswers(loaded);
    lastSavedRef.current = JSON.stringify(loaded);
    isDirtyRef.current   = false;
    setManualSaved(false);
    setDraftSaved(false);
    setAutoSaveStatus("idle");
    setError(null);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [open, lead]);

  const leadId = lead?.id ?? "";

  // ── Auto-save ─────────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(
    async (answersSnapshot: ExtendedAnswers) => {
      if (!leadId) return;
      const serialised = JSON.stringify(answersSnapshot);
      if (serialised === lastSavedRef.current) return;

      const filled = Object.values(answersSnapshot).filter(
        (v) => v !== undefined && v !== "" && !(Array.isArray(v) && (v as string[]).length === 0)
      ).length;
      if (filled === 0) return;

      setAutoSaveStatus("saving");
      try {
        const ok = await updateLead(leadId, {
          lead_form_draft:    serialised,
          lead_form_is_draft: 1,
          lead_form_saved_at: new Date().toISOString(),
        } as any);
        if (ok) {
          lastSavedRef.current = serialised;
          isDirtyRef.current   = false;
          setAutoSaveStatus("saved");
          onSuccess?.();
          setTimeout(() => setAutoSaveStatus((s) => (s === "saved" ? "idle" : s)), 3000);
        } else {
          setAutoSaveStatus("error");
        }
      } catch {
        setAutoSaveStatus("error");
      }
    },
    [leadId, updateLead, onSuccess]
  );

  if (!lead) return null;

  const formStatus    = getFormStatus(answers);
  const meta          = statusMeta[formStatus];
  const hasSavedDraft = !!(
    (lead as any).lead_form_is_draft ||
    (lead as any).leadFormIsDraft
  );

  // ── Generic answer setter with auto-save trigger ──────────────────────────
  const setAnswer = (id: string, value: string | string[]) => {
    setManualSaved(false);
    setDraftSaved(false);
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      isDirtyRef.current = true;
      autoSaveTimerRef.current = setTimeout(() => {
        void triggerAutoSave(next);
      }, AUTO_SAVE_DELAY_MS);
      return next;
    });
  };

  const toggleCheckbox = (id: QuestionId, option: string) => {
    const current = (answers[id] as string[]) ?? [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setAnswer(id, next);
  };

  // ── Save as Draft ─────────────────────────────────────────────────────────
  const handleSaveAsDraft = async () => {
    setSavingDraft(true);
    setError(null);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    try {
      const serialised = JSON.stringify(answers);
      const ok = await updateLead(lead.id, {
        lead_form_draft:    serialised,
        lead_form_is_draft: 1,
        lead_form_saved_at: new Date().toISOString(),
      } as any);
      if (ok) {
        lastSavedRef.current = serialised;
        isDirtyRef.current   = false;
        setDraftSaved(true);
        setAutoSaveStatus("idle");
        onSuccess?.();
        setTimeout(() => setDraftSaved(false), 4000);
      } else {
        setError("Failed to save draft. Please try again.");
      }
    } catch {
      setError("An error occurred while saving draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  // ── Save Form (final) ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    try {
      const serialised = JSON.stringify(answers);
      const ok = await updateLead(lead.id, {
        lead_form_draft:    serialised,
        lead_form_is_draft: 0,
        lead_form_saved_at: new Date().toISOString(),
      } as any);
      if (ok) {
        lastSavedRef.current = serialised;
        isDirtyRef.current   = false;
        setManualSaved(true);
        setAutoSaveStatus("idle");
        onSuccess?.();
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const filled = Object.values(answers).filter(
    (v) => v !== undefined && v !== "" && !(Array.isArray(v) && (v as string[]).length === 0)
  ).length;
  const total = SALES_FORM_QUESTIONS.length;
  const pct   = Math.round((filled / total) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-white font-black text-lg">Lead Form</DialogTitle>
              <DialogDescription className="text-blue-100 text-xs mt-0.5 truncate">
                {lead.name} · {(lead as any).phone}
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge className={`${meta.color} text-xs font-bold border-0`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} mr-1.5`} />{meta.label}
              </Badge>
              {hasSavedDraft && formStatus !== "completed" && (
                <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-0 px-2 py-0.5">
                  <FileEdit className="h-2.5 w-2.5 mr-1" />Draft saved
                </Badge>
              )}
              <div className="text-white/70 text-[10px] font-semibold">{filled}/{total} answered</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Auto-save status */}
          <div className="mt-2 flex items-center gap-1.5 h-4">
            {autoSaveStatus === "saving" && (
              <span className="flex items-center gap-1 text-[10px] text-blue-200 font-semibold">
                <span className="h-3 w-3 border border-blue-200 border-t-transparent rounded-full animate-spin" />
                Auto-saving...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[10px] text-green-200 font-semibold">
                <Cloud className="h-3 w-3" />Auto-saved
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="flex items-center gap-1 text-[10px] text-red-200 font-semibold">
                <CloudOff className="h-3 w-3" />Auto-save failed — save manually
              </span>
            )}
          </div>
        </div>

        {/* ── Intro banner ─────────────────────────────────────────────────── */}
        <div className="mx-6 mt-5 flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl">
          <ClipboardList className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Kindly provide some basic info so that the <strong>RenalEase team</strong> can help you in the best possible way.
            We provide a <strong>No-charge / No-commitment Inspection</strong> to help you understand the arrangement for starting home treatment.
          </span>
        </div>

        {/* ── Draft restore notice ──────────────────────────────────────────── */}
        {hasSavedDraft && (
          <div className="mx-6 mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
            <FileEdit className="h-4 w-4 shrink-0" />
            <span>Draft restored — your previous answers are loaded. Continue filling or click <strong>Save Form</strong> when done.</span>
          </div>
        )}

        {/* ── Form body ─────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-4 bg-slate-50">
          {SALES_FORM_QUESTIONS.map((q) => {
            const qid = q.id as QuestionId;

            return (
              <div key={q.id} className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
                <Label className="text-sm font-bold text-slate-800 mb-3 block leading-relaxed">
                  {q.label}
                </Label>

                {/* ── text input ────────────────────────────────────────── */}
                {q.type === "text" && (
                  <Input
                    value={(answers[qid] as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder={"placeholder" in q ? q.placeholder : ""}
                    className="rounded-xl border-2 border-slate-200 focus:border-blue-400 h-10 text-sm mt-1"
                  />
                )}

                {/* ── radio ─────────────────────────────────────────────── */}
                {q.type === "radio" && (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const selected = answers[qid] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswer(q.id, opt)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150",
                              selected
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <span className={cn(
                              "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                              selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
                            )}>
                              {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* "hasOther" free-text rider */}
                    {"hasOther" in q && q.hasOther && (
                      <Input
                        value={(answers[`${q.id}_other` as OtherId] as string) ?? ""}
                        onChange={(e) => setAnswer(`${q.id}_other`, e.target.value)}
                        placeholder={"otherPlaceholder" in q ? q.otherPlaceholder : "Other details…"}
                        className="rounded-xl border-2 border-dashed border-slate-200 focus:border-blue-300 h-9 text-sm mt-1"
                      />
                    )}
                  </div>
                )}

                {/* ── checkbox ──────────────────────────────────────────── */}
                {q.type === "checkbox" && (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const checked = ((answers[qid] as string[]) ?? []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleCheckbox(qid, opt)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150",
                              checked
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <span className={cn(
                              "w-4 h-4 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
                              checked ? "border-blue-500 bg-blue-500" : "border-slate-300"
                            )}>
                              {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* "hasOther" free-text rider for checkboxes */}
                    {"hasOther" in q && q.hasOther && (
                      <Input
                        value={(answers[`${q.id}_other` as OtherId] as string) ?? ""}
                        onChange={(e) => setAnswer(`${q.id}_other`, e.target.value)}
                        placeholder={"otherPlaceholder" in q ? q.otherPlaceholder : "Other details…"}
                        className="rounded-xl border-2 border-dashed border-slate-200 focus:border-blue-300 h-9 text-sm mt-1"
                      />
                    )}
                  </div>
                )}

                {/* ── textarea ──────────────────────────────────────────── */}
                {q.type === "textarea" && (
                  <Textarea
                    className="mt-2 rounded-xl border-2 border-slate-200 focus:border-blue-400 resize-none text-sm"
                    rows={3}
                    placeholder={"placeholder" in q ? q.placeholder : "Add notes…"}
                    value={(answers[qid] as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">

          {/* Status messages */}
          <div className="flex items-center gap-2 mb-3 min-h-[28px]">
            {manualSaved && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5" />Form saved successfully
              </div>
            )}
            {draftSaved && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <FileEdit className="h-3.5 w-3.5" />Draft saved — you can continue later
              </div>
            )}
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                <AlertCircle className="h-3.5 w-3.5" />{error}
              </div>
            )}
            {!manualSaved && !draftSaved && !error && filled > 0 && autoSaveStatus === "idle" && (
              <p className="text-[10px] text-slate-400 font-medium">Auto-saves as you answer</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting || savingDraft}
              className="rounded-xl border-2 border-slate-200 font-bold px-5"
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void handleSaveAsDraft()}
                disabled={submitting || savingDraft || filled === 0}
                className="rounded-xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-bold px-5"
              >
                {savingDraft ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    Saving draft...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />Save as Draft
                  </span>
                )}
              </Button>

              <Button
                onClick={() => void handleSave()}
                disabled={submitting || savingDraft || filled === 0}
                className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold px-6 shadow-lg shadow-blue-200"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />Save Form
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

