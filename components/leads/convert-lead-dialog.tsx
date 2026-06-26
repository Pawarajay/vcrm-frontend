



// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useCRM } from "@/contexts/crm-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { X, UserCheck, Briefcase, Globe, Phone, Mail, IndianRupee } from "lucide-react";
// import type { Lead, Customer } from "@/types/crm";

// // ── Services aligned with Vasifytech SOW §5.2 ─────────────────────────────
// const TECH_SERVICES: Record<string, string> = {
//   "website":        "Website",
//   "whatsapp-api":   "WhatsApp API",
//   "lms":            "LMS",
//   "crm":            "CRM",
//   "social-media":   "Social Media",
//   "other":          "Other",
// };

// interface ConvertLeadDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   lead: Lead | null;
//   onSuccess?: () => void;
// }

// export function ConvertLeadDialog({
//   open,
//   onOpenChange,
//   lead,
//   onSuccess,
// }: ConvertLeadDialogProps) {
//   const { convertLead } = useCRM();

//   const [formData, setFormData] = useState({
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "India",
//     status: "active" as Customer["status"],
//     notes: "",
//     totalValue: "0",
//   });
//   const [tags, setTags]                 = useState<string[]>([]);
//   const [newTag, setNewTag]             = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ── Reset form whenever dialog opens with a new lead ──────────────────
//   useEffect(() => {
//     if (lead && open) {
//       const initialTags: string[] = [];
//       const serviceKey = (lead as any).service ?? "";
//       if (serviceKey && TECH_SERVICES[serviceKey]) {
//         initialTags.push(TECH_SERVICES[serviceKey]);
//       }

//       setFormData({
//         address: "",
//         city: "",
//         state: "",
//         zipCode: "",
//         country: "India",
//         status: "active",
//         notes: lead.notes || "",
//         totalValue:
//           typeof lead.estimatedValue === "number"
//             ? String(lead.estimatedValue)
//             : String(lead.estimatedValue ?? "0"),
//       });
//       setTags(initialTags);
//       setNewTag("");
//     }
//   }, [lead, open]);

//   // ── Submit ──────────────────────────────────────────────────────────────
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!lead) return;

//     const totalValueNumber = formData.totalValue ? Number(formData.totalValue) : 0;

//     const customerData = {
//       name:           lead.name,
//       email:          lead.email,
//       phone:          (lead as any).phone,
//       whatsappNumber: lead.whatsappNumber,
//       assignedTo:     lead.assignedTo,
//       ...formData,
//       totalValue: Number.isNaN(totalValueNumber) ? 0 : totalValueNumber,
//       tags,
//     };

//     setIsSubmitting(true);
//     try {
//       const ok = await convertLead(lead.id, customerData);
//       if (ok) {
//         onOpenChange(false);
//         onSuccess?.();
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── Tag helpers ─────────────────────────────────────────────────────────
//   const addTag = () => {
//     const value = newTag.trim();
//     if (value && !tags.includes(value)) setTags((prev) => [...prev, value]);
//     setNewTag("");
//   };

//   const removeTag = (tag: string) =>
//     setTags((prev) => prev.filter((t) => t !== tag));

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addTag();
//     }
//   };

//   if (!lead) return null;

//   // Resolve display-friendly values
//   const serviceLabel = TECH_SERVICES[(lead as any).service ?? ""] ?? null;
//   const displayEmail =
//     lead.email &&
//     !lead.email.includes("@whatsapp.") &&
//     !lead.email.includes("@booking.")
//       ? lead.email
//       : null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">

//         {/* ── Hero Header ──────────────────────────────────────────────── */}
//         <div className="bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 rounded-t-2xl">
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
//               <UserCheck className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <DialogTitle className="text-white font-black text-lg">
//                 Convert Lead to Client
//               </DialogTitle>
//               <DialogDescription className="text-violet-100 text-xs mt-0.5">
//                 Onboard{" "}
//                 <strong className="text-white">{lead.name}</strong> as a full
//                 client. Their lead history will be preserved and linked.
//               </DialogDescription>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-50">

//           {/* ── Lead Summary (read-only) ────────────────────────────────── */}
//           <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
//             <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center gap-2">
//               <Briefcase className="h-4 w-4 text-violet-300" />
//               <span className="font-black text-white text-sm uppercase tracking-wide">
//                 Lead Summary
//               </span>
//             </div>
//             <div className="p-5">
//               <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
//                 {/* Name */}
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                     Name:
//                   </span>
//                   <span className="font-bold text-slate-800">{lead.name}</span>
//                 </div>

//                 {/* Phone */}
//                 <div className="flex items-center gap-1.5">
//                   <Phone className="h-3.5 w-3.5 text-slate-400" />
//                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                     Phone:
//                   </span>
//                   <span className="font-semibold text-slate-700">
//                     {(lead as any).phone || "—"}
//                   </span>
//                 </div>

//                 {/* Email */}
//                 {displayEmail && (
//                   <div className="flex items-center gap-1.5">
//                     <Mail className="h-3.5 w-3.5 text-slate-400" />
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                       Email:
//                     </span>
//                     <span className="text-slate-700">{displayEmail}</span>
//                   </div>
//                 )}

//                 {/* Service */}
//                 {serviceLabel && (
//                   <div className="flex items-center gap-1.5">
//                     <Globe className="h-3.5 w-3.5 text-violet-500" />
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                       Service:
//                     </span>
//                     <span className="font-bold text-violet-700">
//                       {serviceLabel}
//                     </span>
//                   </div>
//                 )}

//                 {/* Pipeline stage */}
//                 {(lead as any).stage && (
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                       Stage:
//                     </span>
//                     <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold text-xs rounded-full">
//                       {(lead as any).stage}
//                     </Badge>
//                   </div>
//                 )}

//                 {/* Estimated value */}
//                 <div className="flex items-center gap-2">
//                   <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
//                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                     Est. Value:
//                   </span>
//                   <span className="font-black text-violet-700">
//                     {typeof lead.estimatedValue === "number"
//                       ? `₹${lead.estimatedValue.toLocaleString("en-IN")}`
//                       : "—"}
//                   </span>
//                 </div>

//                 {/* Closure date */}
//                 {(lead as any).closureDate && (
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                       Closure date:
//                     </span>
//                     <span className="font-semibold text-slate-700">
//                       {(lead as any).closureDate}
//                     </span>
//                   </div>
//                 )}

//                 {/* Sales owner */}
//                 {lead.assignedTo && (
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
//                       Sales owner:
//                     </span>
//                     <span className="font-semibold text-slate-700">
//                       {lead.assignedTo}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ── Client Record Details ───────────────────────────────────── */}
//           <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
//             <div className="bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 flex items-center gap-2">
//               <UserCheck className="h-4 w-4 text-white" />
//               <span className="font-black text-white text-sm uppercase tracking-wide">
//                 Client Details
//               </span>
//             </div>
//             <div className="p-5 space-y-4">

//               {/* Confirmed deal value + status */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <Label
//                     htmlFor="totalValue"
//                     className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                   >
//                     Confirmed Deal Value (₹)
//                   </Label>
//                   <Input
//                     id="totalValue"
//                     type="number"
//                     value={formData.totalValue}
//                     onChange={(e) =>
//                       setFormData({ ...formData, totalValue: e.target.value })
//                     }
//                     min="0"
//                     step="0.01"
//                     className="rounded-xl border-2 border-slate-200 focus:border-violet-400 font-bold"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label
//                     htmlFor="status"
//                     className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                   >
//                     Client Status
//                   </Label>
//                   <Select
//                     value={formData.status}
//                     onValueChange={(v: Customer["status"]) =>
//                       setFormData({ ...formData, status: v })
//                     }
//                   >
//                     <SelectTrigger className="rounded-xl border-2 border-slate-200 focus:border-violet-400">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="active">Active</SelectItem>
//                       <SelectItem value="inactive">Inactive</SelectItem>
//                       <SelectItem value="prospect">Prospect</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Address */}
//               <div className="space-y-1.5">
//                 <Label
//                   htmlFor="address"
//                   className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                 >
//                   Address
//                 </Label>
//                 <Input
//                   id="address"
//                   value={formData.address}
//                   onChange={(e) =>
//                     setFormData({ ...formData, address: e.target.value })
//                   }
//                   placeholder="Client's business address"
//                   className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div className="space-y-1.5">
//                   <Label
//                     htmlFor="city"
//                     className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                   >
//                     City
//                   </Label>
//                   <Input
//                     id="city"
//                     value={formData.city}
//                     onChange={(e) =>
//                       setFormData({ ...formData, city: e.target.value })
//                     }
//                     className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label
//                     htmlFor="state"
//                     className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                   >
//                     State
//                   </Label>
//                   <Input
//                     id="state"
//                     value={formData.state}
//                     onChange={(e) =>
//                       setFormData({ ...formData, state: e.target.value })
//                     }
//                     className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label
//                     htmlFor="zipCode"
//                     className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                   >
//                     PIN Code
//                   </Label>
//                   <Input
//                     id="zipCode"
//                     value={formData.zipCode}
//                     onChange={(e) =>
//                       setFormData({ ...formData, zipCode: e.target.value })
//                     }
//                     className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
//                   />
//                 </div>
//               </div>

//               <div className="h-0.5 bg-slate-100 rounded-full" />

//               {/* Tags */}
//               <div className="space-y-2">
//                 <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
//                   Tags
//                 </Label>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {tags.map((tag) => (
//                     <Badge
//                       key={tag}
//                       className="bg-violet-100 text-violet-800 border-2 border-violet-200 font-bold px-2.5 flex items-center gap-1 rounded-full"
//                     >
//                       {tag}
//                       <X
//                         className="h-3 w-3 cursor-pointer hover:text-red-600 ml-0.5"
//                         onClick={() => removeTag(tag)}
//                       />
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTag}
//                     onChange={(e) => setNewTag(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Add tag (e.g. VIP, Retainer, Follow-up)"
//                     className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={addTag}
//                     className="rounded-xl border-2 border-slate-200 font-bold hover:border-violet-400 hover:text-violet-700"
//                   >
//                     Add
//                   </Button>
//                 </div>
//                 <p className="text-xs text-slate-400">
//                   Service tags are added automatically. Add more for easy
//                   filtering.
//                 </p>
//               </div>

//               {/* Remarks / Notes */}
//               <div className="space-y-1.5">
//                 <Label
//                   htmlFor="notes"
//                   className="text-xs font-bold text-slate-500 uppercase tracking-wide"
//                 >
//                   Remarks
//                 </Label>
//                 <Textarea
//                   id="notes"
//                   value={formData.notes}
//                   onChange={(e) =>
//                     setFormData({ ...formData, notes: e.target.value })
//                   }
//                   rows={3}
//                   placeholder="Scope notes, special requirements, payment terms..."
//                   className="rounded-xl border-2 border-slate-200 focus:border-violet-400 resize-none"
//                 />
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="gap-3 pt-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSubmitting}
//               className="rounded-xl border-2 border-slate-200 font-bold px-6"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-black px-6 shadow-lg shadow-violet-200"
//             >
//               {isSubmitting ? "Converting..." : "Convert to Client"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


//testing (23-06-2026)


"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, UserCheck, Briefcase, Globe, Phone, Mail, IndianRupee } from "lucide-react";
import type { Lead, Customer } from "@/types/crm";

// ── Services aligned with Vasifytech SOW §5.2 ─────────────────────────────
const TECH_SERVICES: Record<string, string> = {
  "website":        "Website",
  "whatsapp-api":   "WhatsApp API",
  "lms":            "LMS",
  "crm":            "CRM",
  "social-media":   "Social Media",
  "other":          "Other",
};

// ── NEW: same priority logic as leads-content.tsx's getAmount/getExpectedAmount ──
// FIX: the dialog was previously reading lead.estimatedValue only, which is a
// stale/legacy field. totalAmount / total_amount is the field the leads table
// actually edits inline, so it must take priority.
const getLeadTotalAmount = (l: Lead): number => {
  const v = (l as any).totalAmount ?? (l as any).total_amount ?? l.estimatedValue ?? 0;
  return typeof v === "number" ? v : Number(v ?? 0);
};

// FIX: expectedAmount was never read from the lead at all — this is the core
// bug. Mirrors getExpectedAmount() in leads-content.tsx exactly.
const getLeadExpectedAmount = (l: Lead): number => {
  const v = (l as any).expectedAmount ?? (l as any).expected_amount ?? 0;
  return typeof v === "number" ? v : Number(v ?? 0);
};

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSuccess?: () => void;
}

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: ConvertLeadDialogProps) {
  const { convertLead } = useCRM();

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    status: "active" as Customer["status"],
    notes: "",
    totalValue: "0",
    expectedValue: "0", // ✅ NEW
  });
  const [tags, setTags]                 = useState<string[]>([]);
  const [newTag, setNewTag]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Reset form whenever dialog opens with a new lead ──────────────────
  useEffect(() => {
    if (lead && open) {
      const initialTags: string[] = [];
      const serviceKey = (lead as any).service ?? "";
      if (serviceKey && TECH_SERVICES[serviceKey]) {
        initialTags.push(TECH_SERVICES[serviceKey]);
      }

      // ✅ FIX: pull the real total/expected amounts off the lead instead of
      // only the legacy estimatedValue field.
      const leadTotal    = getLeadTotalAmount(lead);
      const leadExpected = getLeadExpectedAmount(lead);

      setFormData({
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        status: "active",
        notes: lead.notes || "",
        totalValue:    String(leadTotal || 0),
        expectedValue: String(leadExpected || 0), // ✅ NEW
      });
      setTags(initialTags);
      setNewTag("");
    }
  }, [lead, open]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const totalValueNumber    = formData.totalValue    ? Number(formData.totalValue)    : 0;
    const expectedValueNumber = formData.expectedValue ? Number(formData.expectedValue) : 0; // ✅ NEW

    const customerData = {
      name:           lead.name,
      email:          lead.email,
      phone:          (lead as any).phone,
      whatsappNumber: lead.whatsappNumber,
      assignedTo:     lead.assignedTo,
      address:        formData.address,
      city:           formData.city,
      state:          formData.state,
      zipCode:        formData.zipCode,
      country:        formData.country,
      status:         formData.status,
      notes:          formData.notes,
      totalValue:    Number.isNaN(totalValueNumber)    ? 0    : totalValueNumber,
      expectedAmount: Number.isNaN(expectedValueNumber) ? null : expectedValueNumber, // ✅ NEW
      tags,
    };

    setIsSubmitting(true);
    try {
      const ok = await convertLead(lead.id, customerData);
      if (ok) {
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tag helpers ─────────────────────────────────────────────────────────
  const addTag = () => {
    const value = newTag.trim();
    if (value && !tags.includes(value)) setTags((prev) => [...prev, value]);
    setNewTag("");
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!lead) return null;

  // Resolve display-friendly values
  const serviceLabel = TECH_SERVICES[(lead as any).service ?? ""] ?? null;
  const displayEmail =
    lead.email &&
    !lead.email.includes("@whatsapp.") &&
    !lead.email.includes("@booking.")
      ? lead.email
      : null;

  // ✅ FIX: lead summary card now shows the real amounts, same source as the
  // editable form fields below, instead of the stale estimatedValue.
  const leadTotalDisplay    = getLeadTotalAmount(lead);
  const leadExpectedDisplay = getLeadExpectedAmount(lead);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">

        {/* ── Hero Header ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-black text-lg">
                Convert Lead to Client
              </DialogTitle>
              <DialogDescription className="text-violet-100 text-xs mt-0.5">
                Onboard{" "}
                <strong className="text-white">{lead.name}</strong> as a full
                client. Their lead history will be preserved and linked.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-50">

          {/* ── Lead Summary (read-only) ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-violet-300" />
              <span className="font-black text-white text-sm uppercase tracking-wide">
                Lead Summary
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {/* Name */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Name:
                  </span>
                  <span className="font-bold text-slate-800">{lead.name}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Phone:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {(lead as any).phone || "—"}
                  </span>
                </div>

                {/* Email */}
                {displayEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Email:
                    </span>
                    <span className="text-slate-700">{displayEmail}</span>
                  </div>
                )}

                {/* Service */}
                {serviceLabel && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Service:
                    </span>
                    <span className="font-bold text-violet-700">
                      {serviceLabel}
                    </span>
                  </div>
                )}

                {/* Pipeline stage */}
                {(lead as any).stage && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Stage:
                    </span>
                    <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold text-xs rounded-full">
                      {(lead as any).stage}
                    </Badge>
                  </div>
                )}

                {/* Total amount — ✅ FIX: was lead.estimatedValue, now uses
                    the same priority logic as the leads table */}
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Total Amt:
                  </span>
                  <span className="font-black text-violet-700">
                    {leadTotalDisplay > 0
                      ? `₹${leadTotalDisplay.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>

                {/* Expected amount — ✅ NEW: previously not shown at all */}
                {leadExpectedDisplay > 0 && (
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Expected:
                    </span>
                    <span className="font-black text-amber-700">
                      ₹{leadExpectedDisplay.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Closure date */}
                {(lead as any).closureDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Closure date:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {(lead as any).closureDate}
                    </span>
                  </div>
                )}

                {/* Sales owner */}
                {lead.assignedTo && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Sales owner:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {lead.assignedTo}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Client Record Details ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-white" />
              <span className="font-black text-white text-sm uppercase tracking-wide">
                Client Details
              </span>
            </div>
            <div className="p-5 space-y-4">

              {/* Confirmed deal value + Expected amount + status */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="totalValue"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Total Amount (₹)
                  </Label>
                  <Input
                    id="totalValue"
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalValue: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="rounded-xl border-2 border-slate-200 focus:border-violet-400 font-bold"
                  />
                </div>

                {/* ✅ NEW: Expected Amount input, prefilled from the lead and
                    carried into the customerData payload on submit */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="expectedValue"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Expected Amount (₹)
                  </Label>
                  <Input
                    id="expectedValue"
                    type="number"
                    value={formData.expectedValue}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedValue: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="rounded-xl border-2 border-amber-200 focus:border-amber-400 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="status"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Client Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: Customer["status"]) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-2 border-slate-200 focus:border-violet-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="address"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                >
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Client's business address"
                  className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="city"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="state"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="zipCode"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    PIN Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="h-0.5 bg-slate-100 rounded-full" />

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-violet-100 text-violet-800 border-2 border-violet-200 font-bold px-2.5 flex items-center gap-1 rounded-full"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600 ml-0.5"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag (e.g. VIP, Retainer, Follow-up)"
                    className="rounded-xl border-2 border-slate-200 focus:border-violet-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="rounded-xl border-2 border-slate-200 font-bold hover:border-violet-400 hover:text-violet-700"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Service tags are added automatically. Add more for easy
                  filtering.
                </p>
              </div>

              {/* Remarks / Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="notes"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                >
                  Remarks
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Scope notes, special requirements, payment terms..."
                  className="rounded-xl border-2 border-slate-200 focus:border-violet-400 resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl border-2 border-slate-200 font-bold px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-black px-6 shadow-lg shadow-violet-200"
            >
              {isSubmitting ? "Converting..." : "Convert to Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}