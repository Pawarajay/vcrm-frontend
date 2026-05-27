// "use client"

// import { useMemo, useState, useCallback } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//   DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel,
//   AlertDialogContent, AlertDialogDescription,
//   AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { CustomerDialog }       from "./customer-dialog"
// import { CustomerDetailDialog } from "./customer-detail-dialog"
// import {
//   Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
//   Phone, MessageCircle, Undo2, Building2, CheckCircle2,
//   XCircle, Download, Filter, AlertTriangle, Clock,
// } from "lucide-react"
// import type { Customer } from "@/types/crm"

// // ─── Constants ────────────────────────────────────────────────────────────────

// export const SERVICE_LABELS: Record<string, string> = {
//   "whatsapp-api":    "WhatsApp API Retainer",
//   "web-development": "Web Development",
//   "seo":             "SEO / Digital Marketing",
//   "social-media":    "Social Media Management",
//   "crm-development": "CRM Development",
//   "app-development": "App Development",
//   "cloud-hosting":   "Cloud & Hosting",
//   "it-support":      "IT Support",
//   "other":           "Other",
// }

// export const BUSINESS_TYPE_LABELS: Record<string, string> = {
//   "startup":    "Startup",
//   "sme":        "SME",
//   "enterprise": "Enterprise",
//   "agency":     "Agency",
//   "ecommerce":  "E-commerce",
//   "ngo":        "NGO / Non-Profit",
//   "individual": "Individual / Freelancer",
//   "other":      "Other",
// }

// const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
//   active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//   inactive: { label: "Inactive", cls: "bg-gray-50    text-gray-500    border-gray-200"   },
//   prospect: { label: "Prospect", cls: "bg-blue-50    text-blue-700    border-blue-200"   },
// }

// const STATUS_FILTERS = [
//   { value: "all",      label: "All"      },
//   { value: "active",   label: "Active"   },
//   { value: "prospect", label: "Prospect" },
//   { value: "inactive", label: "Inactive" },
// ]

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// export const formatDate = (v: unknown): string => {
//   if (!v) return "—"
//   const d = v instanceof Date ? v : new Date(v as string)
//   return isNaN(d.getTime())
//     ? "—"
//     : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
// }

// export const displayEmail = (email: string | undefined): string | null => {
//   if (!email) return null
//   const syntheticDomains = ["@manual.", "@booking.", "@whatsapp."]
//   return syntheticDomains.some((d) => email.includes(d)) ? null : email
// }

// // ─── [NEW #2] Renewal badge helper ────────────────────────────────────────────

// type RenewalBadge = { label: string; cls: string; icon: "expired" | "soon" } | null

// const getRenewalBadge = (customer: Customer): RenewalBadge => {
//   if (!customer.recurringEnabled || !customer.renewalDate) return null
//   const days = Math.ceil(
//     (new Date(customer.renewalDate as string).getTime() - Date.now()) /
//       (1000 * 60 * 60 * 24)
//   )
//   if (days < 0)   return { label: "Expired",           cls: "bg-red-100 text-red-700 border-red-200",      icon: "expired" }
//   if (days === 0) return { label: "Expires today",      cls: "bg-red-100 text-red-700 border-red-200",      icon: "expired" }
//   if (days <= 7)  return { label: `Renews in ${days}d`, cls: "bg-amber-100 text-amber-700 border-amber-200", icon: "soon"    }
//   if (days <= 30) return { label: `Renews in ${days}d`, cls: "bg-blue-50 text-blue-600 border-blue-200",    icon: "soon"    }
//   return null
// }

// // ─── [NEW #4] CSV export ───────────────────────────────────────────────────────

// const exportToCSV = (customers: Customer[]) => {
//   const headers = [
//     "Name", "Company", "Phone", "Email", "Service", "Business Type",
//     "Status", "Sales Rep", "Total Value (₹)", "Recurring",
//     "Retainer Amount (₹)", "Renewal Date", "Onboarding Date", "City", "State",
//   ]
//   const rows = customers.map((c) => [
//     c.name ?? "",
//     c.company ?? "",
//     c.phone ?? "",
//     displayEmail(c.email) ?? "",
//     SERVICE_LABELS[c.service ?? ""] ?? c.service ?? "",
//     BUSINESS_TYPE_LABELS[c.businessType ?? ""] ?? c.businessType ?? "",
//     c.status ?? "",
//     c.salesRep ?? "",
//     c.totalValue ?? 0,
//     c.recurringEnabled ? "Yes" : "No",
//     c.recurringAmount ?? "",
//     c.renewalDate ? formatDate(c.renewalDate) : "",
//     c.onboardingDate ? formatDate(c.onboardingDate) : formatDate(c.createdAt),
//     c.city ?? "",
//     c.state ?? "",
//   ])
//   const escape = (val: unknown) => {
//     const s = String(val ?? "")
//     return s.includes(",") || s.includes('"') || s.includes("\n")
//       ? `"${s.replace(/"/g, '""')}"` : s
//   }
//   const csv  = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n")
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//   const url  = URL.createObjectURL(blob)
//   const link = document.createElement("a")
//   link.href     = url
//   link.download = `vasifytech-clients-${new Date().toISOString().slice(0, 10)}.csv`
//   link.click()
//   URL.revokeObjectURL(url)
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────

// type ToastType = { message: string; type: "success" | "error" }

// function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
//   return (
//     <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
//       toast.type === "success"
//         ? "bg-white border-emerald-200 text-emerald-700"
//         : "bg-white border-red-200 text-red-700"
//     }`}>
//       {toast.type === "success"
//         ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
//         : <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
//       {toast.message}
//       <button onClick={onDismiss} className="ml-2 text-gray-400 hover:text-gray-600 text-xs" aria-label="Dismiss">✕</button>
//     </div>
//   )
// }

// // ─── Confirm state type ───────────────────────────────────────────────────────

// interface ConfirmState {
//   open: boolean; title: string; message: string; onConfirm: () => void
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function CustomersContent() {
//   const { customers, deleteCustomer, moveCustomerToLead } = useCRM()
//   const { isAdmin } = useAuth()                                    // [NEW #3] RBAC

//   const [searchTerm,         setSearchTerm]         = useState("")
//   const [statusFilter,       setStatusFilter]       = useState("all")
//   const [serviceFilter,      setServiceFilter]      = useState("all")   // [NEW #1]
//   const [selectedCustomer,   setSelectedCustomer]   = useState<Customer | null>(null)
//   const [isAddDialogOpen,    setIsAddDialogOpen]    = useState(false)
//   const [isEditDialogOpen,   setIsEditDialogOpen]   = useState(false)
//   const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
//   const [isDeleting,         setIsDeleting]         = useState<string | null>(null)
//   const [isBackToLead,       setIsBackToLead]       = useState<string | null>(null)
//   const [toast,              setToast]              = useState<ToastType | null>(null)
//   const [confirm,            setConfirm]            = useState<ConfirmState>({
//     open: false, title: "", message: "", onConfirm: () => {},
//   })

//   const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
//     setToast({ message, type })
//     setTimeout(() => setToast(null), 3500)
//   }, [])

//   // [NEW #2] Count of expiring/expired retainers for header alert
//   const expiringCount = useMemo(
//     () => customers.filter((c) => getRenewalBadge(c) !== null).length,
//     [customers]
//   )

//   // ── Filtered list (now includes service filter) ────────────────────────────
//   const filtered = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase()
//     return customers.filter((c) => {
//       const matchSearch =
//         !term ||
//         [c.name, c.phone, c.company ?? "", c.city ?? "", c.service ?? ""]
//           .some((v) => (v ?? "").toLowerCase().includes(term))
//       const matchStatus  = statusFilter  === "all" || c.status  === statusFilter
//       const matchService = serviceFilter === "all" || c.service === serviceFilter  // [NEW #1]
//       return matchSearch && matchStatus && matchService
//     })
//   }, [customers, searchTerm, statusFilter, serviceFilter])

//   const counts = useMemo(() => ({
//     all:      customers.length,
//     active:   customers.filter((c) => c.status === "active").length,
//     prospect: customers.filter((c) => c.status === "prospect").length,
//     inactive: customers.filter((c) => c.status === "inactive").length,
//   }), [customers])

//   // ── Handlers ──────────────────────────────────────────────────────────────

//   const openConfirm = (title: string, message: string, onConfirm: () => void) =>
//     setConfirm({ open: true, title, message, onConfirm })

//   const handleDelete = useCallback((customer: Customer) => {
//     openConfirm(
//       "Delete client?",
//       `"${customer.name}" will be permanently removed. This cannot be undone.`,
//       async () => {
//         setIsDeleting(customer.id)
//         try {
//           const ok = await deleteCustomer(customer.id)
//           if (ok) showToast("Client deleted.")
//           else     showToast("Failed to delete client.", "error")
//         } catch { showToast("An error occurred.", "error") }
//         finally  { setIsDeleting(null) }
//       }
//     )
//   }, [deleteCustomer, showToast])

//   const handleBackToLead = useCallback((customer: Customer) => {
//     openConfirm(
//       "Move back to Leads?",
//       `"${customer.name}" will be moved from Clients back to Leads.`,
//       async () => {
//         setIsBackToLead(customer.id)
//         try {
//           const ok = await moveCustomerToLead(customer.id)
//           if (ok) showToast(`${customer.name} moved back to Leads.`)
//           else     showToast("Failed to move client.", "error")
//         } catch { showToast("An error occurred.", "error") }
//         finally  { setIsBackToLead(null) }
//       }
//     )
//   }, [moveCustomerToLead, showToast])

//   const handleCall = useCallback((customer: Customer) => {
//     if (!customer.phone) { showToast("No phone number available.", "error"); return }
//     window.open(`tel:${customer.phone}`, "_self")
//   }, [showToast])

//   const handleWhatsApp = useCallback((customer: Customer) => {
//     const number = customer.whatsappNumber || customer.phone
//     if (!number) { showToast("No WhatsApp number available.", "error"); return }
//     const clean   = number.replace(/\D/g, "")
//     const message = encodeURIComponent("Hi, following up regarding your project with Vasifytech.")
//     window.open(`https://wa.me/${clean}?text=${message}`, "_blank", "noopener,noreferrer")
//   }, [showToast])

//   const handleViewDetails = useCallback((c: Customer) => { setSelectedCustomer(c); setIsDetailDialogOpen(true) }, [])
//   const handleEdit        = useCallback((c: Customer) => { setSelectedCustomer(c); setIsEditDialogOpen(true)  }, [])
//   const handleDialogSaved = useCallback((isEdit: boolean) => {
//     showToast(isEdit ? "Client updated." : "Client added.")
//   }, [showToast])

//   // [NEW #4] CSV export handler
//   const handleExport = useCallback(() => {
//     if (!filtered.length) { showToast("No clients to export.", "error"); return }
//     exportToCSV(filtered)
//     showToast(`Exported ${filtered.length} client${filtered.length !== 1 ? "s" : ""} to CSV.`)
//   }, [filtered, showToast])

//   const clearAllFilters = () => { setSearchTerm(""); setStatusFilter("all"); setServiceFilter("all") }

//   // ─── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">

//       {/* ── Page Header ───────────────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
//         <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-semibold text-gray-900">Client Directory</h1>
//             <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
//               {customers.length} client{customers.length !== 1 ? "s" : ""} registered
//               {/* [NEW #2] Expiring retainer alert */}
//               {expiringCount > 0 && (
//                 <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
//                   <AlertTriangle className="h-3 w-3" />
//                   {expiringCount} retainer{expiringCount !== 1 ? "s" : ""} expiring
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className="flex items-center gap-2 shrink-0">
//             {/* [NEW #4] Export CSV button */}
//             <Button
//               variant="outline"
//               onClick={handleExport}
//               className="rounded-xl border-gray-200 text-gray-600 text-sm font-medium px-3 h-9 items-center gap-1.5 hidden sm:flex"
//             >
//               <Download className="h-4 w-4" />
//               Export CSV
//             </Button>
//             <Button
//               onClick={() => setIsAddDialogOpen(true)}
//               className="bg-[#3A7AFE] hover:bg-[#2563EB] text-white rounded-xl px-4 h-9 text-sm font-medium flex items-center gap-2 shadow-sm"
//             >
//               <Plus className="h-4 w-4" />
//               <span className="hidden sm:inline">Add Client</span>
//               <span className="sm:hidden">Add</span>
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

//         {/* ── Filters ────────────────────────────────────────────────────── */}
//         <div className="space-y-3">

//           {/* Row 1: Search + Status tabs + result count */}
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//             <div className="relative w-full sm:w-72 shrink-0">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
//               <Input
//                 placeholder="Search name, phone, company…"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9 h-9 rounded-xl border border-gray-200 focus:border-[#3A7AFE] bg-white text-sm"
//               />
//             </div>

//             <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
//               {STATUS_FILTERS.map((f) => (
//                 <button
//                   key={f.value}
//                   type="button"
//                   onClick={() => setStatusFilter(f.value)}
//                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
//                     statusFilter === f.value
//                       ? "bg-white text-gray-900 shadow-sm"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   {f.label}
//                   <span className={`text-[10px] font-bold tabular-nums ${
//                     statusFilter === f.value ? "text-[#3A7AFE]" : "text-gray-400"
//                   }`}>
//                     {counts[f.value as keyof typeof counts]}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <div className="ml-auto text-xs text-gray-400 font-medium shrink-0 hidden sm:block">
//               {filtered.length} of {customers.length} clients
//             </div>
//           </div>

//           {/* [NEW #1] Row 2: Service filter + active pills */}
//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="flex items-center gap-1.5 shrink-0">
//               <Filter className="h-3.5 w-3.5 text-gray-400" />
//               <span className="text-xs text-gray-400 font-medium">Service:</span>
//             </div>

//             <select
//               value={serviceFilter}
//               onChange={(e) => setServiceFilter(e.target.value)}
//               className="h-8 rounded-lg border border-gray-200 text-xs px-2 bg-white text-gray-700 focus:border-[#3A7AFE] focus:outline-none"
//             >
//               <option value="all">All Services</option>
//               {Object.entries(SERVICE_LABELS).map(([key, label]) => (
//                 <option key={key} value={key}>{label}</option>
//               ))}
//             </select>

//             {serviceFilter !== "all" && (
//               <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
//                 {SERVICE_LABELS[serviceFilter] ?? serviceFilter}
//                 <button
//                   type="button"
//                   onClick={() => setServiceFilter("all")}
//                   className="ml-0.5 hover:text-violet-900"
//                   aria-label="Clear service filter"
//                 >✕</button>
//               </span>
//             )}

//             {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
//               <button
//                 type="button"
//                 onClick={clearAllFilters}
//                 className="text-xs text-[#3A7AFE] font-medium hover:underline ml-auto"
//               >
//                 Clear all filters
//               </button>
//             )}

//             {/* Mobile export */}
//             <button
//               type="button"
//               onClick={handleExport}
//               className="sm:hidden flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 ml-auto"
//             >
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//           </div>
//         </div>

//         {/* ── Table ─────────────────────────────────────────────────────────── */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

//           {/* Desktop header — [NEW] added Sales Rep + Renewal columns */}
//           <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1.4fr_1fr_90px_110px_110px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Client / Company</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Phone</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Service</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Sales Rep</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Status</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Renewal</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide text-right">Actions</div>
//           </div>

//           {/* Empty state */}
//           {filtered.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
//               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
//                 <Building2 className="h-7 w-7 opacity-40" />
//               </div>
//               <p className="text-sm font-medium text-gray-500">
//                 {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
//                   ? "No clients match your filters"
//                   : "No clients yet"}
//               </p>
//               {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
//                 <button
//                   type="button"
//                   onClick={clearAllFilters}
//                   className="mt-2 text-xs text-[#3A7AFE] font-medium hover:underline"
//                 >
//                   Clear filters
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Rows */}
//           <div className="divide-y divide-gray-50" role="list">
//             {filtered.map((customer) => {
//               const svc          = customer.service ?? ""
//               const status       = STATUS_CONFIG[customer.status ?? "active"] ?? STATUS_CONFIG.active
//               const renewalBadge = getRenewalBadge(customer)   // [NEW #2 + #3]

//               return (
//                 <div
//                   key={customer.id}
//                   role="listitem"
//                   tabIndex={0}
//                   className={`group cursor-pointer transition-colors focus:outline-none focus:bg-blue-50/30 ${
//                     renewalBadge?.icon === "expired"
//                       ? "hover:bg-red-50/40 bg-red-50/20"
//                       : renewalBadge?.icon === "soon"
//                       ? "hover:bg-amber-50/30 bg-amber-50/10"
//                       : "hover:bg-gray-50/70"
//                   }`}
//                   onClick={() => handleViewDetails(customer)}
//                   onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleViewDetails(customer) }}
//                 >
//                   {/* ── Desktop row ──────────────────────────────────────── */}
//                   <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1.4fr_1fr_90px_110px_110px] gap-3 items-center px-5 py-3.5">

//                     {/* Col 1: Avatar + Name + company */}
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
//                         {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate leading-tight">
//                           {customer.name || "Unnamed"}
//                         </p>
//                         <p className="text-xs text-gray-400 truncate mt-0.5">
//                           {customer.company || displayEmail(customer.email) || "—"}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Col 2: Phone */}
//                     <div className="flex items-center gap-1.5 min-w-0">
//                       <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
//                       <span className="text-sm text-gray-700 font-medium truncate">
//                         {customer.phone || "—"}
//                       </span>
//                     </div>

//                     {/* Col 3: Service */}
//                     <div className="min-w-0">
//                       {svc ? (
//                         <span className="text-xs text-violet-700 font-medium bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg truncate block w-fit max-w-full">
//                           {SERVICE_LABELS[svc] ?? svc}
//                         </span>
//                       ) : (
//                         <span className="text-xs text-gray-300">—</span>
//                       )}
//                     </div>

//                     {/* [NEW] Col 4: Sales Rep */}
//                     <div className="min-w-0">
//                       <span className="text-xs text-gray-600 truncate">
//                         {customer.salesRep || <span className="text-gray-300">—</span>}
//                       </span>
//                     </div>

//                     {/* Col 5: Status */}
//                     <div>
//                       <Badge className={`${status.cls} border text-xs font-medium px-2 py-0.5 whitespace-nowrap`}>
//                         {status.label}
//                       </Badge>
//                     </div>

//                     {/* [NEW #2] Col 6: Renewal badge */}
//                     <div>
//                       {renewalBadge ? (
//                         <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.5 rounded-lg whitespace-nowrap ${renewalBadge.cls}`}>
//                           {renewalBadge.icon === "expired"
//                             ? <AlertTriangle className="h-3 w-3 shrink-0" />
//                             : <Clock className="h-3 w-3 shrink-0" />}
//                           {renewalBadge.label}
//                         </span>
//                       ) : (
//                         <span className="text-xs text-gray-300">
//                           {customer.recurringEnabled
//                             ? formatDate(customer.renewalDate)
//                             : "—"}
//                         </span>
//                       )}
//                     </div>

//                     {/* Col 7: Actions */}
//                     <div
//                       className="flex items-center gap-1 justify-end"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.phone}
//                         onClick={() => handleCall(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400"
//                         title="Call client"
//                       >
//                         <Phone className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.whatsappNumber && !customer.phone}
//                         onClick={() => handleWhatsApp(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400"
//                         title="WhatsApp client"
//                       >
//                         <MessageCircle className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button
//                         variant="ghost" size="sm"
//                         onClick={() => handleViewDetails(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
//                         title="View profile"
//                       >
//                         <Eye className="h-3.5 w-3.5" />
//                       </Button>

//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant="ghost" size="sm"
//                             className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
//                             disabled={isDeleting === customer.id || isBackToLead === customer.id}
//                           >
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
//                           <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
//                             <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" />
//                             Edit Client
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onSelect={() => handleBackToLead(customer)}
//                             disabled={isBackToLead === customer.id}
//                             className="text-sm rounded-lg"
//                           >
//                             <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" />
//                             {isBackToLead === customer.id ? "Moving…" : "Back to Lead"}
//                           </DropdownMenuItem>
//                           {/* [NEW #3] Delete visible to admins only */}
//                           {isAdmin && (
//                             <>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem
//                                 onSelect={() => handleDelete(customer)}
//                                 className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
//                                 disabled={isDeleting === customer.id}
//                               >
//                                 <Trash2 className="mr-2 h-3.5 w-3.5" />
//                                 {isDeleting === customer.id ? "Deleting…" : "Delete"}
//                               </DropdownMenuItem>
//                             </>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>

//                   {/* ── Mobile card row ───────────────────────────────────── */}
//                   <div className="md:hidden px-4 py-4 flex items-start gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
//                       {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
//                     </div>

//                     <div className="flex-1 min-w-0 space-y-1">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <p className="text-sm font-semibold text-gray-900 truncate">{customer.name || "Unnamed"}</p>
//                         <Badge className={`${status.cls} border text-[10px] font-medium px-1.5 py-0 shrink-0`}>
//                           {status.label}
//                         </Badge>
//                         {/* [NEW #2] Renewal badge on mobile */}
//                         {renewalBadge && (
//                           <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.5 rounded-lg ${renewalBadge.cls}`}>
//                             {renewalBadge.icon === "expired"
//                               ? <AlertTriangle className="h-2.5 w-2.5" />
//                               : <Clock className="h-2.5 w-2.5" />}
//                             {renewalBadge.label}
//                           </span>
//                         )}
//                       </div>
//                       {customer.company && (
//                         <p className="text-xs text-gray-500 flex items-center gap-1">
//                           <Building2 className="h-3 w-3 text-gray-300" />
//                           {customer.company}
//                         </p>
//                       )}
//                       <p className="text-xs text-gray-500 flex items-center gap-1">
//                         <Phone className="h-3 w-3 text-gray-300" />
//                         {customer.phone || "—"}
//                       </p>
//                       {svc && (
//                         <p className="text-xs text-violet-600 font-medium">
//                           {SERVICE_LABELS[svc] ?? svc}
//                         </p>
//                       )}
//                       {/* [NEW] Sales rep on mobile */}
//                       {customer.salesRep && (
//                         <p className="text-xs text-gray-400">Rep: {customer.salesRep}</p>
//                       )}
//                       <p className="text-xs text-gray-400">Onboarded {formatDate(customer.createdAt)}</p>
//                     </div>

//                     <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.phone}
//                         onClick={() => handleCall(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400"
//                       >
//                         <Phone className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.whatsappNumber && !customer.phone}
//                         onClick={() => handleWhatsApp(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400"
//                       >
//                         <MessageCircle className="h-3.5 w-3.5" />
//                       </Button>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
//                           <DropdownMenuItem onSelect={() => handleViewDetails(customer)} className="text-sm rounded-lg">
//                             <Eye className="mr-2 h-3.5 w-3.5 text-gray-400" /> View Profile
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
//                             <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" /> Edit Client
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onSelect={() => handleBackToLead(customer)} className="text-sm rounded-lg">
//                             <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" /> Back to Lead
//                           </DropdownMenuItem>
//                           {/* [NEW #3] Admin-only delete on mobile */}
//                           {isAdmin && (
//                             <>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem
//                                 onSelect={() => handleDelete(customer)}
//                                 className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
//                               >
//                                 <Trash2 className="mr-2 h-3.5 w-3.5" />
//                                 {isDeleting === customer.id ? "Deleting…" : "Delete"}
//                               </DropdownMenuItem>
//                             </>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           {/* Footer */}
//           {filtered.length > 0 && (
//             <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
//               <p className="text-xs text-gray-400">
//                 Showing{" "}
//                 <span className="font-semibold text-gray-600">{filtered.length}</span>
//                 {" "}of{" "}
//                 <span className="font-semibold text-gray-600">{customers.length}</span>
//                 {" "}clients
//               </p>
//               {/* [NEW #4] Footer export shortcut */}
//               <button
//                 type="button"
//                 onClick={handleExport}
//                 className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-[#3A7AFE] font-medium transition-colors"
//               >
//                 <Download className="h-3.5 w-3.5" />
//                 Export {filtered.length !== customers.length ? "filtered" : "all"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Dialogs ───────────────────────────────────────────────────────── */}
//       <CustomerDialog
//         open={isAddDialogOpen}
//         onOpenChange={setIsAddDialogOpen}
//         customer={null}
//         mode="add"
//         onSaved={() => handleDialogSaved(false)}
//       />
//       <CustomerDialog
//         open={isEditDialogOpen}
//         onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setSelectedCustomer(null) }}
//         customer={selectedCustomer}
//         mode="edit"
//         onSaved={() => handleDialogSaved(true)}
//       />
//       <CustomerDetailDialog
//         open={isDetailDialogOpen}
//         onOpenChange={(open) => { setIsDetailDialogOpen(open); if (!open) setSelectedCustomer(null) }}
//         customer={selectedCustomer}
//         onCallCustomer={handleCall}
//         onWhatsAppCustomer={handleWhatsApp}
//         onEditCustomer={handleEdit}
//         onScheduleMeeting={(c) => showToast(`Meeting scheduling coming soon for ${c.name}.`)}
//       />

//       {/* ── Confirm AlertDialog ────────────────────────────────────────── */}
//       <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((prev) => ({ ...prev, open }))}>
//         <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl max-w-sm">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-base font-semibold text-gray-900">{confirm.title}</AlertDialogTitle>
//             <AlertDialogDescription className="text-sm text-gray-500">{confirm.message}</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 text-sm">Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={confirm.onConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm">
//               Confirm
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
//     </div>
//   )
// }




// testing





// "use client"

// import { useMemo, useState, useCallback, useRef, useEffect } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//   DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel,
//   AlertDialogContent, AlertDialogDescription,
//   AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { CustomerDialog }       from "./customer-dialog"
// import { CustomerDetailDialog } from "./customer-detail-dialog"
// import {
//   Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
//   Phone, MessageCircle, Undo2, Building2, CheckCircle2,
//   XCircle, Download, Filter, Pencil, Check, X,
// } from "lucide-react"
// import type { Customer } from "@/types/crm"

// // ─── Constants ────────────────────────────────────────────────────────────────

// export const SERVICE_LABELS: Record<string, string> = {
//   "whatsapp-api":    "WhatsApp API Retainer",
//   "web-development": "Web Development",
//   "seo":             "SEO / Digital Marketing",
//   "social-media":    "Social Media Management",
//   "crm-development": "CRM Development",
//   "app-development": "App Development",
//   "cloud-hosting":   "Cloud & Hosting",
//   "it-support":      "IT Support",
//   "other":           "Other",
// }

// export const BUSINESS_TYPE_LABELS: Record<string, string> = {
//   "startup":    "Startup",
//   "sme":        "SME",
//   "enterprise": "Enterprise",
//   "agency":     "Agency",
//   "ecommerce":  "E-commerce",
//   "ngo":        "NGO / Non-Profit",
//   "individual": "Individual / Freelancer",
//   "other":      "Other",
// }

// const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
//   active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//   inactive: { label: "Inactive", cls: "bg-gray-50    text-gray-500    border-gray-200"   },
//   prospect: { label: "Prospect", cls: "bg-blue-50    text-blue-700    border-blue-200"   },
// }

// const STATUS_FILTERS = [
//   { value: "all",      label: "All"      },
//   { value: "active",   label: "Active"   },
//   { value: "prospect", label: "Prospect" },
//   { value: "inactive", label: "Inactive" },
// ]

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// export const formatDate = (v: unknown): string => {
//   if (!v) return "—"
//   const d = v instanceof Date ? v : new Date(v as string)
//   return isNaN(d.getTime())
//     ? "—"
//     : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
// }

// export const displayEmail = (email: string | undefined): string | null => {
//   if (!email) return null
//   const syntheticDomains = ["@manual.", "@booking.", "@whatsapp."]
//   return syntheticDomains.some((d) => email.includes(d)) ? null : email
// }

// const formatCurrency = (v: unknown): string => {
//   if (v == null || v === "") return "—"
//   const n = Number(v)
//   if (isNaN(n)) return "—"
//   return `₹${n.toLocaleString("en-IN")}`
// }

// // ─── CSV export ───────────────────────────────────────────────────────────────

// const exportToCSV = (customers: Customer[]) => {
//   const headers = [
//     "Name", "Company", "Phone", "Email", "Service", "Business Type",
//     "Status", "Assigned User", "Deal Value (₹)", "Total Value (₹)",
//     "Closure Date", "Onboarding Date", "City", "State",
//   ]
//   const rows = customers.map((c) => [
//     c.name ?? "",
//     c.company ?? "",
//     c.phone ?? "",
//     displayEmail(c.email) ?? "",
//     SERVICE_LABELS[c.service ?? ""] ?? c.service ?? "",
//     BUSINESS_TYPE_LABELS[c.businessType ?? ""] ?? c.businessType ?? "",
//     c.status ?? "",
//     c.assignedUser ?? "",
//     c.dealValue ?? "",
//     c.totalValue ?? 0,
//     c.closureDate ? formatDate(c.closureDate) : "",
//     c.onboardingDate ? formatDate(c.onboardingDate) : formatDate(c.createdAt),
//     c.city ?? "",
//     c.state ?? "",
//   ])
//   const escape = (val: unknown) => {
//     const s = String(val ?? "")
//     return s.includes(",") || s.includes('"') || s.includes("\n")
//       ? `"${s.replace(/"/g, '""')}"` : s
//   }
//   const csv  = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n")
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//   const url  = URL.createObjectURL(blob)
//   const link = document.createElement("a")
//   link.href     = url
//   link.download = `vasifytech-clients-${new Date().toISOString().slice(0, 10)}.csv`
//   link.click()
//   URL.revokeObjectURL(url)
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────

// type ToastType = { message: string; type: "success" | "error" }

// function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
//   return (
//     <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
//       toast.type === "success"
//         ? "bg-white border-emerald-200 text-emerald-700"
//         : "bg-white border-red-200 text-red-700"
//     }`}>
//       {toast.type === "success"
//         ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
//         : <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
//       {toast.message}
//       <button onClick={onDismiss} className="ml-2 text-gray-400 hover:text-gray-600 text-xs" aria-label="Dismiss">✕</button>
//     </div>
//   )
// }

// // ─── Deal Value Popover Cell ──────────────────────────────────────────────────
// // Pencil icon → small anchored popover with ₹ input, Enter/✓ saves, Esc/✕ cancels

// interface DealValueCellProps {
//   customer: Customer
//   onSave:   (id: string, value: number) => Promise<void>
// }

// function DealValueCell({ customer, onSave }: DealValueCellProps) {
//   const [open,   setOpen]   = useState(false)
//   const [value,  setValue]  = useState("")
//   const [saving, setSaving] = useState(false)
//   const inputRef            = useRef<HTMLInputElement>(null)
//   const wrapRef             = useRef<HTMLDivElement>(null)

//   // Open popover: seed with current value
//   const openPopover = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     setValue(customer.dealValue != null ? String(customer.dealValue) : "")
//     setOpen(true)
//     setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 30)
//   }

//   const cancel = (e?: React.MouseEvent) => {
//     e?.stopPropagation()
//     setOpen(false)
//   }

//   const save = async (e?: React.MouseEvent) => {
//     e?.stopPropagation()
//     const n = Number(value)
//     if (value === "" || isNaN(n) || n < 0) { setOpen(false); return }
//     setSaving(true)
//     await onSave(customer.id, n)
//     setSaving(false)
//     setOpen(false)
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     e.stopPropagation()
//     if (e.key === "Enter")  save()
//     if (e.key === "Escape") cancel()
//   }

//   // Close on outside click
//   useEffect(() => {
//     if (!open) return
//     const handler = (e: MouseEvent) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
//     }
//     document.addEventListener("mousedown", handler)
//     return () => document.removeEventListener("mousedown", handler)
//   }, [open])

//   return (
//     <div ref={wrapRef} className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
//       {/* Display value */}
//       <span className={`text-sm font-medium ${customer.dealValue != null ? "text-gray-800" : "text-gray-300"}`}>
//         {customer.dealValue != null ? formatCurrency(customer.dealValue) : "—"}
//       </span>

//       {/* Pencil trigger */}
//       <button
//         type="button"
//         onClick={openPopover}
//         title="Edit deal value"
//         className="h-5 w-5 rounded-md flex items-center justify-center text-gray-300 hover:text-[#3A7AFE] hover:bg-blue-50 transition-colors"
//       >
//         <Pencil className="h-3 w-3" />
//       </button>

//       {/* Anchored popover */}
//       {open && (
//         <div
//           className="absolute left-0 top-7 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-2.5 flex items-center gap-1.5 min-w-[170px]"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <span className="text-xs text-gray-400 shrink-0 font-medium">₹</span>
//           <input
//             ref={inputRef}
//             type="number"
//             min="0"
//             value={value}
//             onChange={(e) => setValue(e.target.value)}
//             onKeyDown={handleKeyDown}
//             disabled={saving}
//             placeholder="Enter amount"
//             className="w-28 h-7 text-xs border border-gray-200 rounded-lg px-2 focus:outline-none focus:border-[#3A7AFE] focus:ring-1 focus:ring-[#3A7AFE]/20 disabled:opacity-50"
//           />
//           <button
//             onClick={save}
//             disabled={saving}
//             title="Save"
//             className="h-6 w-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
//           >
//             <Check className="h-3 w-3" />
//           </button>
//           <button
//             onClick={cancel}
//             title="Cancel"
//             className="h-6 w-6 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors shrink-0"
//           >
//             <X className="h-3 w-3" />
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ─── Confirm state type ───────────────────────────────────────────────────────

// interface ConfirmState {
//   open: boolean; title: string; message: string; onConfirm: () => void
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function CustomersContent() {
//   const { customers, deleteCustomer, moveCustomerToLead, updateCustomer } = useCRM()
//   const { isAdmin } = useAuth()

//   const [searchTerm,         setSearchTerm]         = useState("")
//   const [statusFilter,       setStatusFilter]       = useState("all")
//   const [serviceFilter,      setServiceFilter]      = useState("all")
//   const [selectedCustomer,   setSelectedCustomer]   = useState<Customer | null>(null)
//   const [isAddDialogOpen,    setIsAddDialogOpen]    = useState(false)
//   const [isEditDialogOpen,   setIsEditDialogOpen]   = useState(false)
//   const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
//   const [isDeleting,         setIsDeleting]         = useState<string | null>(null)
//   const [isBackToLead,       setIsBackToLead]       = useState<string | null>(null)
//   const [toast,              setToast]              = useState<ToastType | null>(null)
//   const [confirm,            setConfirm]            = useState<ConfirmState>({
//     open: false, title: "", message: "", onConfirm: () => {},
//   })

//   const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
//     setToast({ message, type })
//     setTimeout(() => setToast(null), 3500)
//   }, [])

//   // ── Filtered list ──────────────────────────────────────────────────────────
//   const filtered = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase()
//     return customers.filter((c) => {
//       const matchSearch =
//         !term ||
//         [c.name, c.phone, c.company ?? "", c.city ?? "", c.service ?? ""]
//           .some((v) => (v ?? "").toLowerCase().includes(term))
//       const matchStatus  = statusFilter  === "all" || c.status  === statusFilter
//       const matchService = serviceFilter === "all" || c.service === serviceFilter
//       return matchSearch && matchStatus && matchService
//     })
//   }, [customers, searchTerm, statusFilter, serviceFilter])

//   const counts = useMemo(() => ({
//     all:      customers.length,
//     active:   customers.filter((c) => c.status === "active").length,
//     prospect: customers.filter((c) => c.status === "prospect").length,
//     inactive: customers.filter((c) => c.status === "inactive").length,
//   }), [customers])

//   // ── Handlers ──────────────────────────────────────────────────────────────

//   const openConfirm = (title: string, message: string, onConfirm: () => void) =>
//     setConfirm({ open: true, title, message, onConfirm })

//   const handleDelete = useCallback((customer: Customer) => {
//     openConfirm(
//       "Delete client?",
//       `"${customer.name}" will be permanently removed. This cannot be undone.`,
//       async () => {
//         setIsDeleting(customer.id)
//         try {
//           const ok = await deleteCustomer(customer.id)
//           if (ok) showToast("Client deleted.")
//           else     showToast("Failed to delete client.", "error")
//         } catch { showToast("An error occurred.", "error") }
//         finally  { setIsDeleting(null) }
//       }
//     )
//   }, [deleteCustomer, showToast])

//   const handleBackToLead = useCallback((customer: Customer) => {
//     openConfirm(
//       "Move back to Leads?",
//       `"${customer.name}" will be moved from Clients back to Leads.`,
//       async () => {
//         setIsBackToLead(customer.id)
//         try {
//           const ok = await moveCustomerToLead(customer.id)
//           if (ok) showToast(`${customer.name} moved back to Leads.`)
//           else     showToast("Failed to move client.", "error")
//         } catch { showToast("An error occurred.", "error") }
//         finally  { setIsBackToLead(null) }
//       }
//     )
//   }, [moveCustomerToLead, showToast])

//   const handleCall = useCallback((customer: Customer) => {
//     if (!customer.phone) { showToast("No phone number available.", "error"); return }
//     window.open(`tel:${customer.phone}`, "_self")
//   }, [showToast])

//   const handleWhatsApp = useCallback((customer: Customer) => {
//     const number = customer.whatsappNumber || customer.phone
//     if (!number) { showToast("No WhatsApp number available.", "error"); return }
//     const clean   = number.replace(/\D/g, "")
//     const message = encodeURIComponent("Hi, following up regarding your project with Vasifytech.")
//     window.open(`https://wa.me/${clean}?text=${message}`, "_blank", "noopener,noreferrer")
//   }, [showToast])

//   const handleViewDetails = useCallback((c: Customer) => { setSelectedCustomer(c); setIsDetailDialogOpen(true) }, [])
//   const handleEdit        = useCallback((c: Customer) => { setSelectedCustomer(c); setIsEditDialogOpen(true)  }, [])
//   const handleDialogSaved = useCallback((isEdit: boolean) => {
//     showToast(isEdit ? "Client updated." : "Client added.")
//   }, [showToast])

//   // ── Inline deal-value save via PATCH ──────────────────────────────────────
//   const handleDealValueSave = useCallback(async (id: string, value: number) => {
//     try {
//       const ok = await updateCustomer(id, { dealValue: value } as any)
//       if (ok) showToast("Deal value updated.")
//       else     showToast("Failed to save deal value.", "error")
//     } catch {
//       showToast("An error occurred.", "error")
//     }
//   }, [updateCustomer, showToast])

//   const handleExport = useCallback(() => {
//     if (!filtered.length) { showToast("No clients to export.", "error"); return }
//     exportToCSV(filtered)
//     showToast(`Exported ${filtered.length} client${filtered.length !== 1 ? "s" : ""} to CSV.`)
//   }, [filtered, showToast])

//   const clearAllFilters = () => { setSearchTerm(""); setStatusFilter("all"); setServiceFilter("all") }

//   // ─── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">

//       {/* ── Page Header ───────────────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
//         <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-semibold text-gray-900">Client Directory</h1>
//             <p className="text-sm text-gray-400 mt-0.5">
//               {customers.length} client{customers.length !== 1 ? "s" : ""} registered
//             </p>
//           </div>

//           <div className="flex items-center gap-2 shrink-0">
//             <Button
//               variant="outline"
//               onClick={handleExport}
//               className="rounded-xl border-gray-200 text-gray-600 text-sm font-medium px-3 h-9 items-center gap-1.5 hidden sm:flex"
//             >
//               <Download className="h-4 w-4" />
//               Export CSV
//             </Button>
//             <Button
//               onClick={() => setIsAddDialogOpen(true)}
//               className="bg-[#3A7AFE] hover:bg-[#2563EB] text-white rounded-xl px-4 h-9 text-sm font-medium flex items-center gap-2 shadow-sm"
//             >
//               <Plus className="h-4 w-4" />
//               <span className="hidden sm:inline">Add Client</span>
//               <span className="sm:hidden">Add</span>
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

//         {/* ── Filters ────────────────────────────────────────────────────── */}
//         <div className="space-y-3">

//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//             <div className="relative w-full sm:w-72 shrink-0">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
//               <Input
//                 placeholder="Search name, phone, company…"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9 h-9 rounded-xl border border-gray-200 focus:border-[#3A7AFE] bg-white text-sm"
//               />
//             </div>

//             <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
//               {STATUS_FILTERS.map((f) => (
//                 <button
//                   key={f.value}
//                   type="button"
//                   onClick={() => setStatusFilter(f.value)}
//                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
//                     statusFilter === f.value
//                       ? "bg-white text-gray-900 shadow-sm"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   {f.label}
//                   <span className={`text-[10px] font-bold tabular-nums ${
//                     statusFilter === f.value ? "text-[#3A7AFE]" : "text-gray-400"
//                   }`}>
//                     {counts[f.value as keyof typeof counts]}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <div className="ml-auto text-xs text-gray-400 font-medium shrink-0 hidden sm:block">
//               {filtered.length} of {customers.length} clients
//             </div>
//           </div>

//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="flex items-center gap-1.5 shrink-0">
//               <Filter className="h-3.5 w-3.5 text-gray-400" />
//               <span className="text-xs text-gray-400 font-medium">Service:</span>
//             </div>

//             <select
//               value={serviceFilter}
//               onChange={(e) => setServiceFilter(e.target.value)}
//               className="h-8 rounded-lg border border-gray-200 text-xs px-2 bg-white text-gray-700 focus:border-[#3A7AFE] focus:outline-none"
//             >
//               <option value="all">All Services</option>
//               {Object.entries(SERVICE_LABELS).map(([key, label]) => (
//                 <option key={key} value={key}>{label}</option>
//               ))}
//             </select>

//             {serviceFilter !== "all" && (
//               <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
//                 {SERVICE_LABELS[serviceFilter] ?? serviceFilter}
//                 <button type="button" onClick={() => setServiceFilter("all")} className="ml-0.5 hover:text-violet-900" aria-label="Clear service filter">✕</button>
//               </span>
//             )}

//             {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
//               <button type="button" onClick={clearAllFilters} className="text-xs text-[#3A7AFE] font-medium hover:underline ml-auto">
//                 Clear all filters
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={handleExport}
//               className="sm:hidden flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 ml-auto"
//             >
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//           </div>
//         </div>

//         {/* ── Table ─────────────────────────────────────────────────────────── */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

//           {/*
//             Columns: Client/Company | Phone | Service | User | Status | Closure Date | Deal Value | Actions
//           */}
//           <div className="hidden md:grid md:grid-cols-[2fr_1.1fr_1.3fr_0.9fr_90px_1fr_1.2fr_100px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Client / Company</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Phone</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Service</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">User</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Status</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Closure Date</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide">Deal Value</div>
//             <div className="text-xs font-semibold text-gray-400 tracking-wide text-right">Actions</div>
//           </div>

//           {/* Empty state */}
//           {filtered.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
//               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
//                 <Building2 className="h-7 w-7 opacity-40" />
//               </div>
//               <p className="text-sm font-medium text-gray-500">
//                 {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
//                   ? "No clients match your filters"
//                   : "No clients yet"}
//               </p>
//               {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
//                 <button type="button" onClick={clearAllFilters} className="mt-2 text-xs text-[#3A7AFE] font-medium hover:underline">
//                   Clear filters
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Rows */}
//           <div className="divide-y divide-gray-50" role="list">
//             {filtered.map((customer) => {
//               const svc    = customer.service ?? ""
//               const status = STATUS_CONFIG[customer.status ?? "active"] ?? STATUS_CONFIG.active

//               return (
//                 <div
//                   key={customer.id}
//                   role="listitem"
//                   tabIndex={0}
//                   className="group cursor-pointer transition-colors hover:bg-gray-50/70 focus:outline-none focus:bg-blue-50/30"
//                   onClick={() => handleViewDetails(customer)}
//                   onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleViewDetails(customer) }}
//                 >
//                   {/* ── Desktop row ──────────────────────────────────────── */}
//                   <div className="hidden md:grid md:grid-cols-[2fr_1.1fr_1.3fr_0.9fr_90px_1fr_1.2fr_100px] gap-3 items-center px-5 py-3.5">

//                     {/* Col 1: Avatar + Name + company */}
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
//                         {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate leading-tight">{customer.name || "Unnamed"}</p>
//                         <p className="text-xs text-gray-400 truncate mt-0.5">{customer.company || displayEmail(customer.email) || "—"}</p>
//                       </div>
//                     </div>

//                     {/* Col 2: Phone */}
//                     <div className="flex items-center gap-1.5 min-w-0">
//                       <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
//                       <span className="text-sm text-gray-700 font-medium truncate">{customer.phone || "—"}</span>
//                     </div>

//                     {/* Col 3: Service */}
//                     <div className="min-w-0">
//                       {svc ? (
//                         <span className="text-xs text-violet-700 font-medium bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg truncate block w-fit max-w-full">
//                           {SERVICE_LABELS[svc] ?? svc}
//                         </span>
//                       ) : (
//                         <span className="text-xs text-gray-300">—</span>
//                       )}
//                     </div>

//                     {/* Col 4: Assigned User */}
//                     <div className="min-w-0">
//                       {customer.assignedUser ? (
//                         <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5 min-w-0">
//                           <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
//                             {customer.assignedUser.charAt(0).toUpperCase()}
//                           </span>
//                           <span className="truncate">{customer.assignedUser}</span>
//                         </span>
//                       ) : (
//                         <span className="text-xs text-gray-300">—</span>
//                       )}
//                     </div>

//                     {/* Col 5: Status */}
//                     <div>
//                       <Badge className={`${status.cls} border text-xs font-medium px-2 py-0.5 whitespace-nowrap`}>
//                         {status.label}
//                       </Badge>
//                     </div>

//                     {/* Col 6: Closure Date */}
//                     <div onClick={(e) => e.stopPropagation()}>
//                       {customer.closureDate ? (
//                         <span className="text-xs text-gray-600 font-medium">{formatDate(customer.closureDate)}</span>
//                       ) : (
//                         <span className="text-xs text-gray-300">—</span>
//                       )}
//                     </div>

//                     {/* Col 7: Deal Value — pencil popover */}
//                     <div>
//                       <DealValueCell customer={customer} onSave={handleDealValueSave} />
//                     </div>

//                     {/* Col 8: Actions */}
//                     <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.phone}
//                         onClick={() => handleCall(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400"
//                         title="Call client"
//                       >
//                         <Phone className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button
//                         variant="ghost" size="sm"
//                         disabled={!customer.whatsappNumber && !customer.phone}
//                         onClick={() => handleWhatsApp(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400"
//                         title="WhatsApp client"
//                       >
//                         <MessageCircle className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button
//                         variant="ghost" size="sm"
//                         onClick={() => handleViewDetails(customer)}
//                         className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
//                         title="View profile"
//                       >
//                         <Eye className="h-3.5 w-3.5" />
//                       </Button>

//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant="ghost" size="sm"
//                             className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
//                             disabled={isDeleting === customer.id || isBackToLead === customer.id}
//                           >
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
//                           <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
//                             <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" /> Edit Client
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onSelect={() => handleBackToLead(customer)}
//                             disabled={isBackToLead === customer.id}
//                             className="text-sm rounded-lg"
//                           >
//                             <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" />
//                             {isBackToLead === customer.id ? "Moving…" : "Back to Lead"}
//                           </DropdownMenuItem>
//                           {isAdmin && (
//                             <>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem
//                                 onSelect={() => handleDelete(customer)}
//                                 className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
//                                 disabled={isDeleting === customer.id}
//                               >
//                                 <Trash2 className="mr-2 h-3.5 w-3.5" />
//                                 {isDeleting === customer.id ? "Deleting…" : "Delete"}
//                               </DropdownMenuItem>
//                             </>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>

//                   {/* ── Mobile card row ───────────────────────────────────── */}
//                   <div className="md:hidden px-4 py-4 flex items-start gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
//                       {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
//                     </div>

//                     <div className="flex-1 min-w-0 space-y-1">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <p className="text-sm font-semibold text-gray-900 truncate">{customer.name || "Unnamed"}</p>
//                         <Badge className={`${status.cls} border text-[10px] font-medium px-1.5 py-0 shrink-0`}>
//                           {status.label}
//                         </Badge>
//                       </div>
//                       {customer.company && (
//                         <p className="text-xs text-gray-500 flex items-center gap-1">
//                           <Building2 className="h-3 w-3 text-gray-300" />{customer.company}
//                         </p>
//                       )}
//                       <p className="text-xs text-gray-500 flex items-center gap-1">
//                         <Phone className="h-3 w-3 text-gray-300" />{customer.phone || "—"}
//                       </p>
//                       {svc && <p className="text-xs text-violet-600 font-medium">{SERVICE_LABELS[svc] ?? svc}</p>}
//                       {customer.assignedUser && <p className="text-xs text-gray-400">User: {customer.assignedUser}</p>}
//                       {customer.closureDate  && <p className="text-xs text-gray-400">Closes: {formatDate(customer.closureDate)}</p>}
//                       {customer.dealValue != null && (
//                         <p className="text-xs text-gray-700 font-medium">Deal: {formatCurrency(customer.dealValue)}</p>
//                       )}
//                       <p className="text-xs text-gray-400">Onboarded {formatDate(customer.createdAt)}</p>
//                     </div>

//                     <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
//                       <Button variant="ghost" size="sm" disabled={!customer.phone} onClick={() => handleCall(customer)} className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400">
//                         <Phone className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button variant="ghost" size="sm" disabled={!customer.whatsappNumber && !customer.phone} onClick={() => handleWhatsApp(customer)} className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400">
//                         <MessageCircle className="h-3.5 w-3.5" />
//                       </Button>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
//                           <DropdownMenuItem onSelect={() => handleViewDetails(customer)} className="text-sm rounded-lg">
//                             <Eye className="mr-2 h-3.5 w-3.5 text-gray-400" /> View Profile
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
//                             <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" /> Edit Client
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onSelect={() => handleBackToLead(customer)} className="text-sm rounded-lg">
//                             <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" /> Back to Lead
//                           </DropdownMenuItem>
//                           {isAdmin && (
//                             <>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
//                                 <Trash2 className="mr-2 h-3.5 w-3.5" />
//                                 {isDeleting === customer.id ? "Deleting…" : "Delete"}
//                               </DropdownMenuItem>
//                             </>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           {/* Footer */}
//           {filtered.length > 0 && (
//             <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
//               <p className="text-xs text-gray-400">
//                 Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of <span className="font-semibold text-gray-600">{customers.length}</span> clients
//               </p>
//               <button type="button" onClick={handleExport} className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-[#3A7AFE] font-medium transition-colors">
//                 <Download className="h-3.5 w-3.5" />
//                 Export {filtered.length !== customers.length ? "filtered" : "all"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Dialogs ───────────────────────────────────────────────────────── */}
//       <CustomerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} customer={null} mode="add" onSaved={() => handleDialogSaved(false)} />
//       <CustomerDialog
//         open={isEditDialogOpen}
//         onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setSelectedCustomer(null) }}
//         customer={selectedCustomer} mode="edit" onSaved={() => handleDialogSaved(true)}
//       />
//       <CustomerDetailDialog
//         open={isDetailDialogOpen}
//         onOpenChange={(open) => { setIsDetailDialogOpen(open); if (!open) setSelectedCustomer(null) }}
//         customer={selectedCustomer}
//         onCallCustomer={handleCall}
//         onWhatsAppCustomer={handleWhatsApp}
//         onEditCustomer={handleEdit}
//         onScheduleMeeting={(c) => showToast(`Meeting scheduling coming soon for ${c.name}.`)}
//       />

//       {/* ── Confirm AlertDialog ────────────────────────────────────────── */}
//       <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((prev) => ({ ...prev, open }))}>
//         <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl max-w-sm">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-base font-semibold text-gray-900">{confirm.title}</AlertDialogTitle>
//             <AlertDialogDescription className="text-sm text-gray-500">{confirm.message}</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 text-sm">Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={confirm.onConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm">Confirm</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
//     </div>
//   )
// }


//testing 2(26-05-2026)

"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { useCRM } from "@/contexts/crm-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CustomerDialog }       from "./customer-dialog"
import { CustomerDetailDialog } from "./customer-detail-dialog"
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  Phone, MessageCircle, Undo2, Building2, CheckCircle2,
  XCircle, Download, Filter, Pencil, Check, X, Calendar,
  Users, TrendingUp, UserCheck, UserX,
} from "lucide-react"
import type { Customer } from "@/types/crm"

// ─── Constants ────────────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<string, string> = {
  "whatsapp-api":    "WhatsApp API",
  "web-development": "Web Development",
  "seo":             "SEO / Marketing",
  "social-media":    "Social Media",
  "crm-development": "CRM Development",
  "app-development": "App Development",
  "cloud-hosting":   "Cloud & Hosting",
  "it-support":      "IT Support",
  "other":           "Other",
}

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  "startup":    "Startup",
  "sme":        "SME",
  "enterprise": "Enterprise",
  "agency":     "Agency",
  "ecommerce":  "E-commerce",
  "ngo":        "NGO / Non-Profit",
  "individual": "Individual / Freelancer",
  "other":      "Other",
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
  active:   { label: "Active",   dot: "bg-emerald-400", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", dot: "bg-gray-300",    cls: "bg-gray-50    text-gray-500    border-gray-200"   },
  prospect: { label: "Prospect", dot: "bg-blue-400",    cls: "bg-blue-50    text-blue-700    border-blue-200"   },
}

const STATUS_FILTERS = [
  { value: "all",      label: "All"      },
  { value: "active",   label: "Active"   },
  { value: "prospect", label: "Prospect" },
  { value: "inactive", label: "Inactive" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (v: unknown): string => {
  if (!v) return "—"
  const d = v instanceof Date ? v : new Date(v as string)
  return isNaN(d.getTime()) ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export const displayEmail = (email: string | undefined): string | null => {
  if (!email) return null
  const syntheticDomains = ["@manual.", "@booking.", "@whatsapp."]
  return syntheticDomains.some((d) => email.includes(d)) ? null : email
}

const formatCurrency = (v: unknown): string => {
  if (v == null || v === "") return "—"
  const n = Number(v)
  if (isNaN(n)) return "—"
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
  return `₹${n.toLocaleString("en-IN")}`
}

// ─── CSV export ───────────────────────────────────────────────────────────────

const exportToCSV = (customers: Customer[]) => {
  const headers = [
    "Name","Company","Phone","Email","Service","Business Type",
    "Status","Assigned User","Deal Value (₹)","Total Value (₹)",
    "Closure Date","Onboarding Date","City","State",
  ]
  const rows = customers.map((c) => [
    c.name ?? "", c.company ?? "", c.phone ?? "",
    displayEmail(c.email) ?? "",
    SERVICE_LABELS[c.service ?? ""] ?? c.service ?? "",
    BUSINESS_TYPE_LABELS[(c as any).businessType ?? ""] ?? (c as any).businessType ?? "",
    c.status ?? "", (c as any).assignedUser ?? "",
    (c as any).dealValue ?? "", c.totalValue ?? 0,
    (c as any).closureDate ? formatDate((c as any).closureDate) : "",
    (c as any).onboardingDate ? formatDate((c as any).onboardingDate) : formatDate(c.createdAt),
    c.city ?? "", c.state ?? "",
  ])
  const escape = (val: unknown) => {
    const s = String(val ?? "")
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv  = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = { message: string; type: "success" | "error" }

function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-3 ${
      toast.type === "success"
        ? "bg-white border-emerald-100 text-emerald-700"
        : "bg-white border-red-100 text-red-600"
    }`}>
      {toast.type === "success"
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
      {toast.message}
      <button onClick={onDismiss} className="ml-1 text-gray-300 hover:text-gray-500 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── UserCell ─────────────────────────────────────────────────────────────────
// FIX #1: Click the avatar/name OR the pencil to edit inline.
// Shows a text input with autocomplete from CRM users. Saves on Enter/blur/✓.

interface UserCellProps {
  customer: Customer
  crmUsers: { id: string; name: string }[]
  onSave:   (id: string, value: string) => Promise<void>
}

function UserCell({ customer, crmUsers, onSave }: UserCellProps) {
  const currentUser = (customer as any).assignedUser as string | null
  const [editing, setEditing]     = useState(false)
  const [value,   setValue]       = useState(currentUser ?? "")
  const [saving,  setSaving]      = useState(false)
  const [showDrop, setShowDrop]   = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const wrapRef                   = useRef<HTMLDivElement>(null)

  // Keep local value in sync when customer prop changes (after save)
  useEffect(() => {
    if (!editing) setValue((customer as any).assignedUser ?? "")
  }, [(customer as any).assignedUser, editing])

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue((customer as any).assignedUser ?? "")
    setEditing(true)
    setShowDrop(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 20)
  }

  const cancel = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditing(false)
    setShowDrop(false)
    setValue((customer as any).assignedUser ?? "")
  }

  const save = async (val?: string) => {
    const finalVal = (val ?? value).trim()
    setSaving(true)
    await onSave(customer.id, finalVal)
    setSaving(false)
    setEditing(false)
    setShowDrop(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter")  { save(); }
    if (e.key === "Escape") { cancel(); }
  }

  // Close on outside click
  useEffect(() => {
    if (!editing) return
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        save()  // auto-save on outside click
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [editing, value])

  // Filtered autocomplete list
  const filtered = crmUsers.filter(
    (u) => !value || u.name.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 6)

  if (editing) {
    return (
      <div
        ref={wrapRef}
        className="relative flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setShowDrop(true) }}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="Name or pick below…"
          className="w-28 h-7 text-xs border border-[#3A7AFE] rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-[#3A7AFE]/20 disabled:opacity-50"
        />
        <button
          onClick={() => save()}
          disabled={saving}
          className="h-6 w-6 rounded-lg bg-[#3A7AFE] hover:bg-[#2563EB] text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
          title="Save"
        >
          {saving
            ? <span className="h-2.5 w-2.5 border border-white border-t-transparent rounded-full animate-spin block" />
            : <Check className="h-3 w-3" />}
        </button>
        <button
          onClick={cancel}
          className="h-6 w-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Autocomplete dropdown */}
        {showDrop && filtered.length > 0 && (
          <div className="absolute left-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px] max-h-40 overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setValue(u.name); save(u.name) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-left text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600 shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-700 font-medium truncate">{u.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Display mode — entire cell + pencil are clickable
  return (
    <div
      className="group/user flex items-center gap-1.5 cursor-pointer min-w-0"
      onClick={startEdit}
      title="Click to assign user"
    >
      {currentUser ? (
        <>
          <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600 shrink-0">
            {currentUser.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-700 font-medium truncate">{currentUser}</span>
        </>
      ) : (
        <span className="text-xs text-gray-300 italic">Assign…</span>
      )}
      <Pencil className="h-2.5 w-2.5 text-gray-300 opacity-0 group-hover/user:opacity-100 transition-opacity shrink-0 ml-0.5" />
    </div>
  )
}

// ─── Deal Value Popover Cell ──────────────────────────────────────────────────
// FIX #3: pencil → popover. Uses customer.dealValue (which is now correctly
//         mapped from deal_value DB column via normalizeCustomer).

interface DealValueCellProps {
  customer: Customer
  onSave:   (id: string, value: number | null) => Promise<void>
}

function DealValueCell({ customer, onSave }: DealValueCellProps) {
  const dealValue = (customer as any).dealValue as number | null | undefined
  const [open,   setOpen]   = useState(false)
  const [value,  setValue]  = useState("")
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState("")
  const inputRef            = useRef<HTMLInputElement>(null)
  const wrapRef             = useRef<HTMLDivElement>(null)

  const openPopover = (e: React.MouseEvent) => {
    e.stopPropagation()
    setErr("")
    setValue(dealValue != null ? String(dealValue) : "")
    setOpen(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 30)
  }

  const cancel = (e?: React.MouseEvent) => { e?.stopPropagation(); setOpen(false) }

  const save = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setErr("")
    if (value.trim() === "") {
      // Allow clearing
      setSaving(true); await onSave(customer.id, null); setSaving(false); setOpen(false); return
    }
    const n = Number(value)
    if (isNaN(n) || n < 0) { setErr("Enter a valid amount"); return }
    setSaving(true); await onSave(customer.id, n); setSaving(false); setOpen(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter")  save()
    if (e.key === "Escape") cancel()
  }

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className={`text-sm font-semibold tabular-nums ${dealValue != null ? "text-gray-800" : "text-gray-300"}`}>
        {dealValue != null ? formatCurrency(dealValue) : "—"}
      </span>
      <button
        type="button" onClick={openPopover} title="Edit deal value"
        className="h-5 w-5 rounded-md flex items-center justify-center text-gray-300 hover:text-[#3A7AFE] hover:bg-blue-50 transition-colors"
      >
        <Pencil className="h-3 w-3" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-8 z-40 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-2 min-w-[190px]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Deal Value</p>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">₹</span>
              <input
                ref={inputRef}
                type="number" min="0"
                value={value}
                onChange={(e) => { setValue(e.target.value); setErr("") }}
                onKeyDown={handleKey}
                disabled={saving}
                placeholder="0"
                className="w-full h-8 pl-6 pr-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#3A7AFE] focus:ring-2 focus:ring-[#3A7AFE]/10 disabled:opacity-50"
              />
            </div>
            <button
              onClick={save} disabled={saving}
              className="h-8 w-8 rounded-xl bg-[#3A7AFE] hover:bg-[#2563EB] text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
            >
              {saving
                ? <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                : <Check className="h-3.5 w-3.5" />}
            </button>
            <button onClick={cancel} className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {err && <p className="text-[11px] text-red-500">{err}</p>}
          <p className="text-[10px] text-gray-400">Leave blank to clear. Enter to save.</p>
        </div>
      )}
    </div>
  )
}

// ─── Closure Date Cell ────────────────────────────────────────────────────────
// FIX #2: native date picker. Uses customer.closureDate (now correctly mapped
//         from closure_date DB column via normalizeCustomer).

interface ClosureDateCellProps {
  customer: Customer
  onSave:   (id: string, date: string | null) => Promise<void>
}

function ClosureDateCell({ customer, onSave }: ClosureDateCellProps) {
  const closureDate = (customer as any).closureDate as string | null | undefined
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSaving(true)
    await onSave(customer.id, e.target.value || null)
    setSaving(false)
  }

  const triggerPicker = (e: React.MouseEvent) => {
    e.stopPropagation()
    inputRef.current?.showPicker?.()
    inputRef.current?.click()
  }

  // Normalise to YYYY-MM-DD for the input value attribute
  const rawDate = closureDate
    ? (typeof closureDate === "string"
        ? closureDate.slice(0, 10)
        : new Date(closureDate as any).toISOString().slice(0, 10))
    : ""

  return (
    <div className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* Hidden native date input — triggered by the calendar button */}
      <input
        ref={inputRef}
        type="date"
        value={rawDate}
        onChange={handleChange}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
      />
      {rawDate ? (
        <span
          className="text-xs font-medium text-gray-700 cursor-pointer hover:text-[#3A7AFE] transition-colors"
          onClick={triggerPicker}
          title="Click to change date"
        >
          {formatDate(closureDate)}
        </span>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
      <button
        type="button" onClick={triggerPicker} disabled={saving}
        title="Set closure date"
        className="h-5 w-5 rounded-md flex items-center justify-center text-gray-300 hover:text-[#3A7AFE] hover:bg-blue-50 transition-colors disabled:opacity-40"
      >
        {saving
          ? <span className="h-3 w-3 border-2 border-blue-300 border-t-[#3A7AFE] rounded-full animate-spin block" />
          : <Calendar className="h-3 w-3" />}
      </button>
    </div>
  )
}

// ─── Confirm state type ───────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean; title: string; message: string; onConfirm: () => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomersContent() {
  const { customers, deleteCustomer, moveCustomerToLead, updateCustomer, users } = useCRM()
  const { isAdmin } = useAuth()

  const [searchTerm,         setSearchTerm]         = useState("")
  const [statusFilter,       setStatusFilter]       = useState("all")
  const [serviceFilter,      setServiceFilter]      = useState("all")
  const [selectedCustomer,   setSelectedCustomer]   = useState<Customer | null>(null)
  const [isAddDialogOpen,    setIsAddDialogOpen]    = useState(false)
  const [isEditDialogOpen,   setIsEditDialogOpen]   = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleting,         setIsDeleting]         = useState<string | null>(null)
  const [isBackToLead,       setIsBackToLead]       = useState<string | null>(null)
  const [toast,              setToast]              = useState<ToastType | null>(null)
  const [confirm,            setConfirm]            = useState<ConfirmState>({
    open: false, title: "", message: "", onConfirm: () => {},
  })

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active   = customers.filter((c) => c.status === "active").length
    const prospect = customers.filter((c) => c.status === "prospect").length
    const inactive = customers.filter((c) => c.status === "inactive").length
    const totalDeal = customers.reduce((s, c) => s + (Number((c as any).dealValue) || 0), 0)
    return { active, prospect, inactive, totalDeal }
  }, [customers])

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return customers.filter((c) => {
      const matchSearch = !term ||
        [c.name, c.phone, c.company ?? "", c.city ?? "", c.service ?? ""]
          .some((v) => (v ?? "").toLowerCase().includes(term))
      const matchStatus  = statusFilter  === "all" || c.status  === statusFilter
      const matchService = serviceFilter === "all" || c.service === serviceFilter
      return matchSearch && matchStatus && matchService
    })
  }, [customers, searchTerm, statusFilter, serviceFilter])

  const counts = useMemo(() => ({
    all: customers.length, active: stats.active, prospect: stats.prospect, inactive: stats.inactive,
  }), [customers.length, stats])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openConfirm = (title: string, message: string, onConfirm: () => void) =>
    setConfirm({ open: true, title, message, onConfirm })

  const handleDelete = useCallback((customer: Customer) => {
    openConfirm(
      "Delete client?",
      `"${customer.name}" will be permanently removed. This cannot be undone.`,
      async () => {
        setIsDeleting(customer.id)
        try {
          const ok = await deleteCustomer(customer.id)
          showToast(ok ? "Client deleted." : "Failed to delete client.", ok ? "success" : "error")
        } catch { showToast("An error occurred.", "error") }
        finally  { setIsDeleting(null) }
      }
    )
  }, [deleteCustomer, showToast])

  const handleBackToLead = useCallback((customer: Customer) => {
    openConfirm(
      "Move back to Leads?",
      `"${customer.name}" will be moved from Clients back to Leads.`,
      async () => {
        setIsBackToLead(customer.id)
        try {
          const ok = await moveCustomerToLead(customer.id)
          showToast(ok ? `${customer.name} moved back to Leads.` : "Failed to move client.", ok ? "success" : "error")
        } catch { showToast("An error occurred.", "error") }
        finally  { setIsBackToLead(null) }
      }
    )
  }, [moveCustomerToLead, showToast])

  const handleCall = useCallback((customer: Customer) => {
    if (!customer.phone) { showToast("No phone number available.", "error"); return }
    window.open(`tel:${customer.phone}`, "_self")
  }, [showToast])

  const handleWhatsApp = useCallback((customer: Customer) => {
    const number = (customer as any).whatsappNumber || customer.phone
    if (!number) { showToast("No WhatsApp number available.", "error"); return }
    const clean   = number.replace(/\D/g, "")
    const message = encodeURIComponent("Hi, following up regarding your project with Vasifytech.")
    window.open(`https://wa.me/${clean}?text=${message}`, "_blank", "noopener,noreferrer")
  }, [showToast])

  const handleViewDetails = useCallback((c: Customer) => { setSelectedCustomer(c); setIsDetailDialogOpen(true) }, [])
  const handleEdit        = useCallback((c: Customer) => { setSelectedCustomer(c); setIsEditDialogOpen(true)  }, [])
  const handleDialogSaved = useCallback((isEdit: boolean) => showToast(isEdit ? "Client updated." : "Client added."), [showToast])

  // ── FIX #1: User save ─────────────────────────────────────────────────────
  // Sends assignedUser → backend PUT /customers/:id which maps to sales_rep column
  const handleUserSave = useCallback(async (id: string, value: string) => {
    try {
      const ok = await updateCustomer(id, { assignedUser: value } as any)
      showToast(ok ? "User assigned." : "Failed to assign user.", ok ? "success" : "error")
    } catch (e: any) {
      showToast(e?.message || "Error assigning user.", "error")
    }
  }, [updateCustomer, showToast])

  // ── FIX #3: Deal value save ────────────────────────────────────────────────
  const handleDealValueSave = useCallback(async (id: string, value: number | null) => {
    try {
      const ok = await updateCustomer(id, { dealValue: value } as any)
      showToast(ok ? "Deal value saved." : "Failed to save.", ok ? "success" : "error")
    } catch (e: any) {
      if (e?.message?.includes("Unknown column")) {
        showToast("Run migration.sql first — DB column missing.", "error")
      } else {
        showToast(e?.message || "Error saving deal value.", "error")
      }
    }
  }, [updateCustomer, showToast])

  // ── FIX #2: Closure date save ──────────────────────────────────────────────
  const handleClosureDateSave = useCallback(async (id: string, date: string | null) => {
    try {
      const ok = await updateCustomer(id, { closureDate: date } as any)
      showToast(ok ? "Closure date saved." : "Failed to save date.", ok ? "success" : "error")
    } catch (e: any) {
      if (e?.message?.includes("Unknown column")) {
        showToast("Run migration.sql first — DB column missing.", "error")
      } else {
        showToast(e?.message || "Error saving date.", "error")
      }
    }
  }, [updateCustomer, showToast])

  const handleExport = useCallback(() => {
    if (!filtered.length) { showToast("No clients to export.", "error"); return }
    exportToCSV(filtered)
    showToast(`Exported ${filtered.length} client${filtered.length !== 1 ? "s" : ""}.`)
  }, [filtered, showToast])

  const clearAllFilters = () => { setSearchTerm(""); setStatusFilter("all"); setServiceFilter("all") }
  const hasFilters = searchTerm || statusFilter !== "all" || serviceFilter !== "all"

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Client Directory</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {customers.length} client{customers.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={handleExport}
              className="rounded-xl border-gray-200 text-gray-600 text-sm font-medium h-9 px-3.5 gap-1.5 hidden sm:flex hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#3A7AFE] hover:bg-[#2563EB] text-white rounded-xl px-4 h-9 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Clients" value={customers.length} sub={`${filtered.length} visible`} icon={Users} color="bg-blue-50 text-blue-600" />
          <StatCard label="Active" value={stats.active} sub={`${Math.round((stats.active / (customers.length || 1)) * 100)}% of total`} icon={UserCheck} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Prospects" value={stats.prospect} sub={`${stats.inactive} inactive`} icon={UserX} color="bg-amber-50 text-amber-600" />
          <StatCard
            label="Total Deal Value"
            value={stats.totalDeal > 0 ? formatCurrency(stats.totalDeal) : "₹0"}
            sub="across all clients"
            icon={TrendingUp}
            color="bg-violet-50 text-violet-600"
          />
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-350 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Search name, phone, company…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-xl border border-gray-200 focus:border-[#3A7AFE] bg-gray-50 text-sm"
              />
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 shrink-0">
              {STATUS_FILTERS.map((f) => (
                <button key={f.value} type="button" onClick={() => setStatusFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === f.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}>
                  {f.label}
                  <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                    statusFilter === f.value ? "bg-[#3A7AFE]/10 text-[#3A7AFE]" : "bg-gray-200 text-gray-500"
                  }`}>
                    {counts[f.value as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
            <div className="ml-auto text-xs text-gray-400 font-medium hidden sm:block shrink-0">
              {filtered.length} of {customers.length} clients
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Service:</span>
            </div>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}
              className="h-8 rounded-xl border border-gray-200 text-xs px-2.5 bg-gray-50 text-gray-700 focus:border-[#3A7AFE] focus:outline-none">
              <option value="all">All Services</option>
              {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {serviceFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {SERVICE_LABELS[serviceFilter] ?? serviceFilter}
                <button type="button" onClick={() => setServiceFilter("all")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {hasFilters && (
              <button type="button" onClick={clearAllFilters} className="text-xs text-[#3A7AFE] font-semibold hover:underline ml-auto">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header: Client | Phone | Service | User (editable) | Status | Closure Date | Deal Value | Actions */}
          <div className="hidden lg:grid lg:grid-cols-[2.2fr_1fr_1.2fr_1fr_80px_1.1fr_1.1fr_90px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
            {["Client / Company","Phone","Service","User","Status","Closure Date","Deal Value","Actions"].map((h, i) => (
              <div key={h} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider ${i === 7 ? "text-right" : ""}`}>
                {h}
                {h === "User" && <span className="ml-1 text-gray-300 font-normal normal-case">(click to edit)</span>}
                {h === "Deal Value" && <span className="ml-1 text-gray-300 font-normal normal-case">(✎ to edit)</span>}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 border border-gray-100">
                <Building2 className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                {hasFilters ? "No clients match your filters" : "No clients yet"}
              </p>
              {hasFilters
                ? <button type="button" onClick={clearAllFilters} className="text-xs text-[#3A7AFE] font-semibold hover:underline mt-1">Clear filters</button>
                : <p className="text-xs text-gray-400">Add your first client to get started.</p>
              }
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-gray-50/80" role="list">
            {filtered.map((customer) => {
              const svc    = customer.service ?? ""
              const status = STATUS_CONFIG[customer.status ?? "active"] ?? STATUS_CONFIG.active

              return (
                <div
                  key={customer.id}
                  role="listitem"
                  tabIndex={0}
                  className="group cursor-pointer transition-all duration-150 hover:bg-blue-50/30 focus:outline-none focus:bg-blue-50/40"
                  onClick={() => handleViewDetails(customer)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleViewDetails(customer) }}
                >
                  {/* ── Desktop row ──────────────────────────────────────── */}
                  <div className="hidden lg:grid lg:grid-cols-[2.2fr_1fr_1.2fr_1fr_80px_1.1fr_1.1fr_90px] gap-4 items-center px-6 py-4">

                    {/* Col 1: Name + company */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-sm text-[#3A7AFE]">
                        {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{customer.name || "Unnamed"}</p>
                        <p className="text-xs text-gray-400 truncate">{customer.company || displayEmail(customer.email) || "—"}</p>
                      </div>
                    </div>

                    {/* Col 2: Phone */}
                    <div className="min-w-0">
                      <span className="text-sm text-gray-700 font-medium truncate block">{customer.phone || "—"}</span>
                    </div>

                    {/* Col 3: Service */}
                    <div className="min-w-0">
                      {svc ? (
                        <span className="inline-block text-xs text-violet-700 font-semibold bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg truncate max-w-full">
                          {SERVICE_LABELS[svc] ?? svc}
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </div>

                    {/* Col 4: User — FIX #1: fully clickable editable cell */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <UserCell
                        customer={customer}
                        crmUsers={users}
                        onSave={handleUserSave}
                      />
                    </div>

                    {/* Col 5: Status */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2 py-0.5 rounded-full ${status.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Col 6: Closure Date — FIX #2 */}
                    <div>
                      <ClosureDateCell customer={customer} onSave={handleClosureDateSave} />
                    </div>

                    {/* Col 7: Deal Value — FIX #3 */}
                    <div>
                      <DealValueCell customer={customer} onSave={handleDealValueSave} />
                    </div>

                    {/* Col 8: Actions */}
                    <div className="flex items-center gap-0.5 justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" disabled={!customer.phone} onClick={() => handleCall(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-300 transition-colors" title="Call">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={!customer.whatsappNumber && !customer.phone} onClick={() => handleWhatsApp(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-300 transition-colors" title="WhatsApp">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-300 transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"
                            className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-300 transition-colors"
                            disabled={isDeleting === customer.id || isBackToLead === customer.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-xl p-1">
                          <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg gap-2">
                            <Edit className="h-3.5 w-3.5 text-gray-400" /> Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleBackToLead(customer)} disabled={isBackToLead === customer.id} className="text-sm rounded-lg gap-2">
                            <Undo2 className="h-3.5 w-3.5 text-amber-500" />
                            {isBackToLead === customer.id ? "Moving…" : "Back to Lead"}
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem onSelect={() => handleDelete(customer)} disabled={isDeleting === customer.id}
                                className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg gap-2">
                                <Trash2 className="h-3.5 w-3.5" />
                                {isDeleting === customer.id ? "Deleting…" : "Delete"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Mobile card ──────────────────────────────────────── */}
                  <div className="lg:hidden px-4 py-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-sm text-[#3A7AFE]">
                      {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{customer.name || "Unnamed"}</p>
                          {customer.company && <p className="text-xs text-gray-400 truncate">{customer.company}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-300" />{customer.phone || "—"}
                        </span>
                        {svc && (
                          <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-1.5 py-0.5 rounded-md">
                            {SERVICE_LABELS[svc] ?? svc}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
                        {(customer as any).assignedUser && <span>👤 {(customer as any).assignedUser}</span>}
                        {(customer as any).closureDate   && <span>📅 {formatDate((customer as any).closureDate)}</span>}
                        {(customer as any).dealValue != null && (
                          <span className="font-semibold text-gray-700">{formatCurrency((customer as any).dealValue)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => handleCall(customer)} disabled={!customer.phone}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-300">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleWhatsApp(customer)} disabled={!(customer as any).whatsappNumber && !customer.phone}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-300">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-300">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-xl p-1">
                          <DropdownMenuItem onSelect={() => handleViewDetails(customer)} className="text-sm rounded-lg gap-2">
                            <Eye className="h-3.5 w-3.5 text-gray-400" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg gap-2">
                            <Edit className="h-3.5 w-3.5 text-gray-400" /> Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleBackToLead(customer)} className="text-sm rounded-lg gap-2">
                            <Undo2 className="h-3.5 w-3.5 text-amber-500" /> Back to Lead
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg gap-2">
                                <Trash2 className="h-3.5 w-3.5" />
                                {isDeleting === customer.id ? "Deleting…" : "Delete"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-600">{filtered.length}</span> of <span className="font-bold text-gray-600">{customers.length}</span> clients
              </p>
              <button type="button" onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#3A7AFE] font-semibold transition-colors">
                <Download className="h-3.5 w-3.5" />
                Export {filtered.length !== customers.length ? "filtered" : "all"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <CustomerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} customer={null} mode="add" onSaved={() => handleDialogSaved(false)} />
      <CustomerDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setSelectedCustomer(null) }}
        customer={selectedCustomer} mode="edit" onSaved={() => handleDialogSaved(true)}
      />
      <CustomerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => { setIsDetailDialogOpen(open); if (!open) setSelectedCustomer(null) }}
        customer={selectedCustomer}
        onCallCustomer={handleCall}
        onWhatsAppCustomer={handleWhatsApp}
        onEditCustomer={handleEdit}
        onScheduleMeeting={(c) => showToast(`Meeting scheduling coming soon for ${c.name}.`)}
      />

      {/* ── Confirm dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((p) => ({ ...p, open }))}>
        <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-gray-900">{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">{confirm.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 text-sm font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm.onConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}