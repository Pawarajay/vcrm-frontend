

// "use client"

// import { useEffect, useMemo } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import { Button } from "@/components/ui/button"
// import {
//   Users, UserPlus, Clock, Activity,
//   TrendingUp, TrendingDown,
//   Phone, AlertCircle, FileText, RefreshCw,
//   IndianRupee, CheckCircle2, Bell,
// } from "lucide-react"
// import { differenceInDays } from "date-fns"

// // ─── Design System ────────────────────────────────────────────────────────────
// // Primary: #3A7AFE | Success: #22C55E | Warning: #F59E0B
// // Danger: #EF4444  | Background: #F8FAFC | No gradients

// const SVC: Record<string, string> = {
//   website:          "Website",
//   whatsapp:         "WhatsApp",
//   lms:              "LMS",
//   crm:              "CRM",
//   "social-media":   "Social Media",
//   digital_marketing:"Digital Marketing",
//   mobile_app:       "Mobile App",
//   devops:           "DevOps",
//   admin_panel:      "Admin Panel",
//   other:            "Other",
// }

// const RETAINER_SVC: Record<string, string> = {
//   whatsapp:          "WhatsApp Automation",
//   website:           "Website Maintenance",
//   digital_marketing: "Digital Marketing",
//   crm:               "CRM Support",
//   lms:               "LMS Support",
//   mobile_app:        "Mobile App Maintenance",
//   admin_panel:       "Admin Panel Support",
//   devops:            "DevOps / Hosting",
//   other:             "Other",
// }

// const SRC_C: Record<string, string> = {
//   "whatsapp":       "#22C55E",
//   "booking-engine": "#3A7AFE",
//   "website":        "#06B6D4",
//   "manual":         "#94A3B8",
//   "referral":       "#F59E0B",
//   "other":          "#C084FC",
// }

// const SRC_L: Record<string, string> = {
//   "whatsapp":       "WhatsApp",
//   "booking-engine": "Booking",
//   "website":        "Website",
//   "manual":         "Manual",
//   "referral":       "Referral",
//   "other":          "Other",
// }

// const STAGES = [
//   { key: "lead",        label: "New Leads",    color: "#3A7AFE" },
//   { key: "demo",        label: "Demo",         color: "#8B5CF6" },
//   { key: "proposal",    label: "Proposal",     color: "#F59E0B" },
//   { key: "negotiation", label: "Negotiation",  color: "#06B6D4" },
//   { key: "won",         label: "Won",          color: "#22C55E" },
//   { key: "lost",        label: "Lost",         color: "#EF4444" },
// ]

// // ─── Retainer helpers (mirror retainer-content.tsx) ──────────────────────────

// const RENEWAL_WARN_DAYS  = 30
// const RENEWAL_ALERT_DAYS = 7

// const getClientName    = (r: any) => r?.clientName    ?? r?.client_name    ?? ""
// const getMonthlyAmount = (r: any) => Number(r?.monthlyAmount ?? r?.monthly_amount ?? 0)
// const getRenewalDate   = (r: any) => r?.renewalDate   ?? r?.renewal_date   ?? ""

// const getDaysToRenewal = (renewalDate: string): number => {
//   if (!renewalDate) return Infinity
//   const today   = new Date(); today.setHours(0, 0, 0, 0)
//   const renewal = new Date(renewalDate)
//   return differenceInDays(renewal, today)
// }

// const formatCurrency = (v: number) => {
//   if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
//   if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}k`
//   return `₹${v.toLocaleString("en-IN")}`
// }

// // ─── Shared helpers ───────────────────────────────────────────────────────────

// const timeAgo = (date: Date) => {
//   const m = Math.floor((Date.now() - date.getTime()) / 60000)
//   if (m < 1)  return "Just now"
//   if (m < 60) return `${m}m ago`
//   const h = Math.floor(m / 60)
//   if (h < 24) return `${h}h ago`
//   return `${Math.floor(h / 24)}d ago`
// }

// const fmtCur = (v: number) => {
//   if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
//   if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}k`
//   return `₹${v}`
// }

// // ─── SVG Line Chart ───────────────────────────────────────────────────────────

// function LineChart({ datasets, labels }: {
//   datasets: { data: number[]; color: string; label: string; dashed?: boolean }[]
//   labels: string[]
// }) {
//   const W = 500, H = 160
//   const padL = 28, padR = 8, padT = 10, padB = 26
//   const iW = W - padL - padR, iH = H - padT - padB
//   const allVals = datasets.flatMap(d => d.data)
//   const max = Math.max(...allVals, 1)
//   const n = labels.length
//   const gX = (i: number) => padL + (i / Math.max(n - 1, 1)) * iW
//   const gY = (v: number) => padT + iH - (v / max) * iH
//   const yTicks = [0, Math.ceil(max / 2), max]

//   return (
//     <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
//       <defs>
//         {datasets.map(ds => (
//           <linearGradient key={ds.color} id={`lg${ds.color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor={ds.color} stopOpacity="0.12" />
//             <stop offset="100%" stopColor={ds.color} stopOpacity="0.01" />
//           </linearGradient>
//         ))}
//       </defs>
//       {yTicks.map((t, i) => (
//         <g key={i}>
//           <line x1={padL} y1={gY(t)} x2={W - padR} y2={gY(t)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={i > 0 ? "3,3" : ""} />
//           <text x={padL - 3} y={gY(t) + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{t}</text>
//         </g>
//       ))}
//       {labels.map((l, i) => (
//         <text key={i} x={gX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94A3B8">{l}</text>
//       ))}
//       {datasets.map(ds => {
//         if (n < 2 || ds.data.every(v => v === 0)) return null
//         const pts = ds.data.map((v, i) => `${gX(i)},${gY(v)}`)
//         const pathD = `M${pts.join(" L")}`
//         const areaD = `M${gX(0)},${padT + iH} L${pts.join(" L")} L${gX(n - 1)},${padT + iH} Z`
//         return (
//           <g key={ds.color}>
//             {!ds.dashed && <path d={areaD} fill={`url(#lg${ds.color.replace("#","")})`} />}
//             <path d={pathD} fill="none" stroke={ds.color} strokeWidth="2"
//               strokeLinecap="round" strokeLinejoin="round"
//               strokeDasharray={ds.dashed ? "5,4" : undefined} />
//             {ds.data.map((v, i) => (
//               <circle key={i} cx={gX(i)} cy={gY(v)} r="3" fill="white" stroke={ds.color} strokeWidth="2" />
//             ))}
//           </g>
//         )
//       })}
//       <line x1={padL} y1={padT} x2={padL} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
//       <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
//     </svg>
//   )
// }

// // ─── SVG Bar Chart ────────────────────────────────────────────────────────────

// function BarChart({ data, labels, color = "#3A7AFE", height = 160 }: {
//   data: number[]; labels: string[]; color?: string; height?: number
// }) {
//   const W = 500
//   const padL = 28, padR = 8, padT = 10, padB = 26
//   const iW = W - padL - padR, iH = height - padT - padB
//   const max = Math.max(...data, 1)
//   const bW = iW / data.length
//   const gap = bW * 0.3
//   const yTicks = [0, Math.ceil(max / 2), max]

//   return (
//     <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
//       {yTicks.map((t, i) => {
//         const y = padT + iH - (t / max) * iH
//         return (
//           <g key={i}>
//             <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={i > 0 ? "3,3" : ""} />
//             <text x={padL - 3} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{t}</text>
//           </g>
//         )
//       })}
//       {data.map((v, i) => {
//         const bH = v === 0 ? 0 : Math.max((v / max) * iH, 3)
//         const x = padL + i * bW + gap / 2
//         const y = padT + iH - bH
//         const bw = bW - gap
//         return (
//           <g key={i}>
//             <rect x={x} y={padT} width={bw} height={iH} rx="2" fill="#F8FAFC" />
//             {v > 0 && <rect x={x} y={y} width={bw} height={bH} rx="3" fill={color} opacity="0.85" />}
//             <text x={x + bw / 2} y={height - padB + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">{labels[i]}</text>
//             {v > 0 && (
//               <text x={x + bw / 2} y={y - 3} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">{v}</text>
//             )}
//           </g>
//         )
//       })}
//       <line x1={padL} y1={padT} x2={padL} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
//       <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH} stroke="#E2E8F0" strokeWidth="1" />
//     </svg>
//   )
// }

// // ─── SVG Horizontal Bar Chart ─────────────────────────────────────────────────

// function HorizBarChart({ items, color = "#22C55E" }: {
//   items: { label: string; value: number }[]
//   color?: string
// }) {
//   const max = Math.max(...items.map(i => i.value), 1)
//   return (
//     <div className="space-y-2.5">
//       {items.map((item, i) => (
//         <div key={i}>
//           <div className="flex items-center justify-between mb-1">
//             <span className="text-xs text-gray-600 truncate max-w-[170px]">{item.label}</span>
//             <span className="text-xs font-semibold text-gray-700 ml-2 shrink-0">{item.value}</span>
//           </div>
//           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//             <div
//               className="h-full rounded-full transition-all duration-500"
//               style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0)}%`, backgroundColor: color }}
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// // ─── SVG Donut Chart ──────────────────────────────────────────────────────────

// function DonutChart({ segments, size = 130 }: {
//   segments: { label: string; value: number; color: string }[]
//   size?: number
// }) {
//   const cx = size / 2, cy = size / 2
//   const r = size * 0.35, sw = size * 0.15
//   const total = segments.reduce((s, x) => s + x.value, 0)

//   if (total === 0) return (
//     <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//       <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={sw} />
//       <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#94A3B8">No data</text>
//     </svg>
//   )

//   let angle = -Math.PI / 2
//   const slices = segments.map(seg => {
//     const a = (seg.value / total) * 2 * Math.PI
//     const sa = angle, ea = angle + a; angle = ea
//     const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa)
//     const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea)
//     return {
//       ...seg,
//       path: a >= 2 * Math.PI - 0.001
//         ? `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.001} ${cy}`
//         : `M ${x1} ${y1} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2}`,
//     }
//   })

//   return (
//     <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//       {slices.map((sl, i) => (
//         <path key={i} d={sl.path} fill="none" stroke={sl.color} strokeWidth={sw} strokeLinecap="butt" />
//       ))}
//       <text x={cx} y={cy - 5}  textAnchor="middle" fontSize="16" fontWeight="700" fill="#1E293B">{total}</text>
//       <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9"  fill="#94A3B8">leads</text>
//     </svg>
//   )
// }

// // ─── KPI Card ─────────────────────────────────────────────────────────────────

// function KpiCard({ icon, label, value, sub, trend, iconBg, alert }: {
//   icon: React.ReactNode; label: string; value: string | number
//   sub: string; trend?: number; iconBg: string; alert?: boolean
// }) {
//   const up = trend !== undefined && trend >= 0
//   return (
//     <div className={`bg-white rounded-2xl border ${alert ? "border-red-200" : "border-gray-100"} p-5 shadow-sm hover:shadow-md transition-shadow`}>
//       <div className="flex items-start justify-between mb-3">
//         <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
//         {trend !== undefined && (
//           <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
//             {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
//             {up ? "+" : ""}{Math.abs(trend).toFixed(1)}%
//           </span>
//         )}
//       </div>
//       <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
//       <p className={`text-2xl font-bold mb-1 ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
//       <p className="text-xs text-gray-400">{sub}</p>
//     </div>
//   )
// }

// // ─── Priority Action Card ─────────────────────────────────────────────────────

// function PriorityCard({ icon, iconBg, borderCls, label, value, desc, ctaLabel, ctaCls, onCta }: {
//   icon: React.ReactNode; iconBg: string; borderCls: string
//   label: string; value: number; desc: string
//   ctaLabel: string; ctaCls: string; onCta?: () => void
// }) {
//   return (
//     <div className={`bg-white rounded-2xl border-2 ${borderCls} p-4 flex flex-col gap-3`}>
//       <div className="flex items-start gap-3">
//         <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>{icon}</div>
//         <div className="min-w-0">
//           <p className={`text-2xl font-bold leading-none ${value === 0 ? "text-gray-300" : "text-gray-900"}`}>{value}</p>
//           <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
//           <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
//         </div>
//       </div>
//       <Button
//         size="sm"
//         onClick={onCta}
//         disabled={!onCta || value === 0}
//         className={`w-full rounded-xl text-xs font-semibold shadow-none ${value > 0 && onCta ? ctaCls : "bg-gray-100 text-gray-400 cursor-default"}`}
//       >
//         {ctaLabel} →
//       </Button>
//     </div>
//   )
// }

// // ─── Stat Box ─────────────────────────────────────────────────────────────────

// function StatBox({ value, label, color = "text-gray-900" }: {
//   value: string | number; label: string; color?: string
// }) {
//   return (
//     <div className="text-center">
//       <p className={`text-lg font-bold ${color}`}>{value}</p>
//       <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
//     </div>
//   )
// }

// // ─── Card wrapper ─────────────────────────────────────────────────────────────

// function Card({ title, subtitle, children, topRight }: {
//   title: string; subtitle?: string; children: React.ReactNode; topRight?: React.ReactNode
// }) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//       <div className="flex items-start justify-between mb-1">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
//           {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
//         </div>
//         {topRight}
//       </div>
//       {children}
//     </div>
//   )
// }

// // ─── Retainer KPI Card (styled to match existing KpiCard) ────────────────────

// function RetainerKpiCard({ icon, label, value, sub, iconBg, alert }: {
//   icon: React.ReactNode; label: string; value: string | number
//   sub: string; iconBg: string; alert?: boolean
// }) {
//   return (
//     <div className={`bg-white rounded-2xl border ${alert ? "border-red-200" : "border-gray-100"} p-5 shadow-sm hover:shadow-md transition-shadow`}>
//       <div className="flex items-start justify-between mb-3">
//         <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
//       </div>
//       <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
//       <p className={`text-2xl font-bold mb-1 ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
//       <p className="text-xs text-gray-400">{sub}</p>
//     </div>
//   )
// }

// // ─── Upcoming Retainer Renewals mini-list ─────────────────────────────────────

// function RetainerRenewalsList({
//   retainers,
//   onNavigate,
// }: {
//   retainers: any[]
//   onNavigate?: (page: string) => void
// }) {
//   const upcoming = useMemo(() => {
//     return retainers
//       .filter((r) => r.status === "active" || r.status !== "inactive")
//       .map((r) => ({ ...r, _days: getDaysToRenewal(getRenewalDate(r)) }))
//       .filter((r) => r._days <= RENEWAL_WARN_DAYS)
//       .sort((a, b) => a._days - b._days)
//       .slice(0, 5)
//   }, [retainers])

//   if (upcoming.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8 text-gray-300">
//         <CheckCircle2 className="h-8 w-8 mb-2 opacity-30" />
//         <p className="text-xs text-gray-400">No renewals due in 30 days</p>
//       </div>
//     )
//   }

//   return (
//     <div className="mt-3 space-y-2">
//       {upcoming.map((r) => {
//         const urgent = r._days < 0 || r._days <= RENEWAL_ALERT_DAYS
//         return (
//           <div
//             key={r.id}
//             className={`flex items-center gap-3 p-2.5 rounded-xl border ${urgent ? "border-red-100 bg-red-50/40" : "border-amber-100 bg-amber-50/30"}`}
//           >
//             <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
//               {getClientName(r).charAt(0).toUpperCase()}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-gray-800 truncate">{getClientName(r)}</p>
//               <p className="text-[10px] text-gray-400 truncate">
//                 {RETAINER_SVC[r.service] ?? r.service}
//               </p>
//             </div>
//             <div className="text-right shrink-0">
//               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgent ? "text-red-600 bg-red-50 border-red-200" : "text-amber-600 bg-amber-50 border-amber-200"}`}>
//                 {r._days < 0 ? `${Math.abs(r._days)}d overdue` : r._days === 0 ? "Today" : `${r._days}d`}
//               </span>
//               <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
//                 {formatCurrency(getMonthlyAmount(r))}
//               </p>
//             </div>
//           </div>
//         )
//       })}
//       <button
//         onClick={() => onNavigate?.("retainers")}
//         className="w-full text-center text-xs text-blue-500 hover:text-blue-700 font-medium mt-1 py-1"
//       >
//         View all retainers →
//       </button>
//     </div>
//   )
// }

// // ─── Data builders ────────────────────────────────────────────────────────────

// function buildWeekDays() {
//   return Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(); d.setDate(d.getDate() - (6 - i))
//     return d.toLocaleDateString("en-IN", { weekday: "short" })
//   })
// }

// function buildMonthLabels() {
//   const now = new Date()
//   return Array.from({ length: 6 }, (_, i) => {
//     const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
//     return d.toLocaleDateString("en-IN", { month: "short" })
//   })
// }

// // ─── Main Dashboard ───────────────────────────────────────────────────────────

// interface DashboardContentProps {
//   onNavigate?: (page: string) => void
// }

// export function DashboardContent({ onNavigate }: DashboardContentProps) {
//   const {
//     customers, leads, invoices = [], isLoading,
//     retainers = [],
//     refreshCustomers, refreshLeads, refreshInvoices, refreshRetainers,
//   } = useCRM() as any

//   const safeRetainers: any[] = Array.isArray(retainers) ? retainers : []

//   useEffect(() => {
//     void Promise.all([
//       refreshCustomers(),
//       refreshLeads(),
//       refreshInvoices(),
//       refreshRetainers?.(),
//     ])
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   // ── KPIs ─────────────────────────────────────────────────────────────────
//   const kpis = useMemo(() => {
//     const now       = new Date()
//     const monthAgo  = new Date(now); monthAgo.setDate(now.getDate() - 30)
//     const prevStart = new Date(now); prevStart.setDate(now.getDate() - 60)
//     const inCur  = (v: unknown) => { const d = new Date(v as string); return !isNaN(d.getTime()) && d >= monthAgo && d <= now }
//     const inPrev = (v: unknown) => { const d = new Date(v as string); return !isNaN(d.getTime()) && d >= prevStart && d < monthAgo }
//     const pct    = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : +((c - p) / p * 100).toFixed(1)

//     const active    = customers.filter((c: any) => c.status !== "inactive").length
//     const newCur    = customers.filter((c: any) => inCur(c.createdAt)).length
//     const newPrev   = customers.filter((c: any) => inPrev(c.createdAt)).length

//     const openLeads = leads.filter((l: any) => !["won","lost"].includes(l.status as string))
//     const lCur      = openLeads.filter((l: any) => inCur(l.createdAt)).length
//     const lPrev     = openLeads.filter((l: any) => inPrev(l.createdAt)).length
//     const todayStart = new Date(); todayStart.setHours(0,0,0,0)
//     const newToday  = leads.filter((l: any) => new Date((l as any).created_at ?? l.createdAt ?? 0) >= todayStart).length

//     const converted  = leads.filter((l: any) => l.status === "won" || l.isConverted).length
//     const convRate   = leads.length > 0 ? (converted / leads.length) * 100 : 0
//     const prevLeads  = leads.filter((l: any) => inPrev(l.createdAt))
//     const prevConv   = prevLeads.filter((l: any) => l.status === "won" || l.isConverted).length
//     const prevRate   = prevLeads.length > 0 ? (prevConv / prevLeads.length) * 100 : 0
//     const convTrend  = prevRate === 0 ? 0 : +((convRate - prevRate)).toFixed(1)

//     const todayNoon  = new Date(); todayNoon.setHours(0,0,0,0)
//     const fuDue = leads.filter((l: any) => {
//       const fu = (l as any).follow_up_date
//       if (!fu) return false
//       const d = new Date(fu); d.setHours(0,0,0,0)
//       return d <= todayNoon && !["won","lost"].includes(l.status as string)
//     }).length

//     const overdue = leads.filter((l: any) => {
//       const fu = (l as any).follow_up_date
//       if (!fu) return false
//       const d = new Date(fu); d.setHours(0,0,0,0)
//       const t = new Date(); t.setHours(0,0,0,0)
//       return d < t && !["won","lost"].includes(l.status as string)
//     }).length

//     return {
//       active, clientTrend: pct(newCur, newPrev), clientSub: `+${newCur} this month`,
//       openLeads: openLeads.length, leadTrend: pct(lCur, lPrev), leadSub: `${newToday} new today`,
//       convRate: convRate.toFixed(1) + "%", convTrend,
//       convSub: convRate >= 30 ? "Above 30% target" : "Below 30% target",
//       fuDue, overdue, fuSub: overdue > 0 ? `${overdue} overdue` : "All clear",
//     }
//   }, [customers, leads])

//   // ── Retainer KPIs ─────────────────────────────────────────────────────────
//   const retainerKpis = useMemo(() => {
//     const activeRetainers  = safeRetainers.filter((r) => r.status === "active")
//     const mrr              = activeRetainers.reduce((s, r) => s + getMonthlyAmount(r), 0)
//     const arr              = mrr * 12

//     const expiringSoon     = activeRetainers.filter((r) => {
//       const d = getDaysToRenewal(getRenewalDate(r))
//       return d >= 0 && d <= RENEWAL_WARN_DAYS
//     }).length

//     const urgentRenewals   = activeRetainers.filter((r) => {
//       const d = getDaysToRenewal(getRenewalDate(r))
//       return d >= 0 && d <= RENEWAL_ALERT_DAYS
//     }).length

//     const overdueRetainers = safeRetainers.filter((r) => {
//       const d = getDaysToRenewal(getRenewalDate(r))
//       return d < 0 && r.status !== "inactive"
//     }).length

//     return {
//       activeCount:   activeRetainers.length,
//       mrr,
//       arr,
//       expiringSoon,
//       urgentRenewals,
//       overdueRetainers,
//       mrrSub:        activeRetainers.length > 0
//         ? `${activeRetainers.length} active client${activeRetainers.length !== 1 ? "s" : ""}`
//         : "No active retainers",
//       renewalSub:    urgentRenewals > 0
//         ? `${urgentRenewals} due within 7 days`
//         : expiringSoon > 0 ? `${expiringSoon} due within 30 days` : "All renewals on track",
//     }
//   }, [safeRetainers])

//   // ── Priority action counts ────────────────────────────────────────────────
//   const priority = useMemo(() => {
//     const todayNoon = new Date(); todayNoon.setHours(0,0,0,0)
//     const todayStr  = new Date().toISOString().slice(0, 10)

//     const overdueFU = leads.filter((l: any) => {
//       const fu = (l as any).follow_up_date; if (!fu) return false
//       const d = new Date(fu); d.setHours(0,0,0,0)
//       return d < todayNoon && !["won","lost"].includes(l.status as string)
//     })
//     const hotNC = leads.filter((l: any) =>
//       l.priority === "high" && !["won","lost"].includes(l.status as string) && !(l as any).follow_up_date
//     )
//     const fuToday = leads.filter((l: any) => {
//       const fu = (l as any).follow_up_date; if (!fu) return false
//       return (fu as string).slice(0,10) === todayStr && !["won","lost"].includes(l.status as string)
//     })
//     const overdueInv = (invoices as any[]).filter((i: any) => i.status === "overdue")
//     const overdueAmt = overdueInv.reduce((s: number, i: any) => s + (Number((i as any).total) || 0), 0)
//     const toQualify  = leads.filter((l: any) => l.status === "lead" && !(l as any).next_action)

//     return { overdueFU, hotNC, fuToday, overdueInv, overdueAmt, toQualify }
//   }, [leads, invoices])

//   // ── Week chart data ───────────────────────────────────────────────────────
//   const weekData = useMemo(() => {
//     const now = new Date(); now.setHours(23,59,59,999)
//     const lPerDay: number[] = []
//     const cPerDay: number[] = []
//     for (let i = 6; i >= 0; i--) {
//       const s = new Date(now); s.setDate(now.getDate() - i); s.setHours(0,0,0,0)
//       const e = new Date(now); e.setDate(now.getDate() - i); e.setHours(23,59,59,999)
//       lPerDay.push(leads.filter((l: any) => { const d = new Date((l as any).created_at ?? l.createdAt ?? 0); return d >= s && d <= e }).length)
//       cPerDay.push(customers.filter((c: any) => { const d = new Date((c as any).created_at ?? c.createdAt ?? 0); return d >= s && d <= e }).length)
//     }
//     const wl = lPerDay.reduce((a, b) => a + b, 0)
//     const wc = cPerDay.reduce((a, b) => a + b, 0)
//     return { lPerDay, cPerDay, wl, wc, rate: wl > 0 ? Math.round((wc / wl) * 100) + "%" : "—" }
//   }, [leads, customers])

//   const weekLabels = useMemo(() => buildWeekDays(), [])

//   // ── Monthly bar data ──────────────────────────────────────────────────────
//   const monthData = useMemo(() => {
//     const now = new Date()
//     return Array.from({ length: 6 }, (_, i) => {
//       const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
//       const e = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
//       return leads.filter((l: any) => { const d = new Date((l as any).created_at ?? l.createdAt ?? 0); return d >= m && d <= e }).length
//     })
//   }, [leads])

//   const monthLabels = useMemo(() => buildMonthLabels(), [])

//   // ── Funnel ────────────────────────────────────────────────────────────────
//   const funnelData = useMemo(() => {
//     return STAGES.map(s => ({
//       ...s,
//       count: leads.filter((l: any) => l.status === s.key).length,
//     }))
//   }, [leads])

//   const maxFunnel = Math.max(...funnelData.map(s => s.count), 1)

//   // ── Source distribution ───────────────────────────────────────────────────
//   const sourceSegs = useMemo(() => {
//     const map: Record<string, number> = {}
//     leads.forEach((l: any) => {
//       const k = (l as any).source ?? "other"
//       map[k] = (map[k] ?? 0) + 1
//     })
//     return Object.entries(map)
//       .map(([k, v]) => ({ label: SRC_L[k] ?? k, value: v, color: SRC_C[k] ?? "#94A3B8" }))
//       .sort((a, b) => b.value - a.value)
//   }, [leads])

//   const srcTotal = sourceSegs.reduce((s, x) => s + x.value, 0)

//   // ── Service breakdown ─────────────────────────────────────────────────────
//   const svcItems = useMemo(() => {
//     const map: Record<string, number> = {}
//     customers.forEach((c: any) => { const k = (c as any).service ?? "other"; map[k] = (map[k] ?? 0) + 1 })
//     return Object.entries(map)
//       .map(([k, v]) => ({ label: SVC[k] ?? k, value: v }))
//       .sort((a, b) => b.value - a.value)
//   }, [customers])

//   // ── Retainer service breakdown ────────────────────────────────────────────
//   const retainerSvcItems = useMemo(() => {
//     const map: Record<string, number> = {}
//     safeRetainers
//       .filter((r) => r.status === "active")
//       .forEach((r) => {
//         const k = r.service ?? "other"
//         map[k] = (map[k] ?? 0) + 1
//       })
//     return Object.entries(map)
//       .map(([k, v]) => ({ label: RETAINER_SVC[k] ?? k, value: v }))
//       .sort((a, b) => b.value - a.value)
//   }, [safeRetainers])

//   // ── Recent activity ───────────────────────────────────────────────────────
//   const activity = useMemo(() => {
//     type Item = { id: string; type: "lead"|"client"; name: string; sub: string; svc?: string; time: Date }
//     const items: Item[] = [
//       ...leads.map((l: any) => ({
//         id: l.id, type: "lead" as const, name: l.name,
//         sub: `New lead · ${SRC_L[(l as any).source ?? ""] ?? (l as any).source ?? "—"}`,
//         svc: (l as any).service,
//         time: new Date((l as any).created_at ?? l.createdAt ?? 0),
//       })),
//       ...customers.map((c: any) => ({
//         id: c.id, type: "client" as const, name: c.name,
//         sub: "Lead converted to client",
//         svc: (c as any).service,
//         time: new Date((c as any).created_at ?? c.createdAt ?? 0),
//       })),
//     ]
//     return items.filter(i => !isNaN(i.time.getTime())).sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 7)
//   }, [leads, customers])

//   // ── Loading skeleton ──────────────────────────────────────────────────────
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] p-6">
//         <div className="max-w-[1400px] mx-auto space-y-5 animate-pulse">
//           <div className="h-8 w-48 bg-gray-200 rounded-xl" />
//           <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div>
//           <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div>
//           <div className="grid grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div>
//           <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-52 bg-gray-200 rounded-2xl" />)}</div>
//           <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-52 bg-gray-200 rounded-2xl" />)}</div>
//         </div>
//       </div>
//     )
//   }

//   // ─── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">

//       {/* ── Page Header ─────────────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-100 px-6 py-5">
//         <div className="max-w-[1400px] mx-auto flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
//             <p className="text-sm text-gray-400 mt-0.5">
//               {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
//               <span className="text-xs text-gray-400 font-medium">Live</span>
//             </div>
//             <Button
//               variant="outline" size="sm"
//               className="rounded-xl border-gray-200 text-gray-600 text-xs gap-1.5"
//               onClick={() => void Promise.all([
//                 refreshCustomers(),
//                 refreshLeads(),
//                 refreshInvoices(),
//                 refreshRetainers?.(),
//               ])}
//             >
//               <RefreshCw className="h-3.5 w-3.5" />Refresh
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

//         {/* ── Row 1: Lead & Client KPIs ────────────────────────────────── */}
//         <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
//           <KpiCard
//             icon={<Users className="h-5 w-5 text-[#3A7AFE]" />} iconBg="bg-blue-50"
//             label="Active clients" value={kpis.active}
//             sub={kpis.clientSub} trend={kpis.clientTrend}
//           />
//           <KpiCard
//             icon={<UserPlus className="h-5 w-5 text-[#22C55E]" />} iconBg="bg-green-50"
//             label="Active leads" value={kpis.openLeads}
//             sub={kpis.leadSub} trend={kpis.leadTrend}
//           />
//           <KpiCard
//             icon={<Activity className="h-5 w-5 text-[#8B5CF6]" />} iconBg="bg-purple-50"
//             label="Conversion rate" value={kpis.convRate}
//             sub={kpis.convSub} trend={kpis.convTrend}
//           />
//           <KpiCard
//             icon={<Clock className={`h-5 w-5 ${kpis.fuDue > 0 ? "text-[#EF4444]" : "text-gray-400"}`} />}
//             iconBg={kpis.fuDue > 0 ? "bg-red-50" : "bg-gray-50"}
//             label="Follow-ups due" value={kpis.fuDue}
//             sub={kpis.fuSub} alert={kpis.fuDue > 0}
//           />
//         </div>

//         {/* ── Row 2: Retainer KPIs ─────────────────────────────────────── */}
//         <div>
//           <div className="flex items-center gap-2 mb-3">
//             <h2 className="text-sm font-semibold text-gray-700">Monthly Retainers</h2>
//             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//               Recurring revenue overview
//             </span>
//             <button
//               onClick={() => onNavigate?.("retainers")}
//               className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium"
//             >
//               Manage retainers →
//             </button>
//           </div>
//           <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
//             <RetainerKpiCard
//               icon={<CheckCircle2 className="h-5 w-5 text-[#22C55E]" />}
//               iconBg="bg-green-50"
//               label="Active retainers"
//               value={retainerKpis.activeCount}
//               sub={retainerKpis.mrrSub}
//             />
//             <RetainerKpiCard
//               icon={<IndianRupee className="h-5 w-5 text-[#3A7AFE]" />}
//               iconBg="bg-blue-50"
//               label="Monthly recurring revenue"
//               value={retainerKpis.mrr >= 100000
//                 ? `₹${(retainerKpis.mrr / 100000).toFixed(1)}L`
//                 : `₹${retainerKpis.mrr.toLocaleString("en-IN")}`}
//               sub={`ARR ${retainerKpis.arr >= 100000
//                 ? `₹${(retainerKpis.arr / 100000).toFixed(1)}L`
//                 : `₹${retainerKpis.arr.toLocaleString("en-IN")}`}`}
//             />
//             <RetainerKpiCard
//               icon={<Bell className={`h-5 w-5 ${retainerKpis.urgentRenewals > 0 ? "text-[#F59E0B]" : "text-gray-400"}`} />}
//               iconBg={retainerKpis.urgentRenewals > 0 ? "bg-amber-50" : "bg-gray-50"}
//               label="Renewals due soon"
//               value={retainerKpis.expiringSoon}
//               sub={retainerKpis.renewalSub}
//               alert={retainerKpis.urgentRenewals > 0}
//             />
//             <RetainerKpiCard
//               icon={<AlertCircle className={`h-5 w-5 ${retainerKpis.overdueRetainers > 0 ? "text-[#EF4444]" : "text-gray-400"}`} />}
//               iconBg={retainerKpis.overdueRetainers > 0 ? "bg-red-50" : "bg-gray-50"}
//               label="Overdue renewals"
//               value={retainerKpis.overdueRetainers}
//               sub={retainerKpis.overdueRetainers > 0 ? "Needs immediate action" : "All retainers current"}
//               alert={retainerKpis.overdueRetainers > 0}
//             />
//           </div>
//         </div>

//         {/* ── Row 3: 5 Priority Action Cards ──────────────────────────── */}
//         <div>
//           <div className="flex items-center gap-2 mb-3">
//             <h2 className="text-sm font-semibold text-gray-700">Today's priority actions</h2>
//             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Items needing attention</span>
//             <span className="ml-auto flex items-center gap-1.5 text-xs text-[#22C55E] font-medium">
//               <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />Live
//             </span>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
//             <PriorityCard
//               icon={<Phone className={`h-4 w-4 ${priority.overdueFU.length > 0 ? "text-[#EF4444]" : "text-gray-400"}`} />}
//               iconBg={priority.overdueFU.length > 0 ? "bg-red-50" : "bg-gray-50"}
//               borderCls={priority.overdueFU.length > 0 ? "border-red-200" : "border-gray-100"}
//               label="Overdue follow-ups" value={priority.overdueFU.length}
//               desc="Leads waiting >48h for callback"
//               ctaLabel="Call Now"
//               ctaCls="bg-[#EF4444] hover:bg-red-600 text-white border-0"
//               onCta={priority.overdueFU.length > 0 ? () => onNavigate?.("leads") : undefined}
//             />
//             <PriorityCard
//               icon={<AlertCircle className={`h-4 w-4 ${priority.hotNC.length > 0 ? "text-[#F59E0B]" : "text-gray-400"}`} />}
//               iconBg={priority.hotNC.length > 0 ? "bg-amber-50" : "bg-gray-50"}
//               borderCls={priority.hotNC.length > 0 ? "border-amber-200" : "border-gray-100"}
//               label="Hot leads not contacted" value={priority.hotNC.length}
//               desc="Priority high, never reached"
//               ctaLabel="Contact"
//               ctaCls="bg-[#F59E0B] hover:bg-amber-600 text-white border-0"
//               onCta={priority.hotNC.length > 0 ? () => onNavigate?.("leads") : undefined}
//             />
//             <PriorityCard
//               icon={<Clock className={`h-4 w-4 ${priority.fuToday.length > 0 ? "text-[#3A7AFE]" : "text-gray-400"}`} />}
//               iconBg={priority.fuToday.length > 0 ? "bg-blue-50" : "bg-gray-50"}
//               borderCls={priority.fuToday.length > 0 ? "border-blue-200" : "border-gray-100"}
//               label="Follow-ups due today" value={priority.fuToday.length}
//               desc="Scheduled for today"
//               ctaLabel="View List"
//               ctaCls="bg-[#3A7AFE] hover:bg-blue-600 text-white border-0"
//               onCta={priority.fuToday.length > 0 ? () => onNavigate?.("leads") : undefined}
//             />
//             <PriorityCard
//               icon={<FileText className={`h-4 w-4 ${priority.overdueInv.length > 0 ? "text-[#EF4444]" : "text-gray-400"}`} />}
//               iconBg={priority.overdueInv.length > 0 ? "bg-red-50" : "bg-gray-50"}
//               borderCls={priority.overdueInv.length > 0 ? "border-red-200" : "border-gray-100"}
//               label="Overdue invoices" value={priority.overdueInv.length}
//               desc={`${priority.overdueAmt > 0 ? fmtCur(priority.overdueAmt) : "₹0"} pending >30 days`}
//               ctaLabel="Send Reminder"
//               ctaCls="bg-[#EF4444] hover:bg-red-600 text-white border-0"
//               onCta={priority.overdueInv.length > 0 ? () => onNavigate?.("invoices") : undefined}
//             />
//             <PriorityCard
//               icon={<Bell className={`h-4 w-4 ${retainerKpis.urgentRenewals > 0 ? "text-[#F59E0B]" : "text-gray-400"}`} />}
//               iconBg={retainerKpis.urgentRenewals > 0 ? "bg-amber-50" : "bg-gray-50"}
//               borderCls={retainerKpis.urgentRenewals > 0 ? "border-amber-200" : "border-gray-100"}
//               label="Retainer renewals" value={retainerKpis.urgentRenewals}
//               desc="Due within 7 days"
//               ctaLabel="Renew Now"
//               ctaCls="bg-[#F59E0B] hover:bg-amber-600 text-white border-0"
//               onCta={retainerKpis.urgentRenewals > 0 ? () => onNavigate?.("retainers") : undefined}
//             />
//           </div>
//         </div>

//         {/* ── Row 4: Line Chart + Funnel + Source Donut ───────────────── */}
//         <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr] gap-5 items-start">

//           {/* Leads vs Conversions line chart */}
//           <Card title="Leads vs conversions" subtitle="Last 7 days performance">
//             <div className="flex items-center gap-4 mt-2 mb-2">
//               <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
//                 <span className="w-5 h-0.5 bg-[#3A7AFE] inline-block rounded-full" />New leads
//               </span>
//               <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
//                 <span className="w-5 h-0.5 bg-[#22C55E] inline-block rounded-full" />Won deals
//               </span>
//             </div>
//             <LineChart
//               datasets={[
//                 { data: weekData.lPerDay, color: "#3A7AFE", label: "Leads" },
//                 { data: weekData.cPerDay, color: "#22C55E", label: "Won" },
//               ]}
//               labels={weekLabels}
//             />
//             <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
//               <StatBox value={weekData.wl} label="Total leads" />
//               <div className="w-px h-8 bg-gray-100" />
//               <StatBox value={weekData.wc} label="Won deals" />
//               <div className="w-px h-8 bg-gray-100" />
//               <StatBox value={weekData.rate} label="Win rate" color="text-[#3A7AFE]" />
//             </div>
//           </Card>

//           {/* Sales Funnel */}
//           <Card title="Sales funnel" subtitle="Pipeline stages and drop-off">
//             <div className="mt-3 space-y-2.5">
//               {funnelData.map((stage, idx) => {
//                 const prev = idx > 0 ? funnelData[idx - 1].count : stage.count
//                 const drop = prev > 0 && idx > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0
//                 const barW = maxFunnel > 0 ? Math.max((stage.count / maxFunnel) * 100, stage.count > 0 ? 4 : 0) : 0
//                 return (
//                   <div key={stage.key}>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-xs font-medium text-gray-600">{stage.label}</span>
//                       <div className="flex items-center gap-2">
//                         {drop > 0 && <span className="text-[10px] font-semibold text-red-500">-{drop}%</span>}
//                         <span className="text-xs font-bold text-gray-800 tabular-nums w-6 text-right">{stage.count}</span>
//                       </div>
//                     </div>
//                     <div className="h-5 bg-gray-100 rounded-lg overflow-hidden">
//                       <div
//                         className="h-full rounded-lg transition-all duration-500"
//                         style={{ width: `${barW}%`, backgroundColor: stage.color }}
//                       />
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//             <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
//               <span className="text-xs text-gray-400">Overall win rate</span>
//               <span className="text-sm font-bold text-gray-800">
//                 {funnelData[0]?.count > 0
//                   ? `${((funnelData[4]?.count ?? 0) / funnelData[0].count * 100).toFixed(1)}%`
//                   : "—"}
//               </span>
//             </div>
//           </Card>

//           {/* Lead Source Donut */}
//           <Card title="Lead source distribution" subtitle="Where leads are coming from">
//             <div className="flex justify-center mt-3 mb-4">
//               <DonutChart segments={sourceSegs} size={130} />
//             </div>
//             <div className="space-y-2">
//               {sourceSegs.length === 0 ? (
//                 <p className="text-xs text-gray-400 text-center py-2">No leads yet</p>
//               ) : (
//                 sourceSegs.map((seg, i) => {
//                   const pct = srcTotal > 0 ? Math.round((seg.value / srcTotal) * 100) : 0
//                   return (
//                     <div key={i}>
//                       <div className="flex items-center gap-2 mb-0.5">
//                         <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
//                         <span className="text-xs text-gray-600 flex-1 truncate">{seg.label}</span>
//                         <span className="text-xs font-semibold text-gray-800 tabular-nums">{seg.value}</span>
//                         <span
//                           className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums min-w-[30px] text-center"
//                           style={{ backgroundColor: `${seg.color}18`, color: seg.color }}
//                         >
//                           {pct}%
//                         </span>
//                       </div>
//                       <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-4">
//                         <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </Card>
//         </div>

//         {/* ── Row 5: Monthly Bar + Clients by Service + Recent Activity ── */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

//           {/* Monthly lead volume bar chart */}
//           <Card
//             title="Monthly lead volume"
//             subtitle="New leads per month — last 6 months"
//             topRight={
//               <span className="text-xs font-medium text-[#3A7AFE] bg-blue-50 px-2 py-0.5 rounded-full">
//                 {monthData.reduce((a, b) => a + b, 0)} total
//               </span>
//             }
//           >
//             <div className="mt-3">
//               <BarChart data={monthData} labels={monthLabels} color="#3A7AFE" height={160} />
//             </div>
//           </Card>

//           {/* Clients by service — horizontal bar chart */}
//           <Card
//             title="Clients by service type"
//             subtitle="Distribution across all services"
//             topRight={
//               <span className="text-xs font-medium text-[#22C55E] bg-green-50 px-2 py-0.5 rounded-full">
//                 {customers.length} total
//               </span>
//             }
//           >
//             <div className="mt-4">
//               {svcItems.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-10 text-gray-400">
//                   <Users className="h-6 w-6 mb-1.5 opacity-30" />
//                   <p className="text-xs">No clients yet</p>
//                 </div>
//               ) : (
//                 <HorizBarChart items={svcItems} color="#22C55E" />
//               )}
//             </div>
//           </Card>

//           {/* Recent activity */}
//           <Card title="Recent activity" subtitle="Latest leads and clients">
//             <div className="flex items-center gap-1.5 mt-1 mb-3">
//               <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
//               <span className="text-xs text-gray-400 font-medium">Live updates</span>
//             </div>
//             {activity.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-10 text-gray-400">
//                 <Activity className="h-6 w-6 mb-1.5 opacity-30" />
//                 <p className="text-xs">No activity yet</p>
//               </div>
//             ) : (
//               <div className="relative">
//                 <div className="absolute left-3.5 top-1 bottom-1 w-px bg-gray-100" />
//                 <div className="space-y-3.5">
//                   {activity.map((item, idx) => {
//                     const isLead = item.type === "lead"
//                     return (
//                       <div key={`${item.id}-${idx}`} className="flex items-start gap-3 relative">
//                         <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-xs ${isLead ? "bg-blue-50 border-2 border-blue-200 text-[#3A7AFE]" : "bg-green-50 border-2 border-green-200 text-[#22C55E]"}`}>
//                           {item.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="flex-1 min-w-0 pt-0.5">
//                           <div className="flex items-center justify-between gap-2">
//                             <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
//                             <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(item.time)}</span>
//                           </div>
//                           <p className="text-[11px] text-gray-400 mt-0.5 truncate">
//                             {item.sub}{item.svc ? ` · ${SVC[item.svc] ?? item.svc}` : ""}
//                           </p>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             )}
//           </Card>
//         </div>

//         {/* ── Row 6: Retainer breakdown + Upcoming renewals ────────────── */}
//         <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-5 items-start">

//           {/* Retainer services breakdown */}
//           <Card
//             title="Active retainers by service"
//             subtitle="Which services your recurring clients use"
//             topRight={
//               <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
//                 {retainerKpis.activeCount} active
//               </span>
//             }
//           >
//             <div className="mt-4">
//               {retainerSvcItems.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-10 text-gray-400">
//                   <RefreshCw className="h-6 w-6 mb-1.5 opacity-30" />
//                   <p className="text-xs">No active retainers yet</p>
//                   <button
//                     onClick={() => onNavigate?.("retainers")}
//                     className="text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium"
//                   >
//                     Add your first retainer →
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   <HorizBarChart items={retainerSvcItems} color="#3A7AFE" />
//                   <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
//                     <div className="text-center">
//                       <p className="text-lg font-bold text-gray-900">{retainerKpis.activeCount}</p>
//                       <p className="text-[10px] text-gray-400">Active clients</p>
//                     </div>
//                     <div className="w-px h-8 bg-gray-100" />
//                     <div className="text-center">
//                       <p className="text-lg font-bold text-emerald-700">
//                         {retainerKpis.mrr >= 100000
//                           ? `₹${(retainerKpis.mrr / 100000).toFixed(1)}L`
//                           : `₹${retainerKpis.mrr.toLocaleString("en-IN")}`}
//                       </p>
//                       <p className="text-[10px] text-gray-400">MRR</p>
//                     </div>
//                     <div className="w-px h-8 bg-gray-100" />
//                     <div className="text-center">
//                       <p className="text-lg font-bold text-blue-600">
//                         {retainerKpis.arr >= 100000
//                           ? `₹${(retainerKpis.arr / 100000).toFixed(1)}L`
//                           : `₹${retainerKpis.arr.toLocaleString("en-IN")}`}
//                       </p>
//                       <p className="text-[10px] text-gray-400">ARR</p>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </Card>

//           {/* Upcoming renewals list */}
//           <Card
//             title="Upcoming retainer renewals"
//             subtitle="Active clients renewing within 30 days"
//             topRight={
//               retainerKpis.expiringSoon > 0 ? (
//                 <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
//                   {retainerKpis.expiringSoon} due
//                 </span>
//               ) : (
//                 <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
//                   All clear
//                 </span>
//               )
//             }
//           >
//             <RetainerRenewalsList retainers={safeRetainers} onNavigate={onNavigate} />
//           </Card>
//         </div>

//       </div>
//     </div>
//   )
// }


//testing (27-05-2026)




"use client"

import { useEffect, useMemo } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import {
  Users, TrendingUp, IndianRupee, AlertCircle,
  RefreshCw, FileText, Phone, Bell, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react"
import { differenceInDays } from "date-fns"

// ─── Retainer helpers ─────────────────────────────────────────────────────────

const getClientName    = (r: any) => r?.clientName    ?? r?.client_name    ?? ""
const getMonthlyAmount = (r: any) => Number(r?.monthlyAmount ?? r?.monthly_amount ?? 0)
const getRenewalDate   = (r: any) => r?.renewalDate   ?? r?.renewal_date   ?? ""

const getDaysToRenewal = (renewalDate: string): number => {
  if (!renewalDate) return Infinity
  const today   = new Date(); today.setHours(0, 0, 0, 0)
  const renewal = new Date(renewalDate)
  return differenceInDays(renewal, today)
}

const RETAINER_SVC: Record<string, string> = {
  whatsapp:          "WhatsApp",
  website:           "Website",
  digital_marketing: "Digital Mktg",
  crm:               "CRM",
  lms:               "LMS",
  mobile_app:        "Mobile App",
  admin_panel:       "Admin Panel",
  devops:            "DevOps",
  "social-media":    "Social Media",
  other:             "Other",
}

const SVC: Record<string, string> = {
  website:           "Website",
  whatsapp:          "WhatsApp",
  lms:               "LMS",
  crm:               "CRM",
  "social-media":    "Social Media",
  digital_marketing: "Digital Mktg",
  mobile_app:        "Mobile App",
  devops:            "DevOps",
  admin_panel:       "Admin Panel",
  other:             "Other",
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (v: number): string => {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`
  if (v >= 1_00_000)    return `₹${(v / 1_00_000).toFixed(1)}L`
  if (v >= 1_000)       return `₹${(v / 1_000).toFixed(0)}K`
  return `₹${v.toLocaleString("en-IN")}`
}

const fmtPct = (n: number): string => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`

const timeAgo = (date: Date): string => {
  const m = Math.floor((Date.now() - date.getTime()) / 60000)
  if (m < 1)  return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Micro SVG Sparkline ──────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2 || data.every(v => v === 0)) {
    return <div className="h-8 w-20 opacity-20 bg-gray-100 rounded" />
  }
  const W = 80, H = 32
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]}
        r="3" fill={color} />
    </svg>
  )
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </h2>
  )
}

// ─── KPI Card — CEO-level metric ─────────────────────────────────────────────

function KpiCard({
  icon: Icon, iconColor, iconBg,
  label, value, trend, trendLabel, sub, alert,
  sparkData,
}: {
  icon: React.ElementType; iconColor: string; iconBg: string
  label: string; value: string | number
  trend?: number; trendLabel?: string; sub?: string
  alert?: boolean; sparkData?: number[]
}) {
  const up = trend !== undefined && trend >= 0
  return (
    <div className={`bg-white rounded-2xl border ${alert ? "border-red-200 bg-red-50/20" : "border-gray-100"} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} style={{ height: 18, width: 18 }} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={alert ? "#EF4444" : iconColor.includes("blue") ? "#3A7AFE" : iconColor.includes("green") ? "#22C55E" : iconColor.includes("violet") ? "#8B5CF6" : "#F59E0B"} />}
      </div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold leading-none mb-2 ${alert ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {fmtPct(Math.abs(trend))}
            {trendLabel && <span className="text-gray-400 font-normal ml-0.5">{trendLabel}</span>}
          </span>
        )}
        {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
      </div>
    </div>
  )
}

// ─── Action Card — replaces old PriorityCard ─────────────────────────────────
// Simpler: just a number, a label, a description, and one CTA.

function ActionCard({
  count, label, desc, cta, ctaColor, onClick, urgent,
}: {
  count: number; label: string; desc: string
  cta: string; ctaColor: string; onClick?: () => void; urgent?: boolean
}) {
  const hasAction = count > 0 && !!onClick
  return (
    <div className={`bg-white rounded-2xl border ${urgent && count > 0 ? "border-red-200" : "border-gray-100"} p-4 flex flex-col gap-3 shadow-sm`}>
      <div>
        <p className={`text-3xl font-bold leading-none ${count === 0 ? "text-gray-200" : urgent ? "text-red-600" : "text-gray-900"}`}>
          {count}
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-1.5">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={!hasAction}
        className={`w-full text-xs font-semibold rounded-xl py-2.5 transition-colors ${
          hasAction
            ? `${ctaColor} text-white`
            : "bg-gray-100 text-gray-300 cursor-default"
        }`}
      >
        {cta} →
      </button>
    </div>
  )
}

// ─── Simple horizontal bar row ────────────────────────────────────────────────

function BarRow({ label, value, max, color, sub }: {
  label: string; value: number; max: number; color: string; sub?: string
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 truncate max-w-[160px]">{label}</span>
        <span className="flex items-center gap-2 shrink-0 ml-2">
          {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
          <span className="text-xs font-bold text-gray-800 tabular-nums">{value}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Panel({ title, sub, children, badge }: {
  title: string; sub?: string; children: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {badge}
      </div>
      {children}
    </div>
  )
}

// ─── Inline badge ─────────────────────────────────────────────────────────────

function Pill({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const cls: Record<string, string> = {
    gray:   "bg-gray-100 text-gray-500",
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber:  "bg-amber-50 text-amber-700 border border-amber-200",
    red:    "bg-red-50 text-red-700 border border-red-200",
    blue:   "bg-blue-50 text-blue-700 border border-blue-200",
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls[color] ?? cls.gray}`}>
      {children}
    </span>
  )
}

// ─── Simple SVG bar chart (for revenue / lead volume) ─────────────────────────

function MiniBarChart({ data, labels, color = "#3A7AFE" }: {
  data: number[]; labels: string[]; color?: string
}) {
  const H = 100, W = 340
  const padB = 20, padL = 28, padT = 8, padR = 8
  const iH = H - padT - padB
  const iW = W - padL - padR
  const max = Math.max(...data, 1)
  const bW  = iW / data.length
  const gap = bW * 0.35

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
      {[0, Math.ceil(max / 2), max].map((t, i) => {
        const y = padT + iH - (t / max) * iH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth="1" />
            <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94A3B8">{t}</text>
          </g>
        )
      })}
      {data.map((v, i) => {
        const bH = v === 0 ? 0 : Math.max((v / max) * iH, 3)
        const x  = padL + i * bW + gap / 2
        const y  = padT + iH - bH
        const bw = bW - gap
        return (
          <g key={i}>
            {v > 0 && <rect x={x} y={y} width={bw} height={bH} rx="3" fill={color} opacity="0.85" />}
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#94A3B8">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Funnel bar ───────────────────────────────────────────────────────────────

const FUNNEL = [
  { key: "lead",        label: "New Leads",   color: "#3A7AFE" },
  { key: "demo",        label: "Demo",        color: "#8B5CF6" },
  { key: "proposal",    label: "Proposal",    color: "#F59E0B" },
  { key: "negotiation", label: "Negotiation", color: "#06B6D4" },
  { key: "won",         label: "Won",         color: "#22C55E" },
]

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function DashboardContent({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const {
    customers, leads, invoices = [], isLoading,
    retainers = [],
    refreshCustomers, refreshLeads, refreshInvoices, refreshRetainers,
  } = useCRM() as any

  const safeRetainers: any[] = Array.isArray(retainers) ? retainers : []

  useEffect(() => {
    void Promise.all([
      refreshCustomers(),
      refreshLeads(),
      refreshInvoices(),
      refreshRetainers?.(),
    ])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Date helpers ─────────────────────────────────────────────────────────
  const now      = new Date()
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30)
  const prevEnd  = new Date(monthAgo)
  const prevStart = new Date(now); prevStart.setDate(now.getDate() - 60)

  const inCur  = (v: unknown) => { const d = new Date(v as string); return !isNaN(d.getTime()) && d >= monthAgo }
  const inPrev = (v: unknown) => { const d = new Date(v as string); return !isNaN(d.getTime()) && d >= prevStart && d < prevEnd }
  const pctChg = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : +((c - p) / p * 100).toFixed(1)

  // ── Core metrics ─────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    // Revenue from paid invoices
    const paidInv    = (invoices as any[]).filter((i: any) => i.status === "paid")
    const revCur     = paidInv.filter((i: any) => inCur(i.paidDate ?? i.paid_date ?? i.issueDate)).reduce((s: number, i: any) => s + (Number(i.total) || 0), 0)
    const revPrev    = paidInv.filter((i: any) => inPrev(i.paidDate ?? i.paid_date ?? i.issueDate)).reduce((s: number, i: any) => s + (Number(i.total) || 0), 0)

    // Active clients
    const activeC    = customers.filter((c: any) => c.status === "active").length
    const newCCur    = customers.filter((c: any) => inCur(c.createdAt ?? c.created_at)).length
    const newCPrev   = customers.filter((c: any) => inPrev(c.createdAt ?? c.created_at)).length

    // Open leads
    const openLeads  = leads.filter((l: any) => !["won","lost"].includes(l.status))
    const lCur       = openLeads.filter((l: any) => inCur(l.createdAt ?? l.created_at)).length
    const lPrev      = leads.filter((l: any) => !["won","lost"].includes(l.status) && inPrev(l.createdAt ?? l.created_at)).length

    // Conversion rate
    const converted  = leads.filter((l: any) => l.status === "won" || l.isConverted).length
    const convRate   = leads.length > 0 ? (converted / leads.length) * 100 : 0

    // MRR from retainers
    const activeRet  = safeRetainers.filter((r) => r.status === "active")
    const mrr        = activeRet.reduce((s, r) => s + getMonthlyAmount(r), 0)

    // Overdue invoices
    const overdueInv = (invoices as any[]).filter((i: any) => i.status === "overdue")
    const overdueAmt = overdueInv.reduce((s: number, i: any) => s + (Number(i.total) || 0), 0)

    // Follow-ups
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const fuOverdue  = leads.filter((l: any) => {
      const fu = l.follow_up_date; if (!fu) return false
      const d  = new Date(fu); d.setHours(0,0,0,0)
      return d < todayStart && !["won","lost"].includes(l.status)
    })
    const fuToday    = leads.filter((l: any) => {
      const fu = l.follow_up_date; if (!fu) return false
      return fu.toString().slice(0,10) === now.toISOString().slice(0,10) && !["won","lost"].includes(l.status)
    })

    // Retainer renewals
    const retRenewalsUrgent = activeRet.filter((r) => {
      const d = getDaysToRenewal(getRenewalDate(r)); return d >= 0 && d <= 7
    })
    const retRenewals30 = activeRet.filter((r) => {
      const d = getDaysToRenewal(getRenewalDate(r)); return d >= 0 && d <= 30
    })

    return {
      revCur, revPrev, revTrend: pctChg(revCur, revPrev),
      activeC, newCCur, newCPrev, cTrend: pctChg(newCCur, newCPrev),
      openLeads: openLeads.length, lCur, lPrev, lTrend: pctChg(lCur, lPrev),
      convRate: convRate.toFixed(1),
      mrr,
      overdueInv: overdueInv.length, overdueAmt,
      fuOverdue, fuToday,
      retRenewalsUrgent, retRenewals30,
    }
  }, [customers, leads, invoices, safeRetainers])

  // ── Sparkline data (7-day per-day count) ─────────────────────────────────
  const sparkLeads = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const s = new Date(now); s.setDate(now.getDate() - (6 - i)); s.setHours(0,0,0,0)
    const e = new Date(s);   e.setHours(23,59,59,999)
    return leads.filter((l: any) => { const d = new Date(l.created_at ?? l.createdAt ?? 0); return d >= s && d <= e }).length
  }), [leads])

  const sparkRev = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const e = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
    return (invoices as any[]).filter((inv: any) => inv.status === "paid").filter((inv: any) => {
      const d = new Date(inv.paidDate ?? inv.paid_date ?? inv.issueDate ?? 0); return d >= m && d <= e
    }).reduce((s: number, inv: any) => s + (Number(inv.total) || 0), 0)
  }), [invoices])

  // ── Funnel ────────────────────────────────────────────────────────────────
  const funnelCounts = useMemo(() =>
    FUNNEL.map(s => ({ ...s, count: leads.filter((l: any) => l.status === s.key).length }))
  , [leads])

  const maxFunnel = Math.max(...funnelCounts.map(s => s.count), 1)

  // ── Monthly lead bar ──────────────────────────────────────────────────────
  const monthLabels = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return d.toLocaleDateString("en-IN", { month: "short" })
  }), [])

  const monthLeads = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const e = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
    return leads.filter((l: any) => { const d = new Date(l.created_at ?? l.createdAt ?? 0); return d >= m && d <= e }).length
  }), [leads])

  // ── Service breakdown ─────────────────────────────────────────────────────
  const svcMap = useMemo(() => {
    const m: Record<string, number> = {}
    customers.forEach((c: any) => { const k = c.service ?? "other"; m[k] = (m[k] ?? 0) + 1 })
    return Object.entries(m).map(([k, v]) => ({ label: SVC[k] ?? k, value: v })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [customers])

  // ── Upcoming retainer renewals ────────────────────────────────────────────
  const upcomingRenewals = useMemo(() =>
    safeRetainers
      .filter((r) => r.status === "active")
      .map((r) => ({ ...r, _days: getDaysToRenewal(getRenewalDate(r)) }))
      .filter((r) => r._days <= 30)
      .sort((a, b) => a._days - b._days)
      .slice(0, 5)
  , [safeRetainers])

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    type Item = { id: string; type: "lead" | "client"; name: string; sub: string; time: Date }
    const items: Item[] = [
      ...leads.slice(0, 20).map((l: any) => ({
        id: l.id, type: "lead" as const, name: l.name,
        sub: `New lead · ${l.source ?? "—"}`,
        time: new Date(l.created_at ?? l.createdAt ?? 0),
      })),
      ...customers.slice(0, 20).map((c: any) => ({
        id: c.id, type: "client" as const, name: c.name,
        sub: "Converted to client",
        time: new Date(c.created_at ?? c.createdAt ?? 0),
      })),
    ]
    return items.filter(i => !isNaN(i.time.getTime())).sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8)
  }, [leads, customers])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] p-6 animate-pulse">
        <div className="max-w-screen-xl mx-auto space-y-5">
          <div className="h-8 w-40 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="h-56 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Overview</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <Button
              variant="outline" size="sm"
              className="rounded-xl border-gray-200 text-gray-500 text-xs gap-1.5 h-8"
              onClick={() => void Promise.all([
                refreshCustomers(), refreshLeads(),
                refreshInvoices(), refreshRetainers?.(),
              ])}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-8">

        {/* ══ Section 1: Business at a glance (4 KPIs) ═════════════════ */}
        <section>
          <SectionLabel>Business at a glance</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Revenue this month */}
            <KpiCard
              icon={IndianRupee} iconColor="text-emerald-600" iconBg="bg-emerald-50"
              label="Revenue this month"
              value={metrics.revCur > 0 ? fmtMoney(metrics.revCur) : "₹0"}
              trend={metrics.revTrend}
              trendLabel="vs last month"
              sparkData={sparkRev}
            />

            {/* Monthly Recurring Revenue */}
            <KpiCard
              icon={RefreshCw} iconColor="text-violet-600" iconBg="bg-violet-50"
              label="Monthly recurring (MRR)"
              value={fmtMoney(metrics.mrr)}
              sub={`${safeRetainers.filter(r => r.status === "active").length} active retainers`}
            />

            {/* Active clients */}
            <KpiCard
              icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50"
              label="Active clients"
              value={metrics.activeC}
              trend={metrics.cTrend}
              trendLabel="vs last month"
              sub={`+${metrics.newCCur} added this month`}
            />

            {/* Open leads */}
            <KpiCard
              icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50"
              label="Open leads"
              value={metrics.openLeads}
              trend={metrics.lTrend}
              trendLabel="vs last month"
              sub={`${metrics.convRate}% conversion rate`}
              sparkData={sparkLeads}
            />
          </div>
        </section>

        {/* ══ Section 2: Actions needed ══════════════════════════════════ */}
        {/* Only 3 cards: Overdue follow-ups, Overdue invoices, Retainer renewals */}
        <section>
          <SectionLabel>Needs your attention</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <ActionCard
              count={metrics.fuOverdue.length}
              label="Overdue follow-ups"
              desc={metrics.fuToday.length > 0 ? `+ ${metrics.fuToday.length} due today` : "Leads that missed scheduled callback"}
              cta="View leads"
              ctaColor="bg-red-500 hover:bg-red-600"
              urgent
              onClick={metrics.fuOverdue.length > 0 ? () => onNavigate?.("leads") : undefined}
            />

            <ActionCard
              count={metrics.overdueInv.length}
              label="Overdue invoices"
              desc={metrics.overdueAmt > 0 ? `${fmtMoney(metrics.overdueAmt)} pending collection` : "All invoices collected"}
              cta="View invoices"
              ctaColor="bg-red-500 hover:bg-red-600"
              urgent
              onClick={metrics.overdueInv.length > 0 ? () => onNavigate?.("invoices") : undefined}
            />

            <ActionCard
              count={metrics.retRenewalsUrgent.length}
              label="Retainer renewals due"
              desc={metrics.retRenewals30.length > metrics.retRenewalsUrgent.length
                ? `${metrics.retRenewals30.length} total within 30 days`
                : "Within next 7 days"}
              cta="Manage retainers"
              ctaColor="bg-amber-500 hover:bg-amber-600"
              onClick={metrics.retRenewalsUrgent.length > 0 ? () => onNavigate?.("retainers") : undefined}
            />
          </div>
        </section>

        {/* ══ Section 3: Pipeline + Revenue trend + Recent ══════════════ */}
        <section>
          <SectionLabel>Pipeline & activity</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Sales funnel */}
            <Panel title="Sales pipeline" sub="Current lead stages">
              <div className="space-y-3">
                {funnelCounts.map((stage, idx) => {
                  const prev = idx > 0 ? funnelCounts[idx - 1].count : stage.count
                  const drop = prev > 0 && idx > 0 ? Math.round(((prev - stage.count) / prev) * 100) : null
                  return (
                    <BarRow
                      key={stage.key}
                      label={stage.label}
                      value={stage.count}
                      max={maxFunnel}
                      color={stage.color}
                      sub={drop !== null && drop > 0 ? `-${drop}%` : undefined}
                    />
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Lead → Won rate</span>
                <span className="text-sm font-bold text-gray-800">
                  {funnelCounts[0]?.count > 0
                    ? `${((funnelCounts[4]?.count ?? 0) / funnelCounts[0].count * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
            </Panel>

            {/* Monthly lead volume bar chart */}
            <Panel
              title="Lead volume"
              sub="New leads per month"
              badge={
                <Pill color="blue">
                  {monthLeads.reduce((a, b) => a + b, 0)} total
                </Pill>
              }
            >
              <MiniBarChart data={monthLeads} labels={monthLabels} color="#3A7AFE" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">This month</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{monthLeads[5]}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Avg / month</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {monthLeads.length > 0
                      ? (monthLeads.reduce((a, b) => a + b, 0) / monthLeads.length).toFixed(0)
                      : "0"}
                  </p>
                </div>
              </div>
            </Panel>

            {/* Recent activity feed */}
            <Panel title="Recent activity" sub="Latest leads & conversions">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                  <Activity className="h-7 w-7 mb-2" />
                  <p className="text-xs text-gray-400">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        item.type === "lead"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(item.time)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </section>

        {/* ══ Section 4: Retainers + Clients by service ═════════════════ */}
        <section>
          <SectionLabel>Recurring business</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Upcoming renewals */}
            <Panel
              title="Upcoming retainer renewals"
              sub="Active clients renewing within 30 days"
              badge={
                upcomingRenewals.length > 0
                  ? <Pill color="amber">{upcomingRenewals.length} due</Pill>
                  : <Pill color="green">All clear</Pill>
              }
            >
              {upcomingRenewals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                  <CheckCircle2 className="h-7 w-7 mb-2" />
                  <p className="text-xs text-gray-400">No renewals due in 30 days</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingRenewals.map((r) => {
                    const urgent = r._days <= 7
                    return (
                      <div key={r.id} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border ${urgent ? "border-red-100 bg-red-50/40" : "border-amber-100 bg-amber-50/30"}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                          {getClientName(r).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{getClientName(r)}</p>
                          <p className="text-[10px] text-gray-400">{RETAINER_SVC[r.service] ?? r.service}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgent ? "text-red-600 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                            {r._days <= 0 ? "Overdue" : r._days === 0 ? "Today" : `${r._days}d`}
                          </span>
                          <p className="text-[10px] font-bold text-emerald-700 mt-0.5">{fmtMoney(getMonthlyAmount(r))}/mo</p>
                        </div>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => onNavigate?.("retainers")}
                    className="w-full text-center text-xs text-blue-500 hover:text-blue-700 font-semibold py-1.5 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    View all retainers →
                  </button>
                </div>
              )}
            </Panel>

            {/* Clients by service + retainer MRR */}
            <div className="space-y-5">
              {/* Clients by service */}
              <Panel
                title="Clients by service"
                sub="Your most active service lines"
                badge={<Pill color="blue">{customers.length} clients</Pill>}
              >
                {svcMap.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No clients yet</p>
                ) : (
                  <div className="space-y-3 mt-1">
                    {svcMap.map((s, i) => (
                      <BarRow key={i} label={s.label} value={s.value} max={svcMap[0].value} color="#3A7AFE" />
                    ))}
                  </div>
                )}
              </Panel>

              {/* Revenue snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">MRR</p>
                  <p className="text-lg font-bold text-violet-700">{fmtMoney(metrics.mrr)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">ARR</p>
                  <p className="text-lg font-bold text-blue-700">{fmtMoney(metrics.mrr * 12)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Win rate</p>
                  <p className="text-lg font-bold text-emerald-700">{metrics.convRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}