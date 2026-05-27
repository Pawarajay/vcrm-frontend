
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, MoreVertical, Edit, Trash2, Download,
  FileText, Clock, CheckCircle, AlertTriangle,
  ReceiptIndianRupee, RefreshCw, ChevronDown, X,
} from 'lucide-react';
import { useCRM } from '@/contexts/crm-context';
import { InvoiceDialog }       from './invoice-dialog';
import { InvoiceDetailDialog } from './invoice-detail-dialog';

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vcrm-backend.onrender.com';
  // process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const getLogoBase64 = async (): Promise<string> => {
  try {
    const res  = await fetch('/vasify-logo.jpeg');
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader      = new FileReader();
      reader.onloadend  = () => resolve(reader.result as string);
      reader.onerror    = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return ''; }
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; dot: string; text: string; border: string;
}> = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100',    dot: 'bg-gray-400',    text: 'text-gray-700',    border: 'border-gray-200'   },
  sent:      { label: 'Sent',      bg: 'bg-blue-100',    dot: 'bg-blue-500',    text: 'text-blue-800',    border: 'border-blue-200'   },
  pending:   { label: 'Pending',   bg: 'bg-yellow-100',  dot: 'bg-yellow-500',  text: 'text-yellow-800',  border: 'border-yellow-200' },
  paid:      { label: 'Paid',      bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'text-emerald-800', border: 'border-emerald-200'},
  overdue:   { label: 'Overdue',   bg: 'bg-red-100',     dot: 'bg-red-500',     text: 'text-red-800',     border: 'border-red-200'    },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100',   dot: 'bg-slate-400',   text: 'text-slate-600',   border: 'border-slate-200'  },
};
const getMeta = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG.draft;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
  `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (v: any) => {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Normalize both snake_case (DB) and camelCase (context) keys → camelCase
const normalizeInvoice = (inv: any) => ({
  ...inv,
  id:              inv.id,
  invoiceNumber:   inv.invoice_number   ?? inv.invoiceNumber   ?? '',
  customerId:      inv.customer_id      ?? inv.customerId      ?? '',
  customerName:    inv.customer_name    ?? inv.customerName    ?? '',
  customerEmail:   inv.customer_email   ?? inv.customerEmail   ?? '',
  customerPhone:   inv.customer_phone   ?? inv.customerPhone   ?? '',
  customerCompany: inv.customer_company ?? inv.customerCompany ?? '',
  customerAddress: inv.customer_address ?? inv.customerAddress ?? '',
  amount:          Number(inv.amount    ?? 0),
  tax:             Number(inv.tax       ?? 18),
  total:           Number(inv.total     ?? 0),
  status:          inv.status           ?? 'draft',
  issueDate:       inv.issue_date       ?? inv.issueDate       ?? null,
  dueDate:         inv.due_date         ?? inv.dueDate         ?? null,
  paidDate:        inv.paid_date        ?? inv.paidDate        ?? null,
  notes:           inv.notes            ?? '',
  poNumber:        inv.po_number        ?? inv.poNumber        ?? '',
  terms:           inv.terms            ?? 'due_on_receipt',
  placeOfSupply:   inv.place_of_supply  ?? inv.placeOfSupply   ?? 'Maharashtra (27)',
  isRecurring:     !!(inv.is_recurring  ?? inv.isRecurring),
  recurringFrequency: inv.recurring_frequency ?? inv.recurringFrequency ?? null,
  recurringCycles:    inv.recurring_cycles    ?? inv.recurringCycles    ?? null,
  recurringStartDate: inv.recurring_start_date ?? inv.recurringStartDate ?? null,
  recurringEndDate:   inv.recurring_end_date   ?? inv.recurringEndDate   ?? null,
  items: Array.isArray(inv.items) ? inv.items : [],
});

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white
            ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ open, invoiceNumber, onConfirm, onCancel, loading }: {
  open: boolean; invoiceNumber: string;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Delete Invoice?</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{' '}
            <span className="font-bold text-gray-800">{invoiceNumber}</span>?
            This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold disabled:opacity-50 transition-colors">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline status dropdown ───────────────────────────────────────────────────

function InlineStatus({ invoice, onStatusChange }: {
  invoice: any;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [open,    setOpen]    = useState(false);
  const [current, setCurrent] = useState(invoice.status);
  const [saving,  setSaving]  = useState(false);
  const meta = getMeta(current);

  const change = async (s: string) => {
    if (s === current) { setOpen(false); return; }
    const prev = current;
    setCurrent(s);
    setOpen(false);
    setSaving(true);
    try { await onStatusChange(invoice.id, s); }
    catch { setCurrent(prev); }
    finally { setSaving(false); }
  };

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-opacity
          ${meta.bg} ${meta.text} ${meta.border}
          ${saving ? 'opacity-60 cursor-wait' : 'hover:opacity-80 cursor-pointer'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
        {meta.label}
        {saving
          ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent shrink-0 ml-0.5" />
          : <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-36">
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <button key={val} onClick={() => change(val)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 transition-colors">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────

function RowMenu({ onView, onEdit, onDelete, onDownload }: {
  onView: () => void; onEdit: () => void;
  onDelete: () => void; onDownload: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-44 text-sm">
            <button onClick={() => { setOpen(false); onView(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700">
              <FileText size={13} className="text-blue-500" /> View Details
            </button>
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700">
              <Edit size={13} className="text-indigo-500" /> Edit Invoice
            </button>
            <button onClick={() => { setOpen(false); onDownload(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700">
              <Download size={13} className="text-teal-500" /> Download PDF
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600">
              <Trash2 size={13} /> Delete Invoice
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, accent }: {
  title: string; value: string; sub: string;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-gray-900 leading-none truncate">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{sub}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function InvoicesContent() {

  // ── CRM Context ───────────────────────────────────────────────────────────
  const { invoices: rawInvoices, deleteInvoice, updateInvoice, refreshData } = useCRM();

  const invoices = useMemo(
    () => (Array.isArray(rawInvoices) ? rawInvoices : []).map(normalizeInvoice),
    [rawInvoices]
  );

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('');
  const [statusF,         setStatusF]         = useState('all');
  const [refreshing,      setRefreshing]      = useState(false);
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [detailOpen,      setDetailOpen]      = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [deleteTarget,    setDeleteTarget]    = useState<any>(null);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [toasts,          setToasts]          = useState<Toast[]>([]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refreshData(); } finally { setRefreshing(false); }
  }, [refreshData]);

  // ── Status change ─────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await updateInvoice(id, { status } as any, { status });
      showToast(`Status → ${getMeta(status).label}`);
    } catch {
      showToast('Failed to update status', 'error');
      throw new Error('revert');
    }
  }, [updateInvoice, showToast]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deleteTarget.id);
      showToast('Invoice deleted');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete invoice', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteInvoice, showToast]);

  // ── PDF Download ──────────────────────────────────────────────────────────
  // FIX: changed localStorage.getItem('token') → localStorage.getItem('auth_token')
  // to match the key written by setAuthToken() in lib/api.ts
  const handleDownload = useCallback(async (inv: any) => {
    showToast('Generating PDF…');
    try {
      const token      = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || '') : '';
      const logoBase64 = await getLogoBase64();
      const res = await fetch(`${BACKEND_URL}/api/invoices/${inv.id}/download`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ logoBase64 }),
      });
      if (!res.ok) { showToast('PDF generation failed', 'error'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), {
        href: url, download: `invoice-${inv.invoiceNumber || inv.id}.pdf`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('PDF downloaded ✓');
    } catch (err) {
      console.error('PDF download error:', err);
      showToast('Error downloading PDF', 'error');
    }
  }, [showToast]);

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const openCreate = () => { setSelectedInvoice(null); setDialogOpen(true); };
  const openEdit   = (inv: any) => { setSelectedInvoice(inv); setDialogOpen(true); setDetailOpen(false); };
  const openDetail = (inv: any) => { setSelectedInvoice(inv); setDetailOpen(true); };

  const handleSaved = useCallback(async () => {
    showToast(selectedInvoice ? 'Invoice updated ✓' : 'Invoice created ✓');
    await refreshData();
  }, [selectedInvoice, showToast, refreshData]);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!invoices.length) return;
    const headers = ['Invoice #','Customer','Amount','Tax %','Total','Status','Issue Date','Due Date'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber, inv.customerName,
      Number(inv.amount).toFixed(2), Number(inv.tax),
      Number(inv.total).toFixed(2), inv.status,
      inv.issueDate || '', inv.dueDate || '',
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url, download: `vasify-invoices-${new Date().toISOString().slice(0,10)}.csv`,
    }).click();
    URL.revokeObjectURL(url);
    showToast('CSV exported ✓');
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter(inv =>
      (!q || inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q))
      && (statusF === 'all' || inv.status === statusF)
    );
  }, [invoices, search, statusF]);

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return invoices.reduce(
      (acc, inv) => {
        const total = Number(inv.total || 0);
        if (inv.status === 'pending' || inv.status === 'sent') acc.pending += total;
        if (inv.status === 'paid') {
          const ref = inv.paidDate ? new Date(inv.paidDate)
            : inv.issueDate ? new Date(inv.issueDate) : null;
          if (ref && ref >= monthStart) acc.collectedMonth += total;
        }
        if (inv.status !== 'paid' && inv.status !== 'cancelled'
          && inv.dueDate && new Date(inv.dueDate) < now) {
          acc.overdue += total;
          acc.overdueCount++;
        }
        return acc;
      },
      { pending: 0, collectedMonth: 0, overdue: 0, overdueCount: 0 }
    );
  }, [invoices]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      <DeleteModal
        open={!!deleteTarget}
        invoiceNumber={deleteTarget?.invoiceNumber ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-900 rounded-xl">
            <ReceiptIndianRupee size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500">Billing &amp; Payment Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing} title="Refresh"
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExportCSV} disabled={!invoices.length}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Pending"        value={fmtCurrency(stats.pending)}
          sub="Awaiting payment"
          icon={<Clock size={18} className="text-amber-600" />} accent="bg-amber-50" />
        <KpiCard title="Collected This Month" value={fmtCurrency(stats.collectedMonth)}
          sub="Received in current month"
          icon={<CheckCircle size={18} className="text-emerald-600" />} accent="bg-emerald-50" />
        <KpiCard title="Overdue"              value={fmtCurrency(stats.overdue)}
          sub={`${stats.overdueCount} invoice${stats.overdueCount !== 1 ? 's' : ''} past due`}
          icon={<AlertTriangle size={18} className="text-red-600" />} accent="bg-red-50" />
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text" placeholder="Search invoice # or customer…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-white focus:border-blue-400 focus:outline-none h-9">
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
          <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 ml-auto">
            {filtered.length} of {invoices.length}
          </span>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FileText size={28} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-500">
              {search || statusF !== 'all' ? 'No invoices match your filters.' : 'No invoices yet.'}
            </p>
            {!search && statusF === 'all' && (
              <button onClick={openCreate}
                className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 font-semibold transition-colors">
                Create First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-3 pl-5 pr-3">Invoice #</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-3 px-3">Customer</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wide py-3 px-3">Amount</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-3 px-3">Status</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-3 px-3">Issue Date</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-3 px-3">Due Date</th>
                  <th className="w-[120px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => {
                  const isOverdue = inv.status !== 'paid' && inv.status !== 'cancelled'
                    && inv.dueDate && new Date(inv.dueDate) < new Date();

                  return (
                    <tr key={inv.id} onDoubleClick={() => openDetail(inv)}
                      className={`transition-colors cursor-pointer
                        ${isOverdue ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50/60'}`}
                    >
                      {/* Invoice # */}
                      <td className="pl-5 pr-3 py-3">
                        <div className="flex items-center gap-2">
                          {isOverdue && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
                          <span className="font-mono font-bold text-gray-800">{inv.invoiceNumber || '—'}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-white">
                              {(inv.customerName || 'C').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                            {inv.customerName || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{fmtCurrency(inv.total)}</div>
                        <div className="text-[10px] text-gray-400">incl. GST</div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <InlineStatus invoice={inv} onStatusChange={handleStatusChange} />
                      </td>

                      {/* Issue Date */}
                      <td className="px-3 py-3 text-gray-500">{fmtDate(inv.issueDate)}</td>

                      {/* Due Date */}
                      <td className="px-3 py-3">
                        <div className={`font-semibold text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {fmtDate(inv.dueDate)}
                        </div>
                        {isOverdue && <div className="text-[10px] font-bold text-red-500 mt-0.5">Overdue</div>}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                            <button title="Mark as Paid"
                              onClick={() => handleStatusChange(inv.id, 'paid')}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button title="Edit" onClick={() => openEdit(inv)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit size={15} />
                          </button>
                          <button title="Download PDF" onClick={() => handleDownload(inv)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                            <Download size={15} />
                          </button>
                          <RowMenu
                            onView={() => openDetail(inv)}
                            onEdit={() => openEdit(inv)}
                            onDelete={() => setDeleteTarget(inv)}
                            onDownload={() => handleDownload(inv)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <InvoiceDialog
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={o => { setDialogOpen(o); if (!o) setSelectedInvoice(null); }}
        onSaved={handleSaved}
      />
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={detailOpen}
        onOpenChange={o => { setDetailOpen(o); if (!o) setSelectedInvoice(null); }}
        onEditInvoice={openEdit}
        onDownloadInvoice={handleDownload}
        onSendInvoice={inv => showToast(`Reminder queued for ${inv.invoiceNumber}`)}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}