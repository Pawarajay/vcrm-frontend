// "use client"

// import { useState, useEffect, useCallback } from "react"
// import {
//   Plus, RefreshCw, Download, FolderKanban,
//   AlertTriangle, TrendingUp, Clock, CheckCircle2,
// } from "lucide-react"
// import { useAuth } from "@/contexts/auth-context"

// // ── Sub-components (assumed to live alongside this file) ──────────────────────
// // components/projects/project-list.tsx   → <ProjectList />
// // components/projects/project-form.tsx   → <ProjectForm />  (the dialog/drawer form)
// // If you kept them as the files shown in context, adjust the import paths.
// import ProjectList from "@/components/projects/project-list"
// import ProjectForm from "@/components/projects/project-form"

// // ─────────────────────────────────────────────────────────────────────────────

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// /** Grab the auth token from wherever your app stores it */
// function authHeader(): HeadersInit {
//   if (typeof window === "undefined") return {}
//   const token = localStorage.getItem("token") || sessionStorage.getItem("token") || ""
//   return token ? { Authorization: `Bearer ${token}` } : {}
// }
// function jsonAuthHeader(): HeadersInit {
//   return { "Content-Type": "application/json", ...authHeader() }
// }

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface Project {
//   id: string
//   title: string
//   client_id: string | null
//   client_name: string | null
//   deal_id: string | null
//   service: string | null
//   description: string | null
//   status: "Requirement" | "In Progress" | "Delivered" | "On Hold"
//   priority: "Low" | "Medium" | "High" | "Critical"
//   start_date: string | null
//   delivery_date: string | null
//   sales_owner: string | null
//   project_manager: string | null
//   developer_assigned: string | null
//   progress_percentage: number
//   completion_percentage: number
//   project_update: string | null
//   notes: string | null
//   task_count: number
//   task_done_count: number
//   created_at: string
//   updated_at: string
// }

// // ─── Stat Card ────────────────────────────────────────────────────────────────

// interface StatCardProps {
//   label: string
//   value: number | string
//   icon: React.ElementType
//   iconBg: string
//   iconColor: string
//   sub?: string
// }

// function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub }: StatCardProps) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
//       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
//         <Icon size={18} className={iconColor} />
//       </div>
//       <div className="min-w-0">
//         <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
//         <p className="text-xs text-gray-500 mt-0.5 truncate">{label}</p>
//         {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
//       </div>
//     </div>
//   )
// }

// // ─── Toast (mirrors pattern from customers) ───────────────────────────────────

// interface Toast {
//   id: number
//   message: string
//   type: "success" | "error"
// }

// function ToastContainer({ toasts }: { toasts: Toast[] }) {
//   return (
//     <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
//       {toasts.map((t) => (
//         <div
//           key={t.id}
//           className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
//             t.type === "error" ? "bg-red-500" : "bg-emerald-500"
//           }`}
//         >
//           {t.message}
//         </div>
//       ))}
//     </div>
//   )
// }

// // ─── Confirm Dialog ───────────────────────────────────────────────────────────

// interface ConfirmState {
//   open: boolean
//   title: string
//   message: string
//   onConfirm: () => void
// }

// function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
//   if (!state.open) return null
//   return (
//     <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
//         <h3 className="text-base font-bold text-gray-900">{state.title}</h3>
//         <p className="text-sm text-gray-500 mt-1.5">{state.message}</p>
//         <div className="flex gap-3 mt-5 justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => { state.onConfirm(); onClose() }}
//             className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700"
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Content Component
// // ─────────────────────────────────────────────────────────────────────────────

// export function ProjectsContent() {
//   const { user, isAdmin } = useAuth()

//   const [projects,   setProjects]   = useState<Project[]>([])
//   const [loading,    setLoading]    = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [error,      setError]      = useState<string | null>(null)

//   // Dialog state
//   const [showForm,       setShowForm]       = useState(false)
//   const [editingProject, setEditingProject] = useState<Project | null>(null)

//   // Toast
//   const [toasts, setToasts] = useState<Toast[]>([])
//   const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
//     const id = Date.now()
//     setToasts((prev) => [...prev, { id, message, type }])
//     setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
//   }, [])

//   // Confirm
//   const [confirm, setConfirm] = useState<ConfirmState>({
//     open: false, title: "", message: "", onConfirm: () => {},
//   })
//   const openConfirm = (title: string, message: string, fn: () => void) =>
//     setConfirm({ open: true, title, message, onConfirm: fn })
//   const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }))

//   // ── Fetch ────────────────────────────────────────────────────────────────

//   const fetchProjects = useCallback(async (silent = false) => {
//     if (!silent) setLoading(true)
//     else setRefreshing(true)
//     setError(null)
//     try {
//       const res = await fetch(`${API_BASE}/projects`, { headers: authHeader() })
//       if (!res.ok) throw new Error(`Server error ${res.status}`)
//       const data = await res.json()
//       setProjects(Array.isArray(data) ? data : data.projects || [])
//     } catch (err: any) {
//       setError(err.message || "Failed to load projects")
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }, [])

//   useEffect(() => { fetchProjects() }, [fetchProjects])

//   // ── Delete ───────────────────────────────────────────────────────────────

//   const handleDelete = useCallback((project: Project) => {
//     openConfirm(
//       "Delete Project",
//       `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
//       async () => {
//         try {
//           const res = await fetch(`${API_BASE}/projects/${project.id}`, {
//             method: "DELETE",
//             headers: authHeader(),
//           })
//           if (!res.ok) throw new Error()
//           setProjects((prev) => prev.filter((p) => p.id !== project.id))
//           showToast("Project deleted successfully")
//         } catch {
//           showToast("Failed to delete project", "error")
//         }
//       }
//     )
//   }, [showToast])

//   // ── Quick status patch ───────────────────────────────────────────────────

//   const handleStatusChange = useCallback(async (projectId: string, status: string) => {
//     try {
//       const res = await fetch(`${API_BASE}/projects/${projectId}`, {
//         method: "PATCH",
//         headers: jsonAuthHeader(),
//         body: JSON.stringify({ status }),
//       })
//       if (!res.ok) throw new Error()
//       const updated = await res.json()
//       setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, ...updated } : p))
//       showToast(`Status updated to ${status}`)
//     } catch {
//       showToast("Failed to update status", "error")
//     }
//   }, [showToast])

//   // ── Quick progress patch ─────────────────────────────────────────────────

//   const handleProgressChange = useCallback(async (projectId: string, progress: number) => {
//     try {
//       const res = await fetch(`${API_BASE}/projects/${projectId}`, {
//         method: "PATCH",
//         headers: jsonAuthHeader(),
//         body: JSON.stringify({ progress_percentage: progress }),
//       })
//       if (!res.ok) throw new Error()
//       setProjects((prev) =>
//         prev.map((p) =>
//           p.id === projectId ? { ...p, progress_percentage: progress, completion_percentage: progress } : p
//         )
//       )
//     } catch {
//       showToast("Failed to update progress", "error")
//     }
//   }, [showToast])

//   // ── Form callbacks ───────────────────────────────────────────────────────

//   const openCreate = () => { setEditingProject(null); setShowForm(true) }
//   const openEdit   = (p: Project) => { setEditingProject(p); setShowForm(true) }
//   const closeForm  = () => { setShowForm(false); setEditingProject(null) }

//   const handleFormSuccess = useCallback(() => {
//     closeForm()
//     showToast(editingProject ? "Project updated successfully" : "Project created successfully")
//     fetchProjects(true)
//   }, [editingProject, fetchProjects, showToast])

//   // ── CSV Export ───────────────────────────────────────────────────────────

//   const handleExport = () => {
//     if (!projects.length) return
//     const headers = [
//       "Title", "Client", "Service", "Status", "Priority",
//       "Start Date", "Delivery Date", "Progress %",
//       "Sales Owner", "Project Manager", "Developer",
//       "Tasks Done", "Tasks Total", "Notes", "Last Update",
//     ]
//     const rows = projects.map((p) => [
//       p.title,
//       p.client_name || "",
//       p.service || "",
//       p.status,
//       p.priority,
//       p.start_date?.slice(0, 10) || "",
//       p.delivery_date?.slice(0, 10) || "",
//       p.progress_percentage ?? "",
//       p.sales_owner || "",
//       p.project_manager || "",
//       p.developer_assigned || "",
//       p.task_done_count ?? 0,
//       p.task_count ?? 0,
//       (p.notes || "").replace(/,/g, ";"),
//       (p.project_update || "").replace(/,/g, ";"),
//     ])
//     const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
//     const blob = new Blob([csv], { type: "text/csv" })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement("a")
//     a.href     = url
//     a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`
//     a.click()
//     URL.revokeObjectURL(url)
//     showToast("CSV exported")
//   }

//   // ── Derived stats ─────────────────────────────────────────────────────────

//   const stats = {
//     total:      projects.length,
//     inProgress: projects.filter((p) => p.status === "In Progress").length,
//     delivered:  projects.filter((p) => p.status === "Delivered").length,
//     overdue:    projects.filter(
//       (p) => p.delivery_date && p.status !== "Delivered" && new Date(p.delivery_date) < new Date()
//     ).length,
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

//       {/* ── Page Header ─────────────────────────────────────────────────── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2">
//             <FolderKanban size={20} className="text-[#3A7AFE]" />
//             <h1 className="text-xl font-bold text-gray-900">Projects</h1>
//             {stats.overdue > 0 && (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
//                 <AlertTriangle size={11} />
//                 {stats.overdue} overdue
//               </span>
//             )}
//           </div>
//           <p className="text-sm text-gray-500 mt-0.5">
//             Track and manage all client projects in one place
//           </p>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Refresh */}
//           <button
//             onClick={() => fetchProjects(true)}
//             disabled={refreshing}
//             className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
//             title="Refresh"
//           >
//             <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
//           </button>

//           {/* Export CSV */}
//           <button
//             onClick={handleExport}
//             disabled={!projects.length}
//             className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
//           >
//             <Download size={14} />
//             Export
//           </button>

//           {/* New Project */}
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-1.5 px-4 py-2 bg-[#3A7AFE] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
//           >
//             <Plus size={16} />
//             New Project
//           </button>
//         </div>
//       </div>

//       {/* ── Stat Cards ──────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           label="Total Projects"
//           value={stats.total}
//           icon={FolderKanban}
//           iconBg="bg-blue-50"
//           iconColor="text-[#3A7AFE]"
//         />
//         <StatCard
//           label="In Progress"
//           value={stats.inProgress}
//           icon={TrendingUp}
//           iconBg="bg-indigo-50"
//           iconColor="text-indigo-500"
//         />
//         <StatCard
//           label="Delivered"
//           value={stats.delivered}
//           icon={CheckCircle2}
//           iconBg="bg-emerald-50"
//           iconColor="text-emerald-500"
//         />
//         <StatCard
//           label="Overdue"
//           value={stats.overdue}
//           icon={Clock}
//           iconBg={stats.overdue > 0 ? "bg-red-50" : "bg-gray-50"}
//           iconColor={stats.overdue > 0 ? "text-red-500" : "text-gray-400"}
//           sub={stats.overdue > 0 ? "Need attention" : "All on track"}
//         />
//       </div>

//       {/* ── Error State ──────────────────────────────────────────────────── */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
//           <AlertTriangle size={16} className="text-red-500 shrink-0" />
//           <p className="text-sm text-red-700">{error}</p>
//           <button
//             onClick={() => fetchProjects()}
//             className="ml-auto text-sm text-red-600 hover:underline font-medium"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
//       {loading && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {[...Array(6)].map((_, i) => (
//             <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 animate-pulse">
//               <div className="flex justify-between">
//                 <div className="h-3 bg-gray-100 rounded w-24" />
//                 <div className="h-3 bg-gray-100 rounded w-16" />
//               </div>
//               <div className="h-4 bg-gray-100 rounded w-3/4" />
//               <div className="h-3 bg-gray-100 rounded w-1/2" />
//               <div className="h-2 bg-gray-100 rounded-full w-full mt-2" />
//               <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
//                 <div className="h-3 bg-gray-100 rounded" />
//                 <div className="h-3 bg-gray-100 rounded" />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Project List ─────────────────────────────────────────────────── */}
//       {!loading && !error && (
//         <ProjectList
//           projects={projects}
//           onUpdate={fetchProjects}
//           onEdit={openEdit}
//           onDelete={isAdmin ? handleDelete : undefined}
//           onStatusChange={handleStatusChange}
//           onProgressChange={handleProgressChange}
//         />
//       )}

//       {/* ── Create / Edit Form Dialog ────────────────────────────────────── */}
//       {showForm && (
//         <ProjectForm
//           project={editingProject}
//           onClose={closeForm}
//           onSuccess={handleFormSuccess}
//         />
//       )}

//       {/* ── Confirm Dialog ───────────────────────────────────────────────── */}
//       <ConfirmDialog state={confirm} onClose={closeConfirm} />

//       {/* ── Toasts ───────────────────────────────────────────────────────── */}
//       <ToastContainer toasts={toasts} />
//     </div>
//   )
// }



//testing 


"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, RefreshCw, Download, FolderKanban,
  AlertTriangle, TrendingUp, Clock, CheckCircle2, Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authHeader, jsonAuthHeader, getToken } from "@/lib/auth"
import ProjectList from "@/components/projects/ProjectList"
import ProjectForm from "@/components/projects/ProjectForm"

// ─────────────────────────────────────────────────────────────────────────────

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vcrm-backend.onrender.com/api"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  title: string
  client_id: string | null
  client_name: string | null
  deal_id: string | null
  service: string | null
  description: string | null
  status: "Requirement" | "In Progress" | "Delivered" | "On Hold"
  priority: "Low" | "Medium" | "High" | "Critical"
  start_date: string | null
  delivery_date: string | null
  sales_owner: string | null
  project_manager: string | null
  developer_assigned: string | null
  progress_percentage: number
  completion_percentage: number
  project_update: string | null
  notes: string | null
  task_count: number
  task_done_count: number
  created_by_name: string | null
  created_at: string
  updated_at: string
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  bg: string
  iconColor: string
  highlight?: boolean
}

function StatCard({ label, value, icon: Icon, bg, iconColor, highlight }: StatCardProps) {
  return (
    <div
      className={`${bg} border rounded-xl p-4 flex items-center justify-between ${
        highlight ? "ring-2 ring-red-300 ring-offset-1" : ""
      }`}
    >
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-white p-2.5 rounded-lg shadow-sm">
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: "success" | "error" }

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            t.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
}

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  if (!state.open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-base font-bold text-gray-900">{state.title}</h3>
        <p className="text-sm text-gray-500 mt-1.5">{state.message}</p>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { state.onConfirm(); onClose() }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Content Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectsContent() {
  const { user, isAdmin } = useAuth()

  const [projects,   setProjects]   = useState<Project[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Form dialog
  const [showForm,       setShowForm]       = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([])
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  // Confirm
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: "", message: "", onConfirm: () => {},
  })
  const openConfirm = (title: string, message: string, fn: () => void) =>
    setConfirm({ open: true, title, message, onConfirm: fn })
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }))

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${typeof window !== "undefined" ? getToken() : ""}` },
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : data.projects || [])
    } catch (err: any) {
      setError(err.message || "Failed to load projects")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback((project: Project) => {
    openConfirm(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`${API_BASE}/projects/${project.id}`, {
            method: "DELETE",
            headers: authHeader(),
          })
          if (!res.ok) throw new Error()
          setProjects((prev) => prev.filter((p) => p.id !== project.id))
          showToast("Project deleted")
        } catch {
          showToast("Failed to delete project", "error")
        }
      }
    )
  }, [showToast])

  // ── Quick PATCH: status ───────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (projectId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "PATCH",
        headers: jsonAuthHeader(),
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p)))
      showToast(`Status → ${status}`)
    } catch {
      showToast("Failed to update status", "error")
    }
  }, [showToast])

  // ── Quick PATCH: progress ─────────────────────────────────────────────────

  const handleProgressChange = useCallback(async (projectId: string, progress: number) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "PATCH",
        headers: jsonAuthHeader(),
        body: JSON.stringify({ progress_percentage: progress }),
      })
      if (!res.ok) throw new Error()
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, progress_percentage: progress, completion_percentage: progress }
            : p
        )
      )
    } catch {
      showToast("Failed to update progress", "error")
    }
  }, [showToast])

  // ── Form callbacks ────────────────────────────────────────────────────────

  const openCreate = () => { setEditingProject(null); setShowForm(true) }
  const openEdit   = (p: Project) => { setEditingProject(p); setShowForm(true) }
  const closeForm  = () => { setShowForm(false); setEditingProject(null) }

  const handleFormSuccess = useCallback(() => {
    closeForm()
    showToast(editingProject ? "Project updated" : "Project created")
    fetchProjects(true)
  }, [editingProject, fetchProjects, showToast])

  // ── CSV Export ────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!projects.length) return
    const headers = [
      "Title","Client","Service","Status","Priority",
      "Start Date","Delivery Date","Progress %",
      "Sales Owner","Project Manager","Developer",
      "Tasks Done","Tasks Total","Project Update","Notes",
    ]
    const rows = projects.map((p) => [
      p.title,
      p.client_name || "",
      p.service || "",
      p.status,
      p.priority,
      p.start_date?.slice(0, 10) || "",
      p.delivery_date?.slice(0, 10) || "",
      p.progress_percentage ?? "",
      p.sales_owner || "",
      p.project_manager || "",
      p.developer_assigned || "",
      p.task_done_count ?? 0,
      p.task_count ?? 0,
      (p.project_update || "").replace(/,/g, ";"),
      (p.notes || "").replace(/,/g, ";"),
    ])
    const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast("CSV exported")
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const today = new Date()
  const stats = {
    total:      projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    delivered:  projects.filter((p) => p.status === "Delivered").length,
    onHold:     projects.filter((p) => p.status === "On Hold").length,
    // Critical = explicitly Critical priority OR overdue
    critical:   projects.filter(
      (p) =>
        p.priority === "Critical" ||
        (p.delivery_date && p.status !== "Delivered" && new Date(p.delivery_date) < today)
    ).length,
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            {stats.critical > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <AlertTriangle size={11} />
                {stats.critical} need attention
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all client projects</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => fetchProjects(true)}
            disabled={refreshing}
            title="Refresh"
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={!projects.length}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <Download size={14} />
            Export
          </button>

          {/* New Project */}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <Plus size={17} />
            New Project
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total"              value={stats.total}      icon={TrendingUp}   bg="bg-blue-50   border-blue-100"   iconColor="text-blue-600"   />
        <StatCard label="In Progress"        value={stats.inProgress} icon={FolderKanban} bg="bg-yellow-50  border-yellow-100" iconColor="text-yellow-600" />
        <StatCard label="Delivered"          value={stats.delivered}  icon={CheckCircle2} bg="bg-green-50  border-green-100"  iconColor="text-green-600"  />
        <StatCard label="On Hold"            value={stats.onHold}     icon={Clock}        bg="bg-gray-50   border-gray-200"   iconColor="text-gray-500"   />
        <StatCard
          label="Critical / Overdue"
          value={stats.critical}
          icon={Zap}
          bg="bg-red-50 border-red-100"
          iconColor="text-red-500"
          highlight={stats.critical > 0}
        />
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchProjects()}
            className="ml-auto text-sm text-red-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-500 text-sm">Loading projects...</p>
        </div>
      ) : (
        /* ── Project List ──────────────────────────────────────────────── */
        <ProjectList
          projects={projects}
          onUpdate={() => fetchProjects(true)}
          onEdit={openEdit}
          onDelete={isAdmin ? handleDelete : undefined}
          onStatusChange={handleStatusChange}
          onProgressChange={handleProgressChange}
        />
      )}

      {/* ── Create / Edit Form ───────────────────────────────────────────── */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* ── Confirm Dialog ───────────────────────────────────────────────── */}
      <ConfirmDialog state={confirm} onClose={closeConfirm} />

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}