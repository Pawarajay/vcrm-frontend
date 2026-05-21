"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User, Phone, Mail, MapPin, Calendar, Tag,
  MessageSquare, FileText, X, Briefcase,
  RefreshCw, IndianRupee, Building2, Globe, Edit,
  UserCheck, AlertTriangle, Clock, TrendingUp,
} from "lucide-react"
import type { Customer } from "@/types/crm"
import {
  SERVICE_LABELS, BUSINESS_TYPE_LABELS, formatDate, displayEmail,
} from "./customers-content"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: unknown): string =>
  v != null && v !== "" && !isNaN(Number(v))
    ? `₹${Number(v).toLocaleString("en-IN")}`
    : "—"

const parseTags = (raw: unknown): string[] => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  try { return JSON.parse(raw as string) } catch { return [] }
}

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-600",
  prospect: "bg-blue-100 text-blue-800",
}

// ─── Renewal badge (consistent with customers-content logic) ─────────────────

type RenewalMeta = { label: string; cls: string; icon: "expired" | "soon" } | null

const getRenewalMeta = (customer: Customer): RenewalMeta => {
  // FIXED: require BOTH recurringEnabled AND renewalDate
  if (!customer.recurringEnabled || !customer.renewalDate) return null
  const days = Math.ceil(
    (new Date(customer.renewalDate as string).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  )
  if (days < 0)   return { label: "Expired",           cls: "bg-red-50 text-red-700 border-red-200",      icon: "expired" }
  if (days === 0) return { label: "Expires today",      cls: "bg-red-50 text-red-700 border-red-200",      icon: "expired" }
  if (days <= 7)  return { label: `Renews in ${days}d`, cls: "bg-amber-50 text-amber-700 border-amber-200", icon: "soon"    }
  if (days <= 30) return { label: `Renews in ${days}d`, cls: "bg-blue-50 text-blue-700 border-blue-200",    icon: "soon"    }
  return null
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon, label, value,
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm break-words">{value ?? "—"}</div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:                boolean
  onOpenChange:        (open: boolean) => void
  customer:            Customer | null
  onCallCustomer?:     (c: Customer) => void
  onEmailCustomer?:    (c: Customer) => void
  onWhatsAppCustomer?: (c: Customer) => void
  onScheduleMeeting?:  (c: Customer) => void
  onEditCustomer?:     (c: Customer) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerDetailDialog({
  open, onOpenChange, customer,
  onCallCustomer, onEmailCustomer, onWhatsAppCustomer,
  onScheduleMeeting, onEditCustomer,
}: Props) {
  const { invoices = [] } = useCRM()
  const router = useRouter()

  // ── Derived invoice data ─────────────────────────────────────────────────
  const customerInvoices = useMemo(
    () =>
      customer
        ? invoices.filter(
            (i) => i.customerId === customer.id || i.customer_id === customer.id
          )
        : [],
    [invoices, customer]
  )

  const paidRevenue = useMemo(
    () =>
      customerInvoices
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + (Number(i.total) || 0), 0),
    [customerInvoices]
  )

  // FIXED: also compute pending + overdue amounts (SOW §2.6)
  const pendingRevenue = useMemo(
    () =>
      customerInvoices
        .filter((i) => i.status === "pending" || i.status === "draft")
        .reduce((s, i) => s + (Number(i.total) || 0), 0),
    [customerInvoices]
  )

  const overdueCount = useMemo(
    () => customerInvoices.filter((i) => i.status === "overdue").length,
    [customerInvoices]
  )

  const overdueAmount = useMemo(
    () =>
      customerInvoices
        .filter((i) => i.status === "overdue")
        .reduce((s, i) => s + (Number(i.total) || 0), 0),
    [customerInvoices]
  )

  const svc          = customer?.service ?? ""
  const tags         = parseTags(customer?.tags)
  const renewalMeta  = customer ? getRenewalMeta(customer) : null

  // ── Empty guard ─────────────────────────────────────────────────────────
  if (!customer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>No client selected</DialogTitle>
            <DialogDescription>Select a client to view details.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const visibleInvoices   = customerInvoices.slice(0, 5)
  const remainingInvoices = customerInvoices.length - visibleInvoices.length

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full sm:max-w-[90vw] h-[96vh] max-h-[96vh] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl border border-gray-100 shadow-xl">

        {/* ── Fixed header ───────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-[#3A7AFE]">
                  {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-semibold text-gray-900 truncate">
                  {customer.name || "Unnamed"}
                </DialogTitle>
                {customer.company && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{customer.company}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge className={`text-xs ${STATUS_BADGE[customer.status ?? "active"] ?? STATUS_BADGE.active}`}>
                    {customer.status ?? "active"}
                  </Badge>
                  {svc && (
                    <Badge className="text-xs bg-violet-50 text-violet-800 border border-violet-100">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {SERVICE_LABELS[svc] ?? svc}
                    </Badge>
                  )}
                  {customer.recurringEnabled && (
                    <Badge className="text-xs bg-gray-100 text-gray-600 border border-gray-200">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retainer
                    </Badge>
                  )}
                  {/* FIXED: renewal alert badge uses same getRenewalMeta logic */}
                  {renewalMeta && (
                    <Badge className={`text-xs border flex items-center gap-1 ${renewalMeta.cls}`}>
                      {renewalMeta.icon === "expired"
                        ? <AlertTriangle className="h-3 w-3" />
                        : <Clock className="h-3 w-3" />}
                      {renewalMeta.label}
                    </Badge>
                  )}
                  {/* Overdue invoice alert badge */}
                  {overdueCount > 0 && (
                    <Badge className="text-xs bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1 shrink-0">
              {onEditCustomer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onOpenChange(false); onEditCustomer(customer) }}
                  className="rounded-xl border-gray-200 text-gray-600 text-xs font-medium px-3 h-8 flex items-center gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* ── Left column ──────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-4">

              {/* §2.1 Client Information */}
              <Card className="border-gray-100 shadow-none">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={customer.phone}
                    />
                    {customer.whatsappNumber && (
                      <InfoRow
                        icon={<MessageSquare className="h-4 w-4 text-green-600" />}
                        label="WhatsApp"
                        value={<span className="text-green-700">{customer.whatsappNumber}</span>}
                      />
                    )}
                    {displayEmail(customer.email) && (
                      <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email"
                        value={
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-[#3A7AFE] hover:underline"
                          >
                            {displayEmail(customer.email)}
                          </a>
                        }
                      />
                    )}
                    {customer.company && (
                      <InfoRow
                        icon={<Building2 className="h-4 w-4" />}
                        label="Company"
                        value={customer.company}
                      />
                    )}
                  </div>

                  {(customer.address || customer.city) && (
                    <>
                      <Separator />
                      <InfoRow
                        icon={<MapPin className="h-4 w-4" />}
                        label="Address"
                        value={
                          [customer.address, customer.city, customer.state, customer.zipCode]
                            .filter(Boolean)
                            .join(", ")
                        }
                      />
                    </>
                  )}

                  {customer.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                        <div className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-100">
                          {customer.notes}
                        </div>
                      </div>
                    </>
                  )}

                  {/* FIXED: parseTags handles both array and JSON string from backend */}
                  {tags.length > 0 && (
                    <>
                      <Separator />
                      <InfoRow
                        icon={<Tag className="h-4 w-4" />}
                        label="Tags"
                        value={
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {tags.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        }
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* §2.1 + §2.5 Business & Project Details */}
              <Card className="border-gray-100 shadow-none">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Business & Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoRow
                      icon={<Briefcase className="h-4 w-4 text-violet-500" />}
                      label="Service"
                      value={SERVICE_LABELS[svc] ?? svc || "—"}
                    />
                    <InfoRow
                      icon={<Building2 className="h-4 w-4 text-blue-400" />}
                      label="Business Type"
                      value={
                        BUSINESS_TYPE_LABELS[customer.businessType ?? ""] ??
                        customer.businessType ??
                        "—"
                      }
                    />
                    <InfoRow
                      icon={<UserCheck className="h-4 w-4 text-gray-400" />}
                      label="Sales Rep"
                      value={customer.salesRep}
                    />
                    <InfoRow
                      icon={<Globe className="h-4 w-4 text-gray-400" />}
                      label="Lead Source"
                      value={customer.source?.replace(/-/g, " ")}
                    />
                    <InfoRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Onboarding Date"
                      value={formatDate(customer.onboardingDate ?? customer.createdAt)}
                    />
                    <InfoRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Last Contact"
                      value={formatDate(customer.lastContactDate)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* §2.4 & §2.6 Monthly Retainer Plan — only if enabled */}
              {customer.recurringEnabled && (
                <Card className={`shadow-none ${
                  renewalMeta?.icon === "expired"
                    ? "border-red-200 bg-red-50/30"
                    : renewalMeta?.icon === "soon"
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-gray-100"
                }`}>
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <RefreshCw className="h-4 w-4 text-gray-400" />
                      Monthly Retainer Plan
                      {renewalMeta && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full ml-1 ${renewalMeta.cls}`}>
                          {renewalMeta.icon === "expired"
                            ? <AlertTriangle className="h-3 w-3" />
                            : <Clock className="h-3 w-3" />}
                          {renewalMeta.label}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <InfoRow
                        icon={<RefreshCw className="h-4 w-4" />}
                        label="Frequency"
                        value={customer.recurringInterval ?? "monthly"}
                      />
                      <InfoRow
                        icon={<IndianRupee className="h-4 w-4" />}
                        label="Amount"
                        value={formatCurrency(customer.recurringAmount)}
                      />
                      <InfoRow
                        icon={<Briefcase className="h-4 w-4" />}
                        label="Plan / Service"
                        value={customer.recurringService}
                      />
                      <InfoRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Next Renewal"
                        value={formatDate(customer.renewalDate)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* §2.6 Invoices */}
              <Card className="border-gray-100 shadow-none">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Invoices
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
                    <span>
                      {customerInvoices.length} invoice{customerInvoices.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {formatCurrency(paidRevenue)} paid
                    </span>
                    {pendingRevenue > 0 && (
                      <span className="text-amber-600 font-medium">
                        {formatCurrency(pendingRevenue)} pending
                      </span>
                    )}
                    {overdueAmount > 0 && (
                      <span className="text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {formatCurrency(overdueAmount)} overdue
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {customerInvoices.length > 0 ? (
                    <div className="space-y-2">
                      {visibleInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            inv.status === "overdue"
                              ? "bg-red-50/40 border-red-100"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-mono font-semibold text-gray-700">
                              {inv.invoiceNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-gray-800">
                              {formatCurrency(inv.total)}
                            </p>
                            <Badge
                              className={`text-[10px] mt-0.5 ${
                                inv.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : inv.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {/* FIXED: use router.push instead of window.location.href */}
                      {remainingInvoices > 0 && (
                        <button
                          type="button"
                          className="w-full py-2 text-xs text-[#3A7AFE] font-medium hover:underline text-center"
                          onClick={() => {
                            onOpenChange(false)
                            router.push(`/invoices?customerId=${customer.id}`)
                          }}
                        >
                          View {remainingInvoices} more invoice{remainingInvoices !== 1 ? "s" : ""}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No invoices yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right sidebar ────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Quick Actions */}
              <Card className="border-gray-100 shadow-none">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-gray-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-2">
                  <Button
                    variant="outline" size="sm"
                    className="w-full justify-start gap-2 text-sm rounded-xl border-gray-200"
                    disabled={!customer.phone}
                    onClick={() => onCallCustomer?.(customer)}
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    Call Client
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className="w-full justify-start gap-2 text-sm rounded-xl border-gray-200"
                    disabled={!customer.whatsappNumber && !customer.phone}
                    onClick={() => onWhatsAppCustomer?.(customer)}
                  >
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    WhatsApp
                  </Button>
                  {/* FIXED: email button now uses onEmailCustomer prop correctly */}
                  {displayEmail(customer.email) && (
                    <Button
                      variant="outline" size="sm"
                      className="w-full justify-start gap-2 text-sm rounded-xl border-gray-200"
                      onClick={() =>
                        onEmailCustomer
                          ? onEmailCustomer(customer)
                          : window.open(`mailto:${customer.email}`, "_self")
                      }
                    >
                      <Mail className="h-4 w-4 text-gray-400" />
                      Send Email
                    </Button>
                  )}
                  <Button
                    variant="outline" size="sm"
                    className="w-full justify-start gap-2 text-sm rounded-xl border-gray-200"
                    onClick={() => onScheduleMeeting?.(customer)}
                  >
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Schedule Meeting
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className="w-full justify-start gap-2 text-sm rounded-xl border-gray-200"
                    onClick={() => {
                      onOpenChange(false)
                      router.push(`/invoices/new?customerId=${customer.id}`)
                    }}
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    Create Invoice
                  </Button>
                </CardContent>
              </Card>

              {/* §2.6 Billing Summary */}
              <Card className="border-gray-100 shadow-none">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Billing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1">Total Deal Value</div>
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(customer.totalValue as number)}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-xs text-emerald-500 mb-1">Revenue Received</div>
                    <div className="text-lg font-bold text-emerald-700">
                      {formatCurrency(paidRevenue)}
                    </div>
                  </div>

                  {/* FIXED: Show pending invoices amount */}
                  {pendingRevenue > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="text-xs text-amber-500 mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Pending Invoices
                      </div>
                      <div className="text-lg font-bold text-amber-700">
                        {formatCurrency(pendingRevenue)}
                      </div>
                    </div>
                  )}

                  {/* FIXED: Show overdue amount prominently */}
                  {overdueAmount > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-500 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue Amount
                      </div>
                      <div className="text-lg font-bold text-red-700">
                        {formatCurrency(overdueAmount)}
                      </div>
                    </div>
                  )}

                  {/* Retainer amount card */}
                  {customer.recurringEnabled && customer.recurringAmount && (
                    <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                      <div className="text-xs text-violet-500 mb-1">Monthly Retainer</div>
                      <div className="text-lg font-bold text-violet-700">
                        {formatCurrency(customer.recurringAmount)}
                        <span className="text-xs font-normal text-violet-400 ml-1">
                          / {customer.recurringInterval ?? "mo"}
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Client Since"
                    value={formatDate(customer.createdAt)}
                  />
                  <InfoRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Total Invoices"
                    value={`${customerInvoices.length} (${
                      customerInvoices.filter((i) => i.status === "paid").length
                    } paid)`}
                  />
                  {customer.renewalDate && customer.recurringEnabled && (
                    <InfoRow
                      icon={<RefreshCw className="h-4 w-4" />}
                      label="Next Renewal"
                      value={
                        <span className={renewalMeta ? "font-semibold" : ""}>
                          {formatDate(customer.renewalDate)}
                        </span>
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}