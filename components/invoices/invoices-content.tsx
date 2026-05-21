"use client"

import { useMemo, useState, useCallback } from "react"
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  IndianRupee,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Bell,
  ReceiptIndianRupee,
} from "lucide-react"
import { InvoiceDialog } from "./invoice-dialog"
import { InvoiceDetailDialog } from "./invoice-detail-dialog"
import type { Invoice } from "@/types/crm"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (value: unknown) => {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const BACKEND_URL =
  // process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://vcrm-backend.onrender.com"

const getLogoBase64 = async (): Promise<string> => {
  try {
    const response = await fetch("/vasify-logo.jpeg")
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return ""
  }
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label:    string
  color:    string
  dotColor: string
  icon:     React.ReactNode
}> = {
  draft: {
    label:    "Draft",
    color:    "bg-gray-100 text-gray-700 border-gray-200",
    dotColor: "bg-gray-400",
    icon:     <FileText className="h-3.5 w-3.5" />,
  },
  sent: {
    label:    "Sent",
    color:    "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    icon:     <Send className="h-3.5 w-3.5" />,
  },
  pending: {
    label:    "Pending",
    color:    "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
    icon:     <Clock className="h-3.5 w-3.5" />,
  },
  paid: {
    label:    "Paid",
    color:    "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon:     <CheckCircle className="h-3.5 w-3.5" />,
  },
  overdue: {
    label:    "Overdue",
    color:    "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
    icon:     <AlertTriangle className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label:    "Cancelled",
    color:    "bg-slate-100 text-slate-600 border-slate-200",
    dotColor: "bg-slate-400",
    icon:     <XCircle className="h-3.5 w-3.5" />,
  },
}

const getStatusMeta = (status: string) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.draft

// ─── INLINE STATUS DROPDOWN ───────────────────────────────────────────────────

interface InlineInvoiceStatusProps {
  invoice: Invoice
  onStatusChange: (id: string, status: string) => Promise<void>
}

function InlineInvoiceStatus({ invoice, onStatusChange }: InlineInvoiceStatusProps) {
  const [current, setCurrent] = useState(invoice.status as string)
  const [saving,  setSaving]  = useState(false)

  const meta = getStatusMeta(current)

  const handleChange = async (newStatus: string) => {
    if (newStatus === current) return
    const prev = current
    setCurrent(newStatus)
    setSaving(true)
    try {
      await onStatusChange(invoice.id, newStatus)
    } catch {
      setCurrent(prev)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger
        className={`
          h-7 text-xs font-bold border rounded-full px-2.5 gap-1.5
          w-auto min-w-[110px] max-w-[140px]
          ${meta.color}
          focus:ring-1 focus:ring-offset-0
          ${saving ? "opacity-60 cursor-wait" : "cursor-pointer hover:opacity-80"}
        `}
        style={{ boxShadow: "none" }}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotColor}`} />
        <SelectValue />
        {saving
          ? <span className="ml-auto h-3 w-3 animate-spin rounded-full border border-current border-t-transparent shrink-0" />
          : <ChevronDown className="ml-auto h-3 w-3 opacity-50 shrink-0" />
        }
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[155px] rounded-xl border-2 border-slate-100 shadow-xl">
        {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
              <span className="font-semibold">{cfg.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── KPI CARD (simplified — 3 only) ──────────────────────────────────────────

function KpiCard({
  title, value, sub, icon, accent,
}: {
  title:  string
  value:  string
  sub:    string
  icon:   React.ReactNode
  accent: string          // tailwind bg class for icon bg
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</div>
        <div className="text-2xl font-black text-slate-900 leading-none truncate">{value}</div>
        <div className="text-xs text-slate-500 mt-1 font-medium">{sub}</div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function InvoicesContent() {
  const { invoices, deleteInvoice, updateInvoice, addInvoice } = useCRM()

  const [searchTerm,      setSearchTerm]      = useState("")
  const [statusFilter,    setStatusFilter]    = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDialogOpen,    setIsDialogOpen]    = useState(false)
  const [isDetailOpen,    setIsDetailOpen]    = useState(false)

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const handleInlineStatusChange = useCallback(
    async (id: string, status: string) => {
      await updateInvoice(id, { status: status as Invoice["status"] } as any, { status } as any)
    },
    [updateInvoice]
  )

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const num  = (inv.invoiceNumber?.toLowerCase?.() ?? "")
        const name = ((inv as any).customerName?.toLowerCase?.() ?? "")
        const matchesSearch = !normalizedSearch || num.includes(normalizedSearch) || name.includes(normalizedSearch)
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [invoices, normalizedSearch, statusFilter]
  )

  // ── 3 KPI stats only ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now       = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return invoices.reduce(
      (acc, inv) => {
        const amount  = typeof inv.amount === "number" ? inv.amount : Number(inv.amount ?? 0) || 0
        const gstRate = inv.tax ?? 18
        const total   = (inv as any).total ?? (amount + (amount * gstRate) / 100)

        // Pending = sent + pending statuses
        if (inv.status === "pending" || inv.status === "sent") acc.pending += total

        // Collected this month
        if (inv.status === "paid") {
          const paidDate = (inv as any).paidDate ? new Date((inv as any).paidDate) : null
          const issueDate = inv.issueDate ? new Date(inv.issueDate) : null
          const refDate   = paidDate ?? issueDate
          if (refDate && refDate >= monthStart) acc.collectedThisMonth += total
        }

        // Overdue
        const isOverdue =
          inv.status !== "paid" &&
          inv.status !== "cancelled" &&
          inv.dueDate &&
          new Date(inv.dueDate) < now
        if (isOverdue) {
          acc.overdue      += total
          acc.overdueCount += 1
        }

        return acc
      },
      { pending: 0, collectedThisMonth: 0, overdue: 0, overdueCount: 0 }
    )
  }, [invoices])

  const handleEdit   = (inv: Invoice) => { setSelectedInvoice(inv); setIsDialogOpen(true) }
  const handleView   = (inv: Invoice) => { setSelectedInvoice(inv); setIsDetailOpen(true) }
  const handleDelete = (id: string) => {
    if (window.confirm("Delete this invoice? This action cannot be undone.")) void deleteInvoice(id)
  }

  const handleDownload = async (inv: Invoice) => {
    try {
      const token      = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const logoBase64 = await getLogoBase64()
      const res = await fetch(`${BACKEND_URL}/api/invoices/${inv.id}/download`, {
        method: "POST",
        headers: {
          Authorization:  token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoBase64 }),
      })
      if (!res.ok) { alert("Failed to download PDF. Please check server logs."); return }
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = `invoice-${inv.invoiceNumber || inv.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
      alert("Error downloading PDF.")
    }
  }

  const handleSendReminder = (inv: Invoice) => {
    // Placeholder — wire to your email/SMS service
    console.log("Send reminder for invoice:", inv.id)
    alert(`Reminder sent to patient for invoice ${inv.invoiceNumber}`)
  }

  const handleMarkPaid = async (inv: Invoice) => {
    await handleInlineStatusChange(inv.id, "paid")
  }

  const handleExportExcel = () => {
    if (!filteredInvoices.length) { alert("No invoices to export."); return }
    const rows = filteredInvoices.map((inv) => {
      const amount  = typeof inv.amount === "number" ? inv.amount : Number(inv.amount ?? 0) || 0
      const gstRate = inv.tax ?? 18
      const gst     = (amount * gstRate) / 100
      const total   = (inv as any).total ?? (amount + gst)
      return {
        "Invoice No":         inv.invoiceNumber,
        "Patient / Customer": (inv as any).customerName ?? "",
        "Status":             inv.status,
        "Issue Date":         formatDate(inv.issueDate),
        "Due Date":           formatDate(inv.dueDate),
        "Subtotal (₹)":       amount,
        "GST %":              gstRate,
        "GST Amount (₹)":     parseFloat(gst.toFixed(2)),
        "Total Payable (₹)":  parseFloat(total.toFixed(2)),
        "Notes":              inv.notes ?? "",
      }
    })
    const ws  = XLSXUtils.json_to_sheet(rows)
    const wb  = XLSXUtils.book_new()
    XLSXUtils.book_append_sheet(wb, ws, "Renalease Invoices")
    XLSXWriteFile(wb, `renalease-invoices-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 mb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl">
              <ReceiptIndianRupee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoices</h1>
              <p className="text-slate-500 text-sm">Billing &amp; Payment Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="font-semibold rounded-xl gap-2 border-slate-200"
            >
              <Download className="h-4 w-4" />Export
            </Button>
            <Button
              onClick={() => { setSelectedInvoice(null); setIsDialogOpen(true) }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 rounded-xl gap-2"
            >
              <Plus className="h-4 w-4" />Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10 space-y-6">

        {/* ── 3 KPI CARDS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Total Pending"
            value={formatCurrency(stats.pending)}
            sub="Awaiting payment"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            accent="bg-amber-50"
          />
          <KpiCard
            title="Collected This Month"
            value={formatCurrency(stats.collectedThisMonth)}
            sub="Received in current month"
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            accent="bg-emerald-50"
          />
          <KpiCard
            title="Overdue"
            value={formatCurrency(stats.overdue)}
            sub={`${stats.overdueCount} invoice${stats.overdueCount !== 1 ? "s" : ""} past due`}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            accent="bg-red-50"
          />
        </div>

        {/* ── INVOICE TABLE ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search invoice # or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 focus:border-slate-400 h-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 rounded-xl border-slate-200 h-9 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                  <SelectItem key={v} value={v}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                      {cfg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 ml-auto">
              {filteredInvoices.length} of {invoices.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pl-5">Invoice #</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Patient</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Due Date</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <FileText className="h-7 w-7 opacity-30" />
                        </div>
                        <span className="font-semibold text-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "No invoices match your filters."
                            : "No invoices yet. Create your first one!"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => {
                    const amount   = typeof inv.amount === "number" ? inv.amount : Number(inv.amount ?? 0) || 0
                    const gstRate  = inv.tax ?? 18
                    const total    = (inv as any).total ?? (amount + (amount * gstRate) / 100)
                    const custName = (inv as any).customerName ?? "—"

                    const isOverdue =
                      inv.status !== "paid" &&
                      inv.status !== "cancelled" &&
                      inv.dueDate &&
                      new Date(inv.dueDate) < new Date()

                    return (
                      <TableRow
                        key={inv.id}
                        className={`
                          cursor-pointer border-b border-slate-100 transition-colors
                          ${isOverdue
                            ? "bg-red-50/60 hover:bg-red-50"
                            : "hover:bg-slate-50/70"}
                        `}
                        onDoubleClick={() => handleView(inv)}
                      >
                        {/* Invoice # */}
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2">
                            {isOverdue && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                            )}
                            <span className="font-mono font-bold text-sm text-slate-800">
                              {inv.invoiceNumber}
                            </span>
                          </div>
                        </TableCell>

                        {/* Patient */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-slate-600">
                                {custName?.charAt(0)?.toUpperCase() ?? "P"}
                              </span>
                            </div>
                            <span className="font-semibold text-sm text-slate-800">{custName}</span>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <span className="font-bold text-slate-900 text-sm">{formatCurrency(total)}</span>
                        </TableCell>

                        {/* Status — inline editable */}
                        <TableCell onClick={(e) => e.stopPropagation()} className="min-w-[130px]">
                          <InlineInvoiceStatus invoice={inv} onStatusChange={handleInlineStatusChange} />
                        </TableCell>

                        {/* Due Date */}
                        <TableCell>
                          <div className={`text-sm font-semibold ${isOverdue ? "text-red-600" : "text-slate-600"}`}>
                            {formatDate(inv.dueDate)}
                          </div>
                          {isOverdue && (
                            <div className="text-[10px] font-bold text-red-500 mt-0.5">
                              Overdue
                            </div>
                          )}
                        </TableCell>

                        {/* Actions — inline quick buttons + overflow menu */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Send Reminder */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Send Reminder"
                              onClick={() => handleSendReminder(inv)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>

                            {/* Mark as Paid */}
                            {inv.status !== "paid" && inv.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                title="Mark as Paid"
                                onClick={() => handleMarkPaid(inv)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Download Invoice */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                              title="Download Invoice"
                              onClick={() => handleDownload(inv)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            {/* Overflow menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:bg-slate-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-xl">
                                <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wide text-slate-400">More Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleView(inv)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-500" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(inv)}>
                                  <Edit className="h-4 w-4 mr-2 text-slate-500" /> Edit Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendReminder(inv)}>
                                  <Send className="h-4 w-4 mr-2 text-indigo-500" /> Send to Patient
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(inv.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InvoiceDialog invoice={selectedInvoice} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEditInvoice={handleEdit}
        onDownloadInvoice={handleDownload}
        onSendInvoice={handleSendReminder}
      />
    </div>
  )
}