
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useCRM } from "@/contexts/crm-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  IndianRupee,
} from "lucide-react"
import type { Invoice } from "@/types/crm"

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BreakdownItem = { label: string; amount: number }

type LineItemForm = {
  description: string
  quantity: number
  rate: number
  amount: number
  breakdown?: BreakdownItem[]
}

type InvoiceFormState = {
  customerId: string
  customerName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: Invoice["status"]
  subtotal: number
  gstRate: number
  notes: string
  service: string
  amount: string
  items: LineItemForm[]
  // Recurring fields
  isRecurring: boolean
  recurringFrequency: "weekly" | "monthly" | "quarterly" | "yearly"
  recurringStartDate: string
  recurringEndDate: string
  recurringCycles: string
}

// ─── MEDICAL SERVICES ─────────────────────────────────────────────────────────

const MEDICAL_SERVICES = [
  { value: "haemodialysis", label: "Home Haemodialysis" },
  { value: "hdf",           label: "HDF At-home" },
  { value: "peritoneal",    label: "Peritoneal Dialysis" },
  { value: "nursing",       label: "ANM/GNM Nurse" },
  { value: "lab-tests",             label: "Lab Tests & Diagnostics" },
  { value: "medications",           label: "Medications" },
  { value: "other",                 label: "Other Medical Service" },
]

const GST_RATES = [0, 5, 12, 18, 28]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toDateString = (d: Date) => d.toISOString().split("T")[0]

const addMonths = (date: Date, months: number) => {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() < day) d.setDate(0)
  return d
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const generateRNLNumber = () => {
  const seq = String(Date.now()).slice(-4).padStart(4, "0")
  return `RNL-${seq}`
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface InvoiceDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
  const { customers, addInvoice, updateInvoice } = useCRM()

  const [formData, setFormData] = useState<InvoiceFormState>({
    customerId: "",
    customerName: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    status: "draft",
    subtotal: 0,
    gstRate: 18,
    notes: "",
    service: "",
    amount: "",
    items: [],
    isRecurring: false,
    recurringFrequency: "monthly",
    recurringStartDate: "",
    recurringEndDate: "",
    recurringCycles: "12",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Recalc helpers ────────────────────────────────────────────────────────

  const recalcSubtotalFromItems = useCallback((items: LineItemForm[]) => {
    const subtotal = items.reduce((sum, it) => sum + (it.amount || 0), 0)
    setFormData((prev) => ({
      ...prev,
      items,
      subtotal,
      amount: subtotal ? String(subtotal) : prev.amount,
    }))
  }, [])

  const handleAddItem = () => {
    recalcSubtotalFromItems([
      ...formData.items,
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        breakdown: [],
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    recalcSubtotalFromItems(formData.items.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof LineItemForm,
    value: string
  ) => {
    const nextItems = formData.items.map((item, i) => {
      if (i !== index) return item
      const updated: LineItemForm = { ...item }
      if (field === "description") {
        updated.description = value
      } else if (field === "quantity") {
        updated.quantity = Number(value || 0)
        updated.amount = updated.quantity * updated.rate
      } else if (field === "rate") {
        updated.rate = Number(value || 0)
        updated.amount = updated.quantity * updated.rate
      } else if (field === "amount") {
        updated.amount = Number(value || 0)
        updated.rate = updated.quantity > 0 ? updated.amount / updated.quantity : updated.amount
      }
      return updated
    })
    recalcSubtotalFromItems(nextItems)
  }

  // ── Init form ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    const today = new Date()
    const defaultDue = addMonths(today, 1)

    if (invoice) {
      const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
      const due   = invoice.dueDate   ? new Date(invoice.dueDate)   : defaultDue

      const subtotal =
        typeof invoice.amount === "number"
          ? invoice.amount
          : Number(invoice.amount ?? 0) || 0

      const firstItem = invoice.items?.[0]
      const service   = firstItem?.description ?? (invoice as any).service ?? ""
      const amount    = firstItem?.amount ?? subtotal

      const items: LineItemForm[] =
        invoice.items?.length
          ? invoice.items.map((it: any) => {
              let parsedBreakdown: BreakdownItem[] | undefined
              try {
                parsedBreakdown =
                  typeof it.breakdown === "string"
                    ? JSON.parse(it.breakdown)
                    : it.breakdown
              } catch { parsedBreakdown = undefined }
              return {
                description: it.description,
                quantity:    it.quantity ?? 1,
                rate:        Number(it.rate   ?? 0) || 0,
                amount:      Number(it.amount ?? 0) || 0,
                breakdown:   parsedBreakdown,
              }
            })
          : service || amount
          ? [{ description: service || "Medical Service", quantity: 1, rate: Number(amount) || 0, amount: Number(amount) || 0, breakdown: [] }]
          : []

      const subtotalFromItems = items.reduce((s, it) => s + it.amount, 0) || subtotal
      const recInv = invoice as any

      setFormData({
        customerId:       invoice.customerId,
        customerName:     invoice.customerName,
        invoiceNumber:    invoice.invoiceNumber,
        issueDate:        toDateString(issue),
        dueDate:          toDateString(due),
        status:           invoice.status,
        subtotal:         subtotalFromItems,
        gstRate:          invoice.tax ?? 18,
        notes:            invoice.notes || "",
        service,
        amount:           amount ? String(amount) : "",
        items,
        isRecurring:      recInv.isRecurring ?? false,
        recurringFrequency: recInv.recurringFrequency ?? "monthly",
        recurringStartDate: recInv.recurringStartDate ? toDateString(new Date(recInv.recurringStartDate)) : toDateString(today),
        recurringEndDate:   recInv.recurringEndDate ? toDateString(new Date(recInv.recurringEndDate)) : "",
        recurringCycles:    String(recInv.recurringCycles ?? 12),
      })
    } else {
      setFormData({
        customerId: "",
        customerName: "",
        invoiceNumber: generateRNLNumber(),
        issueDate:    toDateString(today),
        dueDate:      toDateString(defaultDue),
        status:       "draft",
        subtotal:     0,
        gstRate:      18,
        notes:        "",
        service:      "",
        amount:       "",
        items:        [],
        isRecurring:  false,
        recurringFrequency: "monthly",
        recurringStartDate: toDateString(today),
        recurringEndDate:   "",
        recurringCycles:    "12",
      })
    }
    setError(null)
  }, [invoice, open])

  // ── Customer auto-fill ────────────────────────────────────────────────────

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return

    setFormData((prev) => {
      const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

      let nextDueDate = prev.dueDate
      if ((customer as any).defaultDueDays > 0) {
        const due = new Date(issue)
        due.setDate(due.getDate() + Number((customer as any).defaultDueDays))
        nextDueDate = toDateString(due)
      }

      // Detect medical service
      const svcType = (customer as any).serviceType || (customer as any).service || ""
      const svcLabel = MEDICAL_SERVICES.find(s => s.value === svcType)?.label
        || (svcType === "haemodialysis" ? "Home Haemodialysis"
           : svcType === "hdf"          ? "HDF At-home"
           : svcType === "peritoneal"   ? "Peritoneal Dialysis"
           : svcType === "nursing"      ? "ANM/GNM Nurse"
           : (customer as any).service         ? String((customer as any).service)
           : "Medical Service")

      const oneTime = Number((customer as any).oneTimePrice  || 0)
      const monthly = Number((customer as any).monthlyPrice  || 0)
      const manual  = Number((customer as any).manualPrice   || 0)
      let serviceAmount = oneTime + monthly + manual

      if (!serviceAmount) {
        serviceAmount = Number((customer as any).totalValue || 0)
          || Number((customer as any).recurringAmount || 0)
      }

      const breakdown: BreakdownItem[] = []
      if (oneTime > 0) breakdown.push({ label: "One-time / Procedure", amount: oneTime })
      if (monthly > 0) breakdown.push({ label: "Monthly / Recurring",   amount: monthly })
      if (manual  > 0) breakdown.push({ label: "Additional Charges",    amount: manual  })

      let descriptionFull = svcLabel
      if (breakdown.length > 0) {
        const readable = breakdown.map(b => `${b.label}: ₹${b.amount}`).join(", ")
        descriptionFull = `${svcLabel} (${readable})`
      }

      const updatedItems: LineItemForm[] =
        serviceAmount > 0 || descriptionFull
          ? [{ description: descriptionFull, quantity: 1, rate: serviceAmount, amount: serviceAmount, breakdown: breakdown.length ? breakdown : undefined }]
          : prev.items || []

      const subtotalFromItems = updatedItems.reduce((s, it) => s + it.amount, 0)

      return {
        ...prev,
        customerId,
        customerName:  customer.name || "",
        dueDate:       nextDueDate,
        notes:         (customer as any).defaultInvoiceNotes || prev.notes,
        service:       descriptionFull || prev.service,
        amount:        subtotalFromItems ? String(subtotalFromItems) : prev.amount,
        subtotal:      subtotalFromItems || prev.subtotal,
        items:         updatedItems,
        // Auto-enable recurring for dialysis patients
        isRecurring:   ["haemodialysis","hdf","peritoneal"].includes(svcType) ? true : prev.isRecurring,
      }
    })
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.customerId)              { setError("Patient / Customer is required.");            return }
    if (!formData.invoiceNumber.trim())    { setError("Invoice number is required.");                return }
    if (!formData.issueDate || !formData.dueDate) { setError("Issue date and due date are required."); return }
    if (!formData.items.length && !formData.service.trim()) { setError("At least one service is required."); return }

    const subtotal = formData.subtotal || Number(formData.amount) || 0
    if (isNaN(subtotal) || subtotal <= 0) { setError("Amount must be a positive number."); return }

    if (formData.isRecurring) {
      if (!formData.recurringStartDate) { setError("Recurring start date is required."); return }
      const cycles = Number(formData.recurringCycles)
      if (isNaN(cycles) || cycles < 1)  { setError("Recurring cycles must be at least 1."); return }
    }

    const gstRate   = formData.gstRate ?? 18
    const gstAmount = (subtotal * gstRate) / 100
    const total     = subtotal + gstAmount

    const itemsPayload = formData.items.length
      ? formData.items.map(it => ({
          description: it.description.trim() || formData.service.trim() || "Medical Service",
          quantity:    it.quantity || 1,
          rate:        it.rate,
          amount:      it.amount,
          breakdown:   it.breakdown?.length ? it.breakdown : undefined,
        }))
      : [{ description: formData.service.trim() || "Medical Service", quantity: 1, rate: subtotal, amount: subtotal, breakdown: undefined }]

    const apiPayload: any = {
      customerId: formData.customerId,
      amount:     subtotal,
      tax:        gstRate,
      total,
      status:     formData.status,
      issueDate:  formData.issueDate,
      dueDate:    formData.dueDate,
      items:      itemsPayload,
      notes:      formData.notes.trim(),
      gstAmount,
      isRecurring: formData.isRecurring,
    }

    if (formData.isRecurring) {
      apiPayload.recurringFrequency  = formData.recurringFrequency
      apiPayload.recurringStartDate  = formData.recurringStartDate
      apiPayload.recurringEndDate    = formData.recurringEndDate || null
      apiPayload.recurringCycles     = Number(formData.recurringCycles)
    }

    const invoiceData: Omit<Invoice, "id"> = {
      customerId:    formData.customerId,
      customerName:  formData.customerName,
      invoiceNumber: formData.invoiceNumber.trim(),
      issueDate:     formData.issueDate,
      dueDate:       formData.dueDate,
      status:        formData.status,
      amount:        subtotal,
      tax:           gstRate,
      discount:      0,
      notes:         formData.notes.trim(),
      items:         itemsPayload as any,
    }

    setIsSubmitting(true)
    try {
      if (invoice) {
        await updateInvoice(invoice.id, invoiceData as any, apiPayload)
      } else {
        await addInvoice(invoiceData as any, apiPayload)
      }
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Failed to save invoice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const gstAmount   = (formData.subtotal * (formData.gstRate ?? 18)) / 100
  const totalWithGst = formData.subtotal + gstAmount

  const selectedCustomer = customers.find((c) => c.id === formData.customerId) ?? null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="h-5 w-5 text-primary" />
            {invoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Patient / Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer">Patient / Customer <span className="text-red-500">*</span></Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient / customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.company ? ` — ${c.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData((p) => ({ ...p, invoiceNumber: e.target.value }))}
                  placeholder="RNL-0001"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData((p) => ({ ...p, invoiceNumber: generateRNLNumber() }))}
                  title="Generate new number"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData((p) => ({ ...p, issueDate: e.target.value }))}
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: Invoice["status"]) => setFormData((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* GST Rate */}
            <div className="space-y-2">
              <Label>GST Rate (%)</Label>
              <Select
                value={String(formData.gstRate)}
                onValueChange={(v) => setFormData((p) => ({ ...p, gstRate: Number(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GST_RATES.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r}% {r === 0 ? "(Exempt)" : r === 5 ? "(Healthcare)" : r === 18 ? "(Standard)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer details card */}
            {selectedCustomer && (
              <div className="md:col-span-2 text-sm border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="font-semibold mb-3 text-indigo-900 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Patient Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    { label: "Name",    value: selectedCustomer.name },
                    { label: "Email",   value: selectedCustomer.email },
                    { label: "Phone",   value: selectedCustomer.phone },
                    { label: "Company", value: selectedCustomer.company || "—" },
                    { label: "Total Value", value: `₹${Number(selectedCustomer.totalValue || 0).toLocaleString("en-IN")}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="font-medium text-gray-500">{label}: </span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Service Line Items ───────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Service Details</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No services added yet. Select a patient above to auto-fill, or click "Add Service".
                </p>
              )}

              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Service {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="e.g. Dialysis Treatment – 4 sessions"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rate (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate || ""}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Line total:</span>
                    <span className="font-semibold">{formatCurrency(item.amount || 0)}</span>
                  </div>

                  {item.breakdown && item.breakdown.length > 0 && (
                    <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
                      <div className="font-semibold text-gray-700 mb-1">Breakdown</div>
                      {item.breakdown.map((b, i) => (
                        <div key={i} className="flex justify-between">
                          <span>• {b.label}</span>
                          <span>{formatCurrency(b.amount || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Manual amount override */}
              <div className="space-y-1 max-w-xs pt-2">
                <Label htmlFor="planAmount" className="text-xs">
                  Total Charges (₹) — override if needed
                </Label>
                <Input
                  id="planAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = parseFloat(v) || 0
                    setFormData((p) => ({
                      ...p,
                      amount: v,
                      subtotal: num,
                      items: num > 0
                        ? [{ description: p.items[0]?.description || p.service || "Medical Service", quantity: 1, rate: num, amount: num, breakdown: p.items[0]?.breakdown }]
                        : p.items,
                    }))
                  }}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from patient pricing. Override manually if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Recurring Billing ────────────────────────────────────────── */}
          <Card className="border-dashed border-primary/40">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Recurring Invoice</p>
                    <p className="text-xs text-muted-foreground">Auto-recurring for haemodialysis, HDF & peritoneal</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(v) => setFormData((p) => ({ ...p, isRecurring: v }))}
                />
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-xs">Frequency</Label>
                    <Select
                      value={formData.recurringFrequency}
                      onValueChange={(v: any) => setFormData((p) => ({ ...p, recurringFrequency: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">No. of Cycles</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.recurringCycles}
                      onChange={(e) => setFormData((p) => ({ ...p, recurringCycles: e.target.value }))}
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.recurringStartDate}
                      onChange={(e) => setFormData((p) => ({ ...p, recurringStartDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">End Date (optional)</Label>
                    <Input
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => setFormData((p) => ({ ...p, recurringEndDate: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Preview:</strong> {formData.recurringCycles} {formData.recurringFrequency} invoice(s) of{" "}
                    <strong>{formatCurrency(totalWithGst)}</strong> = total{" "}
                    <strong>{formatCurrency(totalWithGst * Number(formData.recurringCycles || 1))}</strong>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── GST Summary ──────────────────────────────────────────────── */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 pt-4 px-4 rounded-t-lg">
              <CardTitle className="text-base text-indigo-900 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (before GST)</span>
                <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-700">
                <span>GST @ {formData.gstRate}%</span>
                <span className="font-medium">{formatCurrency(gstAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg px-4 py-3">
                <span className="font-bold">Total Payable (incl. GST)</span>
                <span className="font-bold text-lg">{formatCurrency(totalWithGst)}</span>
              </div>
              {formData.isRecurring && Number(formData.recurringCycles) > 1 && (
                <div className="flex justify-between text-sm text-emerald-700 bg-emerald-50 rounded px-3 py-2">
                  <span>Total over {formData.recurringCycles} cycles</span>
                  <span className="font-semibold">
                    {formatCurrency(totalWithGst * Number(formData.recurringCycles))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Payment instructions, treatment details, or any other notes..."
              rows={3}
            />
          </div>

          {/* ── Error ──────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting
                ? "Saving..."
                : invoice
                ? "Update Invoice"
                : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}