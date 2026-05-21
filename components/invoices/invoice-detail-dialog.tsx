
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Send,
  Edit,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  IndianRupee,
  Stethoscope,
  ReceiptIndianRupee,
} from "lucide-react"
import type { Invoice } from "@/types/crm"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatDate = (value: unknown) => {
  if (!value) return "—"
  const d = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-700 border-gray-200",       dot: "bg-gray-400",    icon: <FileText    className="h-4 w-4" /> },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-800 border-blue-200",       dot: "bg-blue-500",    icon: <Send        className="h-4 w-4" /> },
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500",  icon: <Clock       className="h-4 w-4" /> },
  paid:      { label: "Paid",      color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", icon: <CheckCircle className="h-4 w-4" /> },
  overdue:   { label: "Overdue",   color: "bg-red-100 text-red-800 border-red-200",          dot: "bg-red-500",     icon: <AlertTriangle className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",   icon: <XCircle     className="h-4 w-4" /> },
}

const getStatusMeta = (status: string) => STATUS_META[status] ?? STATUS_META.draft

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border-2 ${highlight ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}>
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className={`text-sm font-bold break-words ${highlight ? "text-amber-800" : "text-slate-700"}`}>{value || "—"}</div>
      </div>
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ gradient, icon, title, children }: {
  gradient: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
      <div className={`${gradient} px-5 py-3 flex items-center gap-2`}>
        <div className="p-1.5 bg-white/20 rounded-lg">{icon}</div>
        <span className="font-black text-white text-sm uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface InvoiceDetailDialogProps {
  invoice:            Invoice | null
  open:               boolean
  onOpenChange:       (open: boolean) => void
  onEditInvoice?:     (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
  onSendInvoice?:     (invoice: Invoice) => void
}

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
  onEditInvoice,
  onDownloadInvoice,
  onSendInvoice,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null

  const inv = invoice as any

  const subtotal  = inv.items?.reduce((s: number, it: any) => s + Number(it.amount ?? 0), 0)
    ?? (typeof invoice.amount === "number" ? invoice.amount : Number(invoice.amount ?? 0) || 0)
  const gstRate   = invoice.tax ?? 18
  const gstAmount = (subtotal * gstRate) / 100
  const total     = inv.total ?? (subtotal + gstAmount)

  const isRecurring  = !!inv.isRecurring
  const recFrequency = inv.recurringFrequency ?? ""
  const recCycles    = inv.recurringCycles    ?? 0
  const recStartDate = inv.recurringStartDate ?? null
  const recEndDate   = inv.recurringEndDate   ?? null

  const customerName = inv.customerName ?? "—"
  const statusMeta   = getStatusMeta(invoice.status)
  const serviceItem  = invoice.items?.[0] ?? null
  const isOverdue    =
    invoice.status !== "paid" &&
    invoice.status !== "cancelled" &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date()

  const heroGradient = invoice.status === "paid"
    ? "from-emerald-600 to-teal-500"
    : invoice.status === "overdue"
    ? "from-red-600 to-rose-500"
    : invoice.status === "sent"
    ? "from-blue-600 to-cyan-500"
    : "from-amber-500 to-orange-500"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">

        {/* Hero header */}
        <div className={`bg-gradient-to-r ${heroGradient} px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm shadow-lg">
                <ReceiptIndianRupee className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-0.5">Invoice</div>
                <div className="text-white font-black text-2xl font-mono">{invoice.invoiceNumber}</div>
                <div className="text-white/80 text-sm mt-0.5">
                  Billed to <span className="font-black text-white">{customerName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${statusMeta.color} border font-bold flex items-center gap-1.5 text-sm px-3 py-1.5`}>
                {statusMeta.icon}
                {statusMeta.label}
              </Badge>
              {isOverdue && (
                <span className="text-xs bg-white text-red-600 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Payment overdue
                </span>
              )}
              {isRecurring && (
                <Badge className="bg-white/20 text-white border-0 font-bold text-xs gap-1 backdrop-blur-sm">
                  <RefreshCw className="h-3 w-3" /> Recurring
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons in hero */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => onEditInvoice?.(invoice)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-bold rounded-xl gap-1.5 backdrop-blur-sm">
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownloadInvoice?.(invoice)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-bold rounded-xl gap-1.5 backdrop-blur-sm">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button size="sm" onClick={() => onSendInvoice?.(invoice)}
              className="bg-white text-slate-900 hover:bg-white/90 font-black rounded-xl gap-1.5 shadow-lg">
              <Send className="h-4 w-4" /> Send to Patient
            </Button>
          </div>
        </div>

        <div className="p-5 bg-slate-50 space-y-4">

          {/* Dates + Patient info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              gradient="bg-gradient-to-r from-slate-800 to-slate-700"
              icon={<Calendar className="h-4 w-4 text-white" />}
              title="Dates"
            >
              <div className="space-y-2">
                <InfoRow icon={<Calendar className="h-4 w-4 text-blue-500" />} label="Issue Date" value={formatDate(inv.issueDate)} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-amber-500" />} label="Due Date" value={formatDate(invoice.dueDate)} highlight={!!isOverdue} />
                {inv.paidDate && (
                  <InfoRow icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} label="Paid Date" value={formatDate(inv.paidDate)} />
                )}
              </div>
            </SectionCard>

            <SectionCard
              gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
              icon={<User className="h-4 w-4 text-white" />}
              title="Patient / Customer"
            >
              <div className="space-y-2">
                <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={customerName} />
                {inv.customerEmail   && <InfoRow icon={<Mail     className="h-4 w-4" />} label="Email"   value={inv.customerEmail} />}
                {inv.customerPhone   && <InfoRow icon={<Phone    className="h-4 w-4" />} label="Phone"   value={inv.customerPhone} />}
                {inv.customerCompany && <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company" value={inv.customerCompany} />}
              </div>
            </SectionCard>
          </div>

          {/* Recurring info */}
          {isRecurring && (
            <SectionCard
              gradient="bg-gradient-to-r from-violet-600 to-purple-500"
              icon={<RefreshCw className="h-4 w-4 text-white" />}
              title="Recurring Billing Details"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Frequency",  value: recFrequency ? recFrequency.charAt(0).toUpperCase() + recFrequency.slice(1) : "—" },
                  { label: "Cycles",     value: recCycles ? `${recCycles} invoices` : "—" },
                  { label: "Start Date", value: formatDate(recStartDate) },
                  { label: "End Date",   value: recEndDate ? formatDate(recEndDate) : "Open-ended" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-violet-50 border-2 border-violet-100 rounded-xl">
                    <div className="text-[10px] font-black text-violet-500 uppercase tracking-wide mb-0.5">{label}</div>
                    <div className="font-bold text-violet-900 text-sm">{value}</div>
                  </div>
                ))}
                {recCycles > 0 && (
                  <div className="md:col-span-4 flex justify-between items-center bg-violet-100 border-2 border-violet-200 rounded-xl px-4 py-3">
                    <span className="font-bold text-violet-700 text-sm">Total over all cycles</span>
                    <span className="font-black text-violet-900 text-lg">{formatCurrency(total * recCycles)}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Services table */}
          {serviceItem && (
            <SectionCard
              gradient="bg-gradient-to-r from-teal-600 to-cyan-500"
              icon={<Stethoscope className="h-4 w-4 text-white" />}
              title="Services"
            >
              {/* Header row */}
              <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-2">
                <div className="col-span-1">Sr.</div>
                <div className="col-span-7">Service Description</div>
                <div className="col-span-4 text-right">Charges</div>
              </div>

              {(invoice.items && invoice.items.length > 0 ? invoice.items : [serviceItem]).map((it: any, i: number) => {
                let breakdown: { label: string; amount: number }[] | null = null
                try {
                  breakdown = typeof it.breakdown === "string" ? JSON.parse(it.breakdown) : it.breakdown
                } catch { breakdown = null }

                return (
                  <div key={i} className="mb-2">
                    <div className="grid grid-cols-12 py-2 text-sm items-start">
                      <div className="col-span-1">
                        <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-xs font-black">{i + 1}</span>
                      </div>
                      <div className="col-span-7 font-bold text-slate-800 pr-2">{it.description || "Medical Service"}</div>
                      <div className="col-span-4 text-right font-black text-slate-900">{formatCurrency(Number(it.amount ?? 0))}</div>
                    </div>
                    {Array.isArray(breakdown) && breakdown.length > 0 && (
                      <div className="ml-8 mb-2 space-y-1 bg-slate-50 border-2 border-slate-100 rounded-xl p-2">
                        {breakdown.map((b, bi) => (
                          <div key={bi} className="grid grid-cols-12 text-xs text-slate-500">
                            <div className="col-span-8">• {b.label}</div>
                            <div className="col-span-4 text-right font-semibold">{formatCurrency(Number(b.amount ?? 0))}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </SectionCard>
          )}

          {/* GST Summary */}
          <div className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><IndianRupee className="h-4 w-4 text-white" /></div>
              <span className="font-black text-white text-sm uppercase tracking-wide">Payment Summary</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal (before GST)</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 font-medium">GST @ {gstRate}%</span>
                <span className="font-bold text-orange-600">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="h-0.5 bg-slate-100 rounded-full" />
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-4 py-3">
                <span className="font-black">Total Payable (incl. GST)</span>
                <span className="font-black text-2xl">{formatCurrency(total)}</span>
              </div>

              {/* Payment status */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-sm font-medium">Payment Status</span>
                <Badge className={`${statusMeta.color} border font-bold gap-1.5 text-xs`}>
                  {statusMeta.icon}
                  {statusMeta.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <SectionCard
              gradient="bg-gradient-to-r from-slate-700 to-slate-600"
              icon={<FileText className="h-4 w-4 text-white" />}
              title="Notes"
            >
              <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-medium">
                {invoice.notes}
              </div>
            </SectionCard>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}