"use client"

import { useMemo, useState, useCallback } from "react"
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
  XCircle, Download, Filter, AlertTriangle, Clock,
} from "lucide-react"
import type { Customer } from "@/types/crm"

// ─── Constants ────────────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<string, string> = {
  "whatsapp-api":    "WhatsApp API Retainer",
  "web-development": "Web Development",
  "seo":             "SEO / Digital Marketing",
  "social-media":    "Social Media Management",
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

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", cls: "bg-gray-50    text-gray-500    border-gray-200"   },
  prospect: { label: "Prospect", cls: "bg-blue-50    text-blue-700    border-blue-200"   },
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
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export const displayEmail = (email: string | undefined): string | null => {
  if (!email) return null
  const syntheticDomains = ["@manual.", "@booking.", "@whatsapp."]
  return syntheticDomains.some((d) => email.includes(d)) ? null : email
}

// ─── [NEW #2] Renewal badge helper ────────────────────────────────────────────

type RenewalBadge = { label: string; cls: string; icon: "expired" | "soon" } | null

const getRenewalBadge = (customer: Customer): RenewalBadge => {
  if (!customer.recurringEnabled || !customer.renewalDate) return null
  const days = Math.ceil(
    (new Date(customer.renewalDate as string).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  )
  if (days < 0)   return { label: "Expired",           cls: "bg-red-100 text-red-700 border-red-200",      icon: "expired" }
  if (days === 0) return { label: "Expires today",      cls: "bg-red-100 text-red-700 border-red-200",      icon: "expired" }
  if (days <= 7)  return { label: `Renews in ${days}d`, cls: "bg-amber-100 text-amber-700 border-amber-200", icon: "soon"    }
  if (days <= 30) return { label: `Renews in ${days}d`, cls: "bg-blue-50 text-blue-600 border-blue-200",    icon: "soon"    }
  return null
}

// ─── [NEW #4] CSV export ───────────────────────────────────────────────────────

const exportToCSV = (customers: Customer[]) => {
  const headers = [
    "Name", "Company", "Phone", "Email", "Service", "Business Type",
    "Status", "Sales Rep", "Total Value (₹)", "Recurring",
    "Retainer Amount (₹)", "Renewal Date", "Onboarding Date", "City", "State",
  ]
  const rows = customers.map((c) => [
    c.name ?? "",
    c.company ?? "",
    c.phone ?? "",
    displayEmail(c.email) ?? "",
    SERVICE_LABELS[c.service ?? ""] ?? c.service ?? "",
    BUSINESS_TYPE_LABELS[c.businessType ?? ""] ?? c.businessType ?? "",
    c.status ?? "",
    c.salesRep ?? "",
    c.totalValue ?? 0,
    c.recurringEnabled ? "Yes" : "No",
    c.recurringAmount ?? "",
    c.renewalDate ? formatDate(c.renewalDate) : "",
    c.onboardingDate ? formatDate(c.onboardingDate) : formatDate(c.createdAt),
    c.city ?? "",
    c.state ?? "",
  ])
  const escape = (val: unknown) => {
    const s = String(val ?? "")
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv  = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href     = url
  link.download = `vasifytech-clients-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = { message: string; type: "success" | "error" }

function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
      toast.type === "success"
        ? "bg-white border-emerald-200 text-emerald-700"
        : "bg-white border-red-200 text-red-700"
    }`}>
      {toast.type === "success"
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 text-gray-400 hover:text-gray-600 text-xs" aria-label="Dismiss">✕</button>
    </div>
  )
}

// ─── Confirm state type ───────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean; title: string; message: string; onConfirm: () => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomersContent() {
  const { customers, deleteCustomer, moveCustomerToLead } = useCRM()
  const { isAdmin } = useAuth()                                    // [NEW #3] RBAC

  const [searchTerm,         setSearchTerm]         = useState("")
  const [statusFilter,       setStatusFilter]       = useState("all")
  const [serviceFilter,      setServiceFilter]      = useState("all")   // [NEW #1]
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

  // [NEW #2] Count of expiring/expired retainers for header alert
  const expiringCount = useMemo(
    () => customers.filter((c) => getRenewalBadge(c) !== null).length,
    [customers]
  )

  // ── Filtered list (now includes service filter) ────────────────────────────
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return customers.filter((c) => {
      const matchSearch =
        !term ||
        [c.name, c.phone, c.company ?? "", c.city ?? "", c.service ?? ""]
          .some((v) => (v ?? "").toLowerCase().includes(term))
      const matchStatus  = statusFilter  === "all" || c.status  === statusFilter
      const matchService = serviceFilter === "all" || c.service === serviceFilter  // [NEW #1]
      return matchSearch && matchStatus && matchService
    })
  }, [customers, searchTerm, statusFilter, serviceFilter])

  const counts = useMemo(() => ({
    all:      customers.length,
    active:   customers.filter((c) => c.status === "active").length,
    prospect: customers.filter((c) => c.status === "prospect").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
  }), [customers])

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
          if (ok) showToast("Client deleted.")
          else     showToast("Failed to delete client.", "error")
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
          if (ok) showToast(`${customer.name} moved back to Leads.`)
          else     showToast("Failed to move client.", "error")
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
    const number = customer.whatsappNumber || customer.phone
    if (!number) { showToast("No WhatsApp number available.", "error"); return }
    const clean   = number.replace(/\D/g, "")
    const message = encodeURIComponent("Hi, following up regarding your project with Vasifytech.")
    window.open(`https://wa.me/${clean}?text=${message}`, "_blank", "noopener,noreferrer")
  }, [showToast])

  const handleViewDetails = useCallback((c: Customer) => { setSelectedCustomer(c); setIsDetailDialogOpen(true) }, [])
  const handleEdit        = useCallback((c: Customer) => { setSelectedCustomer(c); setIsEditDialogOpen(true)  }, [])
  const handleDialogSaved = useCallback((isEdit: boolean) => {
    showToast(isEdit ? "Client updated." : "Client added.")
  }, [showToast])

  // [NEW #4] CSV export handler
  const handleExport = useCallback(() => {
    if (!filtered.length) { showToast("No clients to export.", "error"); return }
    exportToCSV(filtered)
    showToast(`Exported ${filtered.length} client${filtered.length !== 1 ? "s" : ""} to CSV.`)
  }, [filtered, showToast])

  const clearAllFilters = () => { setSearchTerm(""); setStatusFilter("all"); setServiceFilter("all") }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Client Directory</h1>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
              {customers.length} client{customers.length !== 1 ? "s" : ""} registered
              {/* [NEW #2] Expiring retainer alert */}
              {expiringCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  {expiringCount} retainer{expiringCount !== 1 ? "s" : ""} expiring
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* [NEW #4] Export CSV button */}
            <Button
              variant="outline"
              onClick={handleExport}
              className="rounded-xl border-gray-200 text-gray-600 text-sm font-medium px-3 h-9 items-center gap-1.5 hidden sm:flex"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#3A7AFE] hover:bg-[#2563EB] text-white rounded-xl px-4 h-9 text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Row 1: Search + Status tabs + result count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Search name, phone, company…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-xl border border-gray-200 focus:border-[#3A7AFE] bg-white text-sm"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    statusFilter === f.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold tabular-nums ${
                    statusFilter === f.value ? "text-[#3A7AFE]" : "text-gray-400"
                  }`}>
                    {counts[f.value as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>

            <div className="ml-auto text-xs text-gray-400 font-medium shrink-0 hidden sm:block">
              {filtered.length} of {customers.length} clients
            </div>
          </div>

          {/* [NEW #1] Row 2: Service filter + active pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Service:</span>
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 text-xs px-2 bg-white text-gray-700 focus:border-[#3A7AFE] focus:outline-none"
            >
              <option value="all">All Services</option>
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {serviceFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {SERVICE_LABELS[serviceFilter] ?? serviceFilter}
                <button
                  type="button"
                  onClick={() => setServiceFilter("all")}
                  className="ml-0.5 hover:text-violet-900"
                  aria-label="Clear service filter"
                >✕</button>
              </span>
            )}

            {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[#3A7AFE] font-medium hover:underline ml-auto"
              >
                Clear all filters
              </button>
            )}

            {/* Mobile export */}
            <button
              type="button"
              onClick={handleExport}
              className="sm:hidden flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 ml-auto"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop header — [NEW] added Sales Rep + Renewal columns */}
          <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1.4fr_1fr_90px_110px_110px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Client / Company</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Phone</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Service</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Sales Rep</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Status</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide">Renewal</div>
            <div className="text-xs font-semibold text-gray-400 tracking-wide text-right">Actions</div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                <Building2 className="h-7 w-7 opacity-40" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
                  ? "No clients match your filters"
                  : "No clients yet"}
              </p>
              {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 text-xs text-[#3A7AFE] font-medium hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-gray-50" role="list">
            {filtered.map((customer) => {
              const svc          = customer.service ?? ""
              const status       = STATUS_CONFIG[customer.status ?? "active"] ?? STATUS_CONFIG.active
              const renewalBadge = getRenewalBadge(customer)   // [NEW #2 + #3]

              return (
                <div
                  key={customer.id}
                  role="listitem"
                  tabIndex={0}
                  className={`group cursor-pointer transition-colors focus:outline-none focus:bg-blue-50/30 ${
                    renewalBadge?.icon === "expired"
                      ? "hover:bg-red-50/40 bg-red-50/20"
                      : renewalBadge?.icon === "soon"
                      ? "hover:bg-amber-50/30 bg-amber-50/10"
                      : "hover:bg-gray-50/70"
                  }`}
                  onClick={() => handleViewDetails(customer)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleViewDetails(customer) }}
                >
                  {/* ── Desktop row ──────────────────────────────────────── */}
                  <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1.4fr_1fr_90px_110px_110px] gap-3 items-center px-5 py-3.5">

                    {/* Col 1: Avatar + Name + company */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
                        {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                          {customer.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {customer.company || displayEmail(customer.email) || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Col 2: Phone */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {customer.phone || "—"}
                      </span>
                    </div>

                    {/* Col 3: Service */}
                    <div className="min-w-0">
                      {svc ? (
                        <span className="text-xs text-violet-700 font-medium bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg truncate block w-fit max-w-full">
                          {SERVICE_LABELS[svc] ?? svc}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    {/* [NEW] Col 4: Sales Rep */}
                    <div className="min-w-0">
                      <span className="text-xs text-gray-600 truncate">
                        {customer.salesRep || <span className="text-gray-300">—</span>}
                      </span>
                    </div>

                    {/* Col 5: Status */}
                    <div>
                      <Badge className={`${status.cls} border text-xs font-medium px-2 py-0.5 whitespace-nowrap`}>
                        {status.label}
                      </Badge>
                    </div>

                    {/* [NEW #2] Col 6: Renewal badge */}
                    <div>
                      {renewalBadge ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.5 rounded-lg whitespace-nowrap ${renewalBadge.cls}`}>
                          {renewalBadge.icon === "expired"
                            ? <AlertTriangle className="h-3 w-3 shrink-0" />
                            : <Clock className="h-3 w-3 shrink-0" />}
                          {renewalBadge.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">
                          {customer.recurringEnabled
                            ? formatDate(customer.renewalDate)
                            : "—"}
                        </span>
                      )}
                    </div>

                    {/* Col 7: Actions */}
                    <div
                      className="flex items-center gap-1 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost" size="sm"
                        disabled={!customer.phone}
                        onClick={() => handleCall(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400"
                        title="Call client"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        disabled={!customer.whatsappNumber && !customer.phone}
                        onClick={() => handleWhatsApp(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400"
                        title="WhatsApp client"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleViewDetails(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
                        title="View profile"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
                            disabled={isDeleting === customer.id || isBackToLead === customer.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
                          <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
                            <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleBackToLead(customer)}
                            disabled={isBackToLead === customer.id}
                            className="text-sm rounded-lg"
                          >
                            <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" />
                            {isBackToLead === customer.id ? "Moving…" : "Back to Lead"}
                          </DropdownMenuItem>
                          {/* [NEW #3] Delete visible to admins only */}
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => handleDelete(customer)}
                                className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                                disabled={isDeleting === customer.id}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                {isDeleting === customer.id ? "Deleting…" : "Delete"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Mobile card row ───────────────────────────────────── */}
                  <div className="md:hidden px-4 py-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-semibold text-sm text-[#3A7AFE]">
                      {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{customer.name || "Unnamed"}</p>
                        <Badge className={`${status.cls} border text-[10px] font-medium px-1.5 py-0 shrink-0`}>
                          {status.label}
                        </Badge>
                        {/* [NEW #2] Renewal badge on mobile */}
                        {renewalBadge && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.5 rounded-lg ${renewalBadge.cls}`}>
                            {renewalBadge.icon === "expired"
                              ? <AlertTriangle className="h-2.5 w-2.5" />
                              : <Clock className="h-2.5 w-2.5" />}
                            {renewalBadge.label}
                          </span>
                        )}
                      </div>
                      {customer.company && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-300" />
                          {customer.company}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-300" />
                        {customer.phone || "—"}
                      </p>
                      {svc && (
                        <p className="text-xs text-violet-600 font-medium">
                          {SERVICE_LABELS[svc] ?? svc}
                        </p>
                      )}
                      {/* [NEW] Sales rep on mobile */}
                      {customer.salesRep && (
                        <p className="text-xs text-gray-400">Rep: {customer.salesRep}</p>
                      )}
                      <p className="text-xs text-gray-400">Onboarded {formatDate(customer.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="sm"
                        disabled={!customer.phone}
                        onClick={() => handleCall(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-[#3A7AFE] text-gray-400"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        disabled={!customer.whatsappNumber && !customer.phone}
                        onClick={() => handleWhatsApp(customer)}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-green-50 hover:text-green-600 text-gray-400"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 text-gray-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-100 shadow-lg">
                          <DropdownMenuItem onSelect={() => handleViewDetails(customer)} className="text-sm rounded-lg">
                            <Eye className="mr-2 h-3.5 w-3.5 text-gray-400" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEdit(customer)} className="text-sm rounded-lg">
                            <Edit className="mr-2 h-3.5 w-3.5 text-gray-400" /> Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleBackToLead(customer)} className="text-sm rounded-lg">
                            <Undo2 className="mr-2 h-3.5 w-3.5 text-amber-500" /> Back to Lead
                          </DropdownMenuItem>
                          {/* [NEW #3] Admin-only delete on mobile */}
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => handleDelete(customer)}
                                className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
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

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">{filtered.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-gray-600">{customers.length}</span>
                {" "}clients
              </p>
              {/* [NEW #4] Footer export shortcut */}
              <button
                type="button"
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-[#3A7AFE] font-medium transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export {filtered.length !== customers.length ? "filtered" : "all"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <CustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        customer={null}
        mode="add"
        onSaved={() => handleDialogSaved(false)}
      />
      <CustomerDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setSelectedCustomer(null) }}
        customer={selectedCustomer}
        mode="edit"
        onSaved={() => handleDialogSaved(true)}
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

      {/* ── Confirm AlertDialog ────────────────────────────────────────── */}
      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((prev) => ({ ...prev, open }))}>
        <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">{confirm.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm.onConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}