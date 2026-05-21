"use client"

import { useEffect, useMemo, useState } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, TrendingDown, Activity, Users,
  UserPlus, IndianRupee, Clock, RefreshCw,
  AlertCircle, CheckCircle, Phone, Target,
} from "lucide-react"

// ─── Design System ────────────────────────────────────────────────────────────
// Primary: #3A7AFE | Success: #22C55E | Background: #F8FAFC | No gradients

const SVC: Record<string, string> = {
  website:        "Website",
  whatsapp:       "WhatsApp",
  lms:            "LMS",
  crm:            "CRM",
  "social-media": "Social Media",
  other:          "Other",
}

const SVC_FULL: Record<string, string> = {
  website:        "Website Development",
  whatsapp:       "WhatsApp Automation",
  lms:            "LMS Platform",
  crm:            "CRM Solution",
  "social-media": "Social Media Management",
  other:          "Other",
}

const SRC_C: Record<string, string> = {
  "whatsapp":        "#22C55E",
  "booking-engine":  "#3A7AFE",
  "website":         "#06B6D4",
  "manual":          "#94A3B8",
  "referral":        "#F59E0B",
  "other":           "#C084FC",
}

const SRC_L: Record<string, string> = {
  "whatsapp":        "WhatsApp",
  "booking-engine":  "Booking",
  "website":         "Website",
  "manual":          "Manual",
  "referral":        "Referral",
  "other":           "Other",
}

const PIPELINE_STAGES = [
  { key: "qualified-lead",  label: "New Leads",   color: "#3A7AFE" },
  { key: "free-inspection", label: "Qualified",   color: "#8B5CF6" },
  { key: "quotation",       label: "Proposal",    color: "#F59E0B" },
  { key: "installation",    label: "Converted",   color: "#22C55E" },
  { key: "closed",          label: "Closed",      color: "#94A3B8" },
]

const PERIOD_OPTIONS = [
  { label: "Last 7 days",  days: 7  },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
]

const fmtCur = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000)   return `₹${Math.round(v / 1000)}k`
  return `₹${v}`
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function BarChart({
  data, labels, colors, height = 160, grouped = false,
}: {
  data: number[] | number[][]
  labels: string[]
  colors?: string[]
  height?: number
  grouped?: boolean
}) {
  const W = 480
  const padL = 30, padR = 8, padT = 10, padB = 28
  const iW = W - padL - padR
  const iH = height - padT - padB

  const datasets = grouped ? (data as number[][]) : [(data as number[])]
  const allVals  = datasets.flat()
  const max      = Math.max(...allVals, 1)
  const n        = labels.length
  const ds       = datasets.length
  const slotW    = iW / n
  const gap      = slotW * 0.2
  const bW       = (slotW - gap) / ds
  const bGap     = bW * 0.08

  const yTicks = [0, Math.ceil(max / 2), max]
  const clrs   = colors ?? ["#3A7AFE", "#22C55E", "#8B5CF6"]

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {yTicks.map((t, i) => {
        const y = padT + iH - (t / max) * iH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={i > 0 ? "3,3" : ""} />
            <text x={padL - 3} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{t}</text>
          </g>
        )
      })}
      {labels.map((l, i) => (
        <text key={i} x={padL + i * slotW + slotW / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#94A3B8">{l}</text>
      ))}
      {datasets.map((ds_data, di) =>
        ds_data.map((v, i) => {
          const bH  = v === 0 ? 0 : Math.max((v / max) * iH, 3)
          const x   = padL + i * slotW + gap / 2 + di * (bW + bGap)
          const y   = padT + iH - bH
          const bw  = bW - bGap
          return (
            <g key={`${di}-${i}`}>
              <rect x={x} y={padT} width={bw} height={iH} rx="2" fill="#F8FAFC" />
              {v > 0 && <rect x={x} y={y} width={bw} height={bH} rx="3" fill={clrs[di]} opacity="0.85" />}
              {v > 0 && ds === 1 && (
                <text x={x + bw / 2} y={y - 3} textAnchor="middle" fontSize="9" fill={clrs[di]} fontWeight="600">{v}</text>
              )}
            </g>
          )
        })
      )}
      <line x1={padL} y1={padT} x2={padL} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
      <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  )
}

// ─── SVG Horizontal Bar Chart ─────────────────────────────────────────────────

function HorizBarChart({ items, color = "#3A7AFE" }: {
  items: { label: string; value: number; sub?: string }[]
  color?: string
}) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 truncate max-w-[180px]">{item.label}</span>
            <span className="text-xs font-semibold text-gray-800 ml-2 shrink-0">{item.sub ?? item.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({ segments, size = 120 }: {
  segments: { label: string; value: number; color: string }[]
  size?: number
}) {
  const cx = size / 2, cy = size / 2
  const r = size * 0.35, sw = size * 0.16
  const total = segments.reduce((s, x) => s + x.value, 0)

  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={sw} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#94A3B8">No data</text>
    </svg>
  )

  let angle = -Math.PI / 2
  const slices = segments.map(seg => {
    const a = (seg.value / total) * 2 * Math.PI
    const sa = angle, ea = angle + a; angle = ea
    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa)
    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea)
    return {
      ...seg,
      path: a >= 2 * Math.PI - 0.001
        ? `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.001} ${cy}`
        : `M ${x1} ${y1} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2}`,
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((sl, i) => (
        <path key={i} d={sl.path} fill="none" stroke={sl.color} strokeWidth={sw} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 5}  textAnchor="middle" fontSize="15" fontWeight="700" fill="#1E293B">{total}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9"  fill="#94A3B8">total</text>
    </svg>
  )
}

// ─── KPI Insight Card ─────────────────────────────────────────────────────────

function InsightKpiCard({ icon, iconBg, label, value, badge, badgeCls, insight }: {
  icon: React.ReactNode; iconBg: string; label: string
  value: string; badge?: string; badgeCls?: string; insight: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-none mb-2">{value}</p>
      {badge && (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3 ${badgeCls}`}>
          {badge}
        </span>
      )}
      <div className="border-t border-gray-50 pt-3">
        <p className="text-xs text-gray-400 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ title, subtitle, children, topRight, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode
  topRight?: React.ReactNode; className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {topRight}
      </div>
      {children}
    </div>
  )
}

// ─── Stat Strip ───────────────────────────────────────────────────────────────

function StatStrip({ stats }: { stats: { label: string; value: string | number }[] }) {
  return (
    <div className="flex border border-gray-100 rounded-xl overflow-hidden mb-4">
      {stats.map((s, i) => (
        <div key={i} className={`flex-1 px-3 py-2.5 text-center ${i > 0 ? "border-l border-gray-100" : ""}`}>
          <p className="text-sm font-bold text-gray-900">{s.value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriBadge({ p }: { p: string }) {
  const cls: Record<string, string> = {
    high:   "bg-red-50 text-red-600",
    medium: "bg-amber-50 text-amber-700",
    low:    "bg-gray-50 text-gray-500",
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls[p] ?? cls.medium}`}>
      {p}
    </span>
  )
}

// ─── Stage Badge ──────────────────────────────────────────────────────────────

function StageBadge({ s }: { s: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "qualified-lead":  { label: "New",      cls: "bg-blue-50 text-blue-700"     },
    "free-inspection": { label: "Qualified", cls: "bg-violet-50 text-violet-700" },
    "quotation":       { label: "Proposal",  cls: "bg-amber-50 text-amber-700"  },
    "installation":    { label: "Converted", cls: "bg-green-50 text-green-700"  },
    "closed":          { label: "Closed",    cls: "bg-gray-50 text-gray-500"    },
  }
  const cfg = map[s] ?? map["qualified-lead"]
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportsContent() {
  const {
    customers, leads, invoices = [], isLoading,
    refreshCustomers, refreshLeads, refreshInvoices,
  } = useCRM()

  const [periodIdx, setPeriodIdx] = useState(1)
  const period = PERIOD_OPTIONS[periodIdx]

  useEffect(() => {
    void Promise.all([refreshCustomers(), refreshLeads(), refreshInvoices()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Period window ───────────────────────────────────────────────────────────
  const { periodStart, prevStart, prevEnd } = useMemo(() => {
    const now = new Date()
    const pS  = new Date(now); pS.setDate(now.getDate() - period.days)
    const prE = new Date(pS)
    const prS = new Date(pS); prS.setDate(prS.getDate() - period.days)
    return { periodStart: pS, prevStart: prS, prevEnd: prE }
  }, [period.days])

  const inPeriod = (v: unknown) => {
    const d = new Date(v as string)
    return !isNaN(d.getTime()) && d >= periodStart && d <= new Date()
  }
  const inPrev = (v: unknown) => {
    const d = new Date(v as string)
    return !isNaN(d.getTime()) && d >= prevStart && d < prevEnd
  }
  const pct = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : +((c - p) / p * 100).toFixed(1)

  // ── Top KPI Metrics ─────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalLeads    = leads.length
    const converted     = leads.filter(l => l.status === "installation" || l.isConverted).length
    const convRate      = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

    const prevLeads     = leads.filter(l => inPrev(l.createdAt))
    const prevConverted = prevLeads.filter(l => l.status === "installation" || l.isConverted).length
    const prevConvRate  = prevLeads.length > 0 ? (prevConverted / prevLeads.length) * 100 : 0
    const convTrend     = prevConvRate === 0 ? 0 : +(convRate - prevConvRate).toFixed(1)

    const curRev  = invoices.filter(i => inPeriod((i as any).issueDate ?? i.createdAt) && i.status !== "cancelled")
      .reduce((s, i) => s + (Number((i as any).total) || 0), 0)
    const prevRev = invoices.filter(i => inPrev((i as any).issueDate ?? i.createdAt) && i.status !== "cancelled")
      .reduce((s, i) => s + (Number((i as any).total) || 0), 0)
    const revGrowth = pct(curRev, prevRev)

    const activeClients = customers.filter(c => c.status !== "inactive").length
    const lpRatio = totalLeads > 0 ? Math.round((activeClients / totalLeads) * 100) : 0

    const srcConv: Record<string, { total: number; conv: number }> = {}
    leads.forEach(l => {
      const src = (l as any).source ?? "other"
      if (!srcConv[src]) srcConv[src] = { total: 0, conv: 0 }
      srcConv[src].total++
      if (l.status === "installation" || l.isConverted) srcConv[src].conv++
    })
    const bestSrc = Object.entries(srcConv)
      .filter(([, v]) => v.total >= 2)
      .sort((a, b) => (b[1].conv / b[1].total) - (a[1].conv / a[1].total))[0]

    const todayNoon = new Date(); todayNoon.setHours(0,0,0,0)
    const fuDue = leads.filter(l => {
      const fu = (l as any).follow_up_date; if (!fu) return false
      const d = new Date(fu); d.setHours(0,0,0,0)
      return d <= todayNoon && !["installation","closed"].includes(l.status as string)
    }).length

    const pipelineVal = leads
      .filter(l => !["installation","closed"].includes(l.status as string))
      .reduce((s, l) => s + (typeof l.estimatedValue === "number" ? l.estimatedValue : Number(l.estimatedValue ?? 0)), 0)

    return {
      convRate: convRate.toFixed(1), convTrend,
      convInsight: bestSrc
        ? `Best converting source: ${SRC_L[bestSrc[0]] ?? bestSrc[0]} at ${Math.round((bestSrc[1].conv / bestSrc[1].total) * 100)}%. Focus on qualifying inbound leads faster.`
        : `${convRate.toFixed(1)}% of leads become clients. Increase follow-up frequency to improve this.`,

      revGrowth, curRev,
      revInsight: curRev > 0
        ? `₹${(curRev / 100000).toFixed(1)}L collected this period. ${revGrowth >= 0 ? "Revenue is growing" : "Revenue dipped"} vs previous period.`
        : "No invoices collected yet this period. Prioritise closing open proposals.",

      lpRatio, activeClients,
      lpInsight: `${activeClients} active clients from ${totalLeads} total leads. Strengthen referral programs — they typically convert 3× better than other sources.`,

      fuDue, pipelineVal,
    }
  }, [customers, leads, invoices, periodStart, prevStart, prevEnd])

  // ── Service analysis ────────────────────────────────────────────────────────
  const svcKeys = ["website", "whatsapp", "lms", "crm", "social-media", "other"]

  const svcLeadData = useMemo(() =>
    svcKeys.map(k => leads.filter(l => (l as any).service === k).length)
  , [leads])

  const svcConvData = useMemo(() =>
    svcKeys.map(k => leads.filter(l => (l as any).service === k && (l.status === "installation" || l.isConverted)).length)
  , [leads])

  const svcLabels = svcKeys.map(k => SVC[k])

  // ── Source distribution ─────────────────────────────────────────────────────
  const sourceSegs = useMemo(() => {
    const map: Record<string, number> = {}
    leads.forEach(l => {
      const k = (l as any).source ?? "other"
      map[k] = (map[k] ?? 0) + 1
    })
    return Object.entries(map)
      .map(([k, v]) => ({ label: SRC_L[k] ?? k, value: v, color: SRC_C[k] ?? "#94A3B8", key: k }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  const srcTotal = sourceSegs.reduce((s, x) => s + x.value, 0)

  // ── Monthly lead volume ─────────────────────────────────────────────────────
  const { monthData, monthLabels } = useMemo(() => {
    const now = new Date()
    const labels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return d.toLocaleDateString("en-IN", { month: "short" })
    })
    const data = Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const e = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
      return leads.filter(l => {
        const d = new Date((l as any).created_at ?? l.createdAt ?? 0)
        return d >= m && d <= e
      }).length
    })
    return { monthData: data, monthLabels: labels }
  }, [leads])

  // ── Funnel data ─────────────────────────────────────────────────────────────
  const funnelData = useMemo(() =>
    PIPELINE_STAGES.map(s => ({
      ...s,
      count: leads.filter(l => l.status === s.key).length,
    }))
  , [leads])
  const maxFunnel = Math.max(...funnelData.map(s => s.count), 1)

  // ── Lead priority breakdown ─────────────────────────────────────────────────
  const fuOutcome = useMemo(() => {
    const high   = leads.filter(l => l.priority === "high"   && !["installation","closed"].includes(l.status as string)).length
    const medium = leads.filter(l => l.priority === "medium" && !["installation","closed"].includes(l.status as string)).length
    const low    = leads.filter(l => l.priority === "low"    && !["installation","closed"].includes(l.status as string)).length
    const closed = leads.filter(l => l.status === "closed").length
    return [
      { label: "High priority (hot)",    value: high,   color: "#EF4444" },
      { label: "Medium priority (warm)", value: medium, color: "#F59E0B" },
      { label: "Low priority (cold)",    value: low,    color: "#94A3B8" },
      { label: "Closed / lost",          value: closed, color: "#6B7280" },
    ].filter(i => i.value > 0)
  }, [leads])

  // ── Client service breakdown ────────────────────────────────────────────────
  const svcBreakdown = useMemo(() => {
    const map: Record<string, { count: number; rev: number }> = {}
    customers.forEach(c => {
      const k = (c as any).service ?? "other"
      if (!map[k]) map[k] = { count: 0, rev: 0 }
      map[k].count++
      map[k].rev += typeof (c as any).totalValue === "number" ? (c as any).totalValue : 0
    })
    return Object.entries(map)
      .map(([k, v]) => ({
        label: SVC_FULL[k] ?? k,
        count: v.count,
        rev: v.rev,
        pct: Math.round((v.count / (customers.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }, [customers])

  // ── Top leads by value ──────────────────────────────────────────────────────
  const topLeads = useMemo(() =>
    [...leads]
      .filter(l => !["installation","closed"].includes(l.status as string))
      .sort((a, b) => {
        const av = typeof a.estimatedValue === "number" ? a.estimatedValue : Number(a.estimatedValue ?? 0)
        const bv = typeof b.estimatedValue === "number" ? b.estimatedValue : Number(b.estimatedValue ?? 0)
        return bv - av
      })
      .slice(0, 8)
  , [leads])

  // ── Pipeline summary stats ──────────────────────────────────────────────────
  const pipelineStats = useMemo(() => {
    const open    = leads.filter(l => !["installation","closed"].includes(l.status as string))
    const pipeVal = open.reduce((s, l) => s + (typeof l.estimatedValue === "number" ? l.estimatedValue : Number(l.estimatedValue ?? 0)), 0)
    const avgVal  = open.length > 0 ? Math.round(pipeVal / open.length) : 0
    return { total: leads.length, open: open.length, pipeVal, avgVal }
  }, [leads])

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="max-w-[1400px] mx-auto space-y-5 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}</div>
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl" />)}</div>
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl" />)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Reports &amp; Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Actionable insights for Vasifytech</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {PERIOD_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPeriodIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    periodIdx === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline" size="sm"
              className="rounded-xl border-gray-200 text-gray-600 text-xs gap-1.5"
              onClick={() => void Promise.all([refreshCustomers(), refreshLeads(), refreshInvoices()])}
            >
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* ── Row 1: 3 Insight KPI Cards ──────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <InsightKpiCard
            icon={<Target className="h-4 w-4 text-[#0369A1]" />}
            iconBg="bg-sky-50"
            label="Lead → client conversion rate"
            value={`${metrics.convRate}%`}
            badge={`${metrics.convTrend >= 0 ? "↑ +" : "↓ "}${Math.abs(metrics.convTrend).toFixed(1)}% vs prev period`}
            badgeCls={metrics.convTrend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}
            insight={metrics.convInsight}
          />
          <InsightKpiCard
            icon={<IndianRupee className="h-4 w-4 text-[#15803D]" />}
            iconBg="bg-green-50"
            label="Revenue growth vs previous period"
            value={`${metrics.revGrowth >= 0 ? "+" : ""}${metrics.revGrowth}%`}
            badge={metrics.revGrowth > 0 ? `↑ Growing` : metrics.revGrowth < 0 ? "↓ Declining" : "Flat"}
            badgeCls={metrics.revGrowth > 0 ? "bg-green-50 text-green-700" : metrics.revGrowth < 0 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}
            insight={metrics.revInsight}
          />
          <InsightKpiCard
            icon={<Users className="h-4 w-4 text-[#6D28D9]" />}
            iconBg="bg-violet-50"
            label="Lead → client ratio"
            value={`${metrics.lpRatio}%`}
            badge={`${metrics.activeClients} active clients`}
            badgeCls="bg-violet-50 text-violet-700"
            insight={metrics.lpInsight}
          />
        </div>

        {/* ── Row 2: Leads vs Conversions by service + Source donut ────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
          <Card
            title="Leads vs conversions by service type"
            subtitle="How each service performs across the funnel"
            topRight={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3A7AFE] inline-block" />Leads
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E] inline-block" />Conversions
                </span>
              </div>
            }
          >
            <div className="mt-3">
              {svcLeadData.every(v => v === 0) ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Activity className="h-6 w-6 mb-1.5 opacity-30" />
                  <p className="text-xs">No service data yet</p>
                </div>
              ) : (
                <BarChart
                  data={[svcLeadData, svcConvData]}
                  labels={svcLabels}
                  colors={["#3A7AFE", "#22C55E"]}
                  height={180}
                  grouped
                />
              )}
            </div>
          </Card>

          <Card title="Lead source performance" subtitle="Leads by channel with share %">
            <div className="flex justify-center mt-3 mb-4">
              <DonutChart segments={sourceSegs} size={120} />
            </div>
            <div className="space-y-2">
              {sourceSegs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No leads yet</p>
              ) : (
                sourceSegs.map((seg, i) => {
                  const p = srcTotal > 0 ? Math.round((seg.value / srcTotal) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-xs text-gray-600 flex-1 truncate">{seg.label}</span>
                        <span className="text-xs font-semibold text-gray-800 tabular-nums">{seg.value}</span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums min-w-[30px] text-center"
                          style={{ backgroundColor: `${seg.color}18`, color: seg.color }}
                        >
                          {p}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-4">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: seg.color }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* ── Row 3: Monthly bar + Funnel + Lead priority breakdown ────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card
            title="Monthly lead volume"
            subtitle="New leads per month — last 6 months"
            topRight={
              <span className="text-xs font-medium text-[#3A7AFE] bg-blue-50 px-2 py-0.5 rounded-full">
                {monthData.reduce((a, b) => a + b, 0)} total
              </span>
            }
          >
            <div className="mt-3">
              {monthData.every(v => v === 0) ? (
                <div className="flex flex-col items-center justify-center h-36 text-gray-400">
                  <UserPlus className="h-6 w-6 mb-1.5 opacity-30" />
                  <p className="text-xs">No leads yet</p>
                </div>
              ) : (
                <BarChart data={monthData} labels={monthLabels} colors={["#3A7AFE"]} height={160} />
              )}
            </div>
          </Card>

          <Card title="Conversion funnel" subtitle="Stage-by-stage pipeline with drop-off">
            <div className="mt-3 space-y-2.5">
              {funnelData.map((stage, idx) => {
                const prev  = idx > 0 ? funnelData[idx - 1].count : stage.count
                const drop  = prev > 0 && idx > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0
                const barW  = maxFunnel > 0 ? Math.max((stage.count / maxFunnel) * 100, stage.count > 0 ? 5 : 0) : 0
                return (
                  <div key={stage.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        {drop > 0 && <span className="text-[10px] font-semibold text-red-500">-{drop}%</span>}
                        <span className="text-xs font-bold text-gray-800 tabular-nums w-5 text-right">{stage.count}</span>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${barW}%`, backgroundColor: stage.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Overall conversion</span>
              <span className="text-sm font-bold text-gray-800">
                {funnelData[0]?.count > 0
                  ? `${((funnelData[3]?.count ?? 0) / funnelData[0].count * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
          </Card>

          <Card title="Lead priority breakdown" subtitle="Open leads by priority level">
            <div className="mt-4">
              {fuOutcome.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 text-gray-400">
                  <AlertCircle className="h-6 w-6 mb-1.5 opacity-30" />
                  <p className="text-xs">No open leads</p>
                </div>
              ) : (
                <HorizBarChart
                  items={fuOutcome.map(i => ({ label: i.label, value: i.value, sub: String(i.value) }))}
                  color="#3A7AFE"
                />
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Pending follow-ups</span>
              <span className={`text-sm font-bold ${metrics.fuDue > 0 ? "text-red-600" : "text-gray-800"}`}>
                {metrics.fuDue}
              </span>
            </div>
          </Card>
        </div>

        {/* ── Row 4: Top Leads table + Client service breakdown ──────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5">
          <Card title="Top leads by pipeline value" subtitle="Open leads ranked by estimated revenue">
            <StatStrip stats={[
              { label: "Total leads",    value: pipelineStats.total },
              { label: "Open pipeline",  value: pipelineStats.open },
              { label: "Pipeline value", value: pipelineStats.pipeVal > 0 ? fmtCur(pipelineStats.pipeVal) : "₹0" },
              { label: "Avg lead value", value: pipelineStats.avgVal > 0 ? fmtCur(pipelineStats.avgVal) : "₹0" },
            ]} />
            {topLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Users className="h-6 w-6 mb-1.5 opacity-30" />
                <p className="text-xs">No open leads</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-gray-400 font-semibold py-2 pr-3">Client / Lead</th>
                      <th className="text-left text-gray-400 font-semibold py-2 pr-3">Service</th>
                      <th className="text-left text-gray-400 font-semibold py-2 pr-3">Stage</th>
                      <th className="text-right text-gray-400 font-semibold py-2 pr-3">Est. value</th>
                      <th className="text-left text-gray-400 font-semibold py-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLeads.map((lead) => {
                      const val = typeof lead.estimatedValue === "number" ? lead.estimatedValue : Number(lead.estimatedValue ?? 0)
                      const svc = (lead as any).service ?? ""
                      return (
                        <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-semibold text-[#3A7AFE] shrink-0">
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-[120px]">{lead.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-500">{SVC[svc] ?? svc ?? "—"}</td>
                          <td className="py-2.5 pr-3"><StageBadge s={lead.status as string} /></td>
                          <td className="py-2.5 pr-3 text-right font-semibold text-gray-800">{val > 0 ? fmtCur(val) : "—"}</td>
                          <td className="py-2.5"><PriBadge p={lead.priority as string} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-5">
            <Card title="Clients by service type" subtitle="Distribution across all services">
              <div className="mt-3">
                {svcBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Users className="h-6 w-6 mb-1.5 opacity-30" />
                    <p className="text-xs">No clients yet</p>
                  </div>
                ) : (
                  <HorizBarChart
                    items={svcBreakdown.map(s => ({
                      label: s.label,
                      value: s.count,
                      sub: `${s.count} (${s.pct}%)`,
                    }))}
                    color="#22C55E"
                  />
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Total clients</span>
                <span className="text-sm font-bold text-gray-800">{customers.length}</span>
              </div>
            </Card>

            <Card title="Quick stats" subtitle="Period summary">
              <div className="mt-3 space-y-2.5">
                {[
                  {
                    icon: <UserPlus className="h-3.5 w-3.5 text-[#3A7AFE]" />,
                    bg: "bg-blue-50",
                    label: "Leads this period",
                    value: leads.filter(l => inPeriod(l.createdAt)).length,
                  },
                  {
                    icon: <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" />,
                    bg: "bg-green-50",
                    label: "New clients this period",
                    value: customers.filter(c => inPeriod(c.createdAt)).length,
                  },
                  {
                    icon: <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />,
                    bg: "bg-amber-50",
                    label: "Follow-ups pending",
                    value: metrics.fuDue,
                  },
                  {
                    icon: <IndianRupee className="h-3.5 w-3.5 text-[#8B5CF6]" />,
                    bg: "bg-violet-50",
                    label: "Open pipeline value",
                    value: metrics.pipelineVal > 0 ? fmtCur(metrics.pipelineVal) : "₹0",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`p-1.5 rounded-lg ${item.bg} shrink-0`}>{item.icon}</div>
                    <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800 shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}