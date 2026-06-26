"use client"

import { useState, useEffect, useMemo } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Receipt, Calendar, X, Check, Pencil } from "lucide-react"
import type { Customer } from "@/types/crm"

const PAYMENT_MODES = [
  { value: "upi",           label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash",          label: "Cash" },
  { value: "cheque",        label: "Cheque" },
  { value: "card",          label: "Card" },
  { value: "other",         label: "Other" },
]

const formatCurrency = (v: unknown) => {
  const n = Number(v ?? 0)
  if (isNaN(n)) return "₹0"
  return `₹${n.toLocaleString("en-IN")}`
}

const formatDate = (v: string | null | undefined) => {
  if (!v) return "—"
  const d = new Date(v)
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const todayISO = () => new Date().toISOString().slice(0, 10)

interface PaymentHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function PaymentHistoryDialog({ open, onOpenChange, customer }: PaymentHistoryDialogProps) {
  const {
    customerPayments, refreshCustomerPayments,
    addCustomerPayment, deleteCustomerPayment,
    updateCustomer, invoices,
  } = useCRM()

  // ── Total Amount inline edit ────────────────────────────────────────────
  const [editingTotal, setEditingTotal] = useState(false)
  const [totalIn,       setTotalIn]     = useState("")
  const [savingTotal,   setSavingTotal] = useState(false)

  // ── Add payment form ─────────────────────────────────────────────────────
  const [showForm,    setShowForm]    = useState(false)
  const [amount,      setAmount]      = useState("")
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [paymentMode, setPaymentMode] = useState("upi")
  const [invoiceId,   setInvoiceId]   = useState("none")
  const [notes,       setNotes]       = useState("")
  const [submitting,  setSubmitting]  = useState(false)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [err,         setErr]         = useState("")

  useEffect(() => {
    if (open && customer) {
      refreshCustomerPayments(customer.id)
      setEditingTotal(false)
      setTotalIn((customer as any).dealValue != null ? String((customer as any).dealValue) : "")
      setShowForm(false)
      setAmount("")
      setPaymentDate(todayISO())
      setPaymentMode("upi")
      setInvoiceId("none")
      setNotes("")
      setErr("")
    }
  }, [open, customer])

  const customerInvoices = useMemo(
    () => invoices.filter((i) => i.customerId === customer?.id),
    [invoices, customer]
  )

  const dealValue = (customer as any)?.dealValue as number | null | undefined
  // Paid/Due are derived server-side from this same payments list — sum
  // locally too so the dialog updates instantly without waiting on a refetch.
  const paidTotal = customerPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const due       = dealValue != null ? Math.max(dealValue - paidTotal, 0) : null

  if (!customer) return null

  const handleSaveTotal = async () => {
    const t = totalIn.trim() === "" ? null : Number(totalIn)
    if (t != null && (isNaN(t) || t < 0)) { setErr("Enter a valid total amount"); return }
    setErr("")
    setSavingTotal(true)
    await updateCustomer(customer.id, { dealValue: t } as any)
    setSavingTotal(false)
    setEditingTotal(false)
  }

  const handleSubmitPayment = async () => {
    setErr("")
    const amt = Number(amount)
    if (!amount || isNaN(amt) || amt <= 0) { setErr("Enter a valid payment amount"); return }
    if (!paymentDate) { setErr("Pick a payment date"); return }

    setSubmitting(true)
    try {
      const ok = await addCustomerPayment({
        customerId:  customer.id,
        amount:      amt,
        paymentDate,
        paymentMode,
        invoiceId:   invoiceId !== "none" ? invoiceId : undefined,
        notes:       notes.trim() || undefined,
      })
      if (ok) {
        setShowForm(false)
        setAmount(""); setNotes(""); setInvoiceId("none"); setPaymentDate(todayISO())
      } else {
        setErr("Failed to record payment")
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to record payment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this payment record? Paid/Due totals will be recalculated.")) return
    setDeletingId(id)
    try {
      await deleteCustomerPayment(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Receipt className="h-4.5 w-4.5 text-[#3A7AFE]" />
            Payment History — {customer.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            Every payment recorded here updates Paid / Due automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Summary — Total is editable, Paid/Due are derived */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Total</p>
            {editingTotal ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="number" min="0"
                  value={totalIn}
                  onChange={(e) => setTotalIn(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTotal(); if (e.key === "Escape") setEditingTotal(false) }}
                  className="w-20 h-7 text-sm border border-[#3A7AFE] rounded-lg px-1.5"
                />
                <button onClick={handleSaveTotal} disabled={savingTotal} className="h-6 w-6 rounded-md bg-[#3A7AFE] text-white flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingTotal(true)} className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#3A7AFE] group">
                {dealValue != null ? formatCurrency(dealValue) : "Set total"}
                <Pencil className="h-2.5 w-2.5 text-gray-300 group-hover:text-[#3A7AFE]" />
              </button>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Paid</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(paidTotal)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Due</p>
            <p className="text-sm font-bold text-amber-600">{due != null ? formatCurrency(due) : "—"}</p>
          </div>
        </div>

        {/* Payment list */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {customerPayments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No payments recorded yet.</p>
          ) : (
            customerPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{formatCurrency(p.amount)}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 flex-wrap">
                    <Calendar className="h-3 w-3" />{formatDate(p.paymentDate)}
                    <span>· {PAYMENT_MODES.find((m) => m.value === p.paymentMode)?.label ?? p.paymentMode}</span>
                    {p.invoiceNumber && <span>· {p.invoiceNumber}</span>}
                  </p>
                  {p.notes && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{p.notes}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Delete payment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add payment form */}
        {showForm ? (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Amount (₹)</Label>
                <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15000" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Link to Invoice (optional)</Label>
                <Select value={invoiceId} onValueChange={setInvoiceId}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {customerInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} ({inv.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl resize-none" placeholder="Phase 2 advance, paid via UPI..." />
            </div>
            {err && <p className="text-xs text-red-500">{err}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSubmitPayment} disabled={submitting} className="flex-1 rounded-xl bg-[#3A7AFE] hover:bg-[#2563EB]">
                {submitting ? "Saving..." : "Save Payment"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}