// 'use client';
// import { authHeader, jsonAuthHeader, getToken } from '@/lib/auth';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { ArrowLeft, Download, Edit, Zap, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
// import ProjectOverview  from '@/components/projects/ProjectOverview';
// import TaskTracking     from '@/components/projects/TaskTracking';
// import NotesDiscussion  from '@/components/projects/NotesDiscussion';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// // ── Tab config ────────────────────────────────────────────────────────────────

// const TABS = [
//     { id: 'overview', label: 'Overview',     emoji: '📊' },
//     { id: 'tasks',    label: 'Tasks',         emoji: '✅' },
//     { id: 'notes',    label: 'Notes',         emoji: '💬' },
// ];

// // ── Status / Priority helpers ─────────────────────────────────────────────────

// const STATUS_COLORS = {
//     'Requirement': 'bg-purple-100 text-purple-800 border-purple-200',
//     'In Progress':  'bg-blue-100   text-blue-800   border-blue-200',
//     'Delivered':    'bg-green-100  text-green-800  border-green-200',
//     'On Hold':      'bg-yellow-100 text-yellow-800 border-yellow-200',
// };

// const PRIORITY_CONFIG = {
//     Low:      { cls: 'bg-gray-100   text-gray-600',   icon: Shield        },
//     Medium:   { cls: 'bg-blue-100   text-blue-700',   icon: TrendingUp    },
//     High:     { cls: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
//     Critical: { cls: 'bg-red-100    text-red-700',    icon: Zap           },
// };

// // ── Page ──────────────────────────────────────────────────────────────────────

// export default function ProjectDetailPage() {
//     const params = useParams();
//     const router = useRouter();

//     const [project,   setProject]   = useState(null);
//     const [loading,   setLoading]   = useState(true);
//     const [activeTab, setActiveTab] = useState('overview');

//     useEffect(() => {
//         if (!params?.id) return;
//         fetchProject();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [params.id]);

//     const fetchProject = async () => {
//         try {
//             setLoading(true);
//             const res = await fetch(`${API_BASE}/projects/${params.id}`, {
//                 headers: {
//                     Authorization: `Bearer ${typeof window !== 'undefined' ? getToken() : ''}`,
//                 },
//             });
//             if (res.ok) setProject(await res.json());
//             else { console.error('Failed:', await res.text()); setProject(null); }
//         } catch (e) { console.error(e); setProject(null); }
//         finally { setLoading(false); }
//     };

//     const handleExport = async () => {
//         if (!project?.id) return;
//         try {
//             const res = await fetch(`${API_BASE}/projects/${project.id}/report`, {
//                 headers: {
//                     Authorization: `Bearer ${getToken()}`,
//                 },
//             });
//             if (!res.ok) { console.error('Export failed', await res.text()); return; }
//             const blob = await res.blob();
//             const url  = window.URL.createObjectURL(blob);
//             const a    = Object.assign(document.createElement('a'), { href: url, download: `${project.title || 'project'}-report.pdf` });
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//             window.URL.revokeObjectURL(url);
//         } catch (e) { console.error(e); }
//     };

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full py-32">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
//                 <p className="text-gray-500 text-sm">Loading project...</p>
//             </div>
//         );
//     }

//     if (!project) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full py-32">
//                 <p className="text-lg text-gray-600 mb-4">Project not found.</p>
//                 <button onClick={() => router.push('/projects')} className="text-blue-600 hover:underline text-sm">
//                     ← Back to Projects
//                 </button>
//             </div>
//         );
//     }

//     const prio     = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.Medium;
//     const PrioIcon = prio.icon;
//     const pct      = project.progress_percentage ?? 0;
//     const isOverdue =
//         project.delivery_date &&
//         project.status !== 'Delivered' &&
//         new Date(project.delivery_date) < new Date();

//     return (
//         <div className="flex flex-col h-full">

//             {/* ── Sticky header ── */}
//             <div className="bg-white border-b sticky top-0 z-10">
//                 <div className="px-6 pt-4 pb-0">

//                     {/* Top row */}
//                     <div className="flex items-start justify-between gap-4 pb-4">
//                         <div className="flex items-start gap-3 min-w-0">
//                             <button
//                                 onClick={() => router.push('/projects')}
//                                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5 shrink-0"
//                             >
//                                 <ArrowLeft size={18} />
//                             </button>
//                             <div className="min-w-0">
//                                 {/* Breadcrumb */}
//                                 <p className="text-xs text-gray-400 mb-1">Projects / {project.client_name || 'No client'}</p>

//                                 {/* Title + badges */}
//                                 <div className="flex items-center gap-2 flex-wrap">
//                                     <h1 className="text-xl font-bold text-gray-900 truncate">{project.title}</h1>
//                                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[project.status] || ''}`}>
//                                         {project.status}
//                                     </span>
//                                     {project.priority && (
//                                         <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${prio.cls}`}>
//                                             <PrioIcon size={11} />
//                                             {project.priority}
//                                         </span>
//                                     )}
//                                     {isOverdue && (
//                                         <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
//                                             Overdue
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Sub info */}
//                                 <p className="text-sm text-gray-500 mt-1">
//                                     {project.client_name || 'No client'}
//                                     {project.service     ? ` · ${project.service}` : ''}
//                                     {project.project_manager ? ` · PM: ${project.project_manager}` : ''}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 shrink-0">
//                             <button
//                                 onClick={handleExport}
//                                 className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
//                             >
//                                 <Download size={14} />
//                                 Export
//                             </button>
//                             <button
//                                 onClick={() => router.push(`/projects/${project.id}/edit`)}
//                                 className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
//                             >
//                                 <Edit size={14} />
//                                 Edit
//                             </button>
//                         </div>
//                     </div>

//                     {/* Progress bar */}
//                     {typeof pct === 'number' && (
//                         <div className="ml-11 mb-3">
//                             <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//                                 <span>Progress</span>
//                                 <span className="font-semibold text-gray-800">{pct}%</span>
//                             </div>
//                             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                 <div
//                                     className={`h-full rounded-full transition-all duration-500 ${
//                                         pct >= 100 ? 'bg-green-500' : 'bg-blue-600'
//                                     }`}
//                                     style={{ width: `${pct}%` }}
//                                 />
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Tab bar */}
//                 <div className="px-6 flex gap-0 overflow-x-auto border-t border-gray-100">
//                     {TABS.map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
//                                 activeTab === tab.id
//                                     ? 'border-blue-600 text-blue-600'
//                                     : 'border-transparent text-gray-500 hover:text-gray-800'
//                             }`}
//                         >
//                             <span>{tab.emoji}</span>
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* ── Tab content ── */}
//             <div className="flex-1 overflow-y-auto p-6">
//                 {activeTab === 'overview' && <ProjectOverview project={project} onUpdate={fetchProject} />}
//                 {activeTab === 'tasks'    && <TaskTracking project={project} />}
//                 {activeTab === 'notes'    && <NotesDiscussion projectId={project.id} />}
//             </div>
//         </div>
//     );
// }



//testing (20-05-2026)



// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//     ArrowLeft, Download, Edit, Zap, AlertTriangle,
//     TrendingUp, Shield, X,
// } from 'lucide-react';
// import { getToken, authHeader, jsonAuthHeader } from '@/lib/auth';
// import ProjectOverview  from '@/components/projects/ProjectOverview';
// import TaskTracking     from '@/components/projects/TaskTracking';
// import NotesDiscussion  from '@/components/projects/NotesDiscussion';
// import TeamAllocation   from '@/components/projects/TeamAllocation';
// import ProjectForm      from '@/components/projects/ProjectForm';

// // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://vcrm-backend.onrender.com/api';

// // ── Tab config ────────────────────────────────────────────────────────────────

// const TABS = [
//     { id: 'overview', label: 'Overview', emoji: '📊' },
//     { id: 'tasks',    label: 'Tasks',    emoji: '✅' },
//     { id: 'notes',    label: 'Notes',    emoji: '💬' },
//     { id: 'team',     label: 'Team',     emoji: '👥' },
// ];

// // ── Status / Priority helpers ─────────────────────────────────────────────────

// const STATUS_COLORS: Record<string, string> = {
//     'Requirement': 'bg-purple-100 text-purple-800 border-purple-200',
//     'In Progress': 'bg-blue-100   text-blue-800   border-blue-200',
//     'Delivered':   'bg-green-100  text-green-800  border-green-200',
//     'On Hold':     'bg-yellow-100 text-yellow-800 border-yellow-200',
// };

// const PRIORITY_CONFIG: Record<string, { cls: string; icon: React.ElementType }> = {
//     Low:      { cls: 'bg-gray-100   text-gray-600',   icon: Shield        },
//     Medium:   { cls: 'bg-blue-100   text-blue-700',   icon: TrendingUp    },
//     High:     { cls: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
//     Critical: { cls: 'bg-red-100    text-red-700',    icon: Zap           },
// };

// // ── Toast ─────────────────────────────────────────────────────────────────────

// interface Toast { id: number; message: string; type: 'success' | 'error' }

// function ToastContainer({ toasts }: { toasts: Toast[] }) {
//     return (
//         <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
//             {toasts.map(t => (
//                 <div key={t.id}
//                     className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
//                         t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
//                     }`}>
//                     {t.message}
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ── Page ──────────────────────────────────────────────────────────────────────

// export default function ProjectDetailPage() {
//     const params = useParams();
//     const router = useRouter();

//     const [project,    setProject]    = useState<any>(null);
//     const [loading,    setLoading]    = useState(true);
//     const [activeTab,  setActiveTab]  = useState('overview');
//     const [showEdit,   setShowEdit]   = useState(false);

//     // Toast
//     const [toasts, setToasts] = useState<Toast[]>([]);
//     const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
//         const id = Date.now();
//         setToasts(prev => [...prev, { id, message, type }]);
//         setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
//     }, []);

//     const fetchProject = useCallback(async () => {
//         if (!params?.id) return;
//         try {
//             setLoading(true);
//             const res = await fetch(`${API_BASE}/projects/${params.id}`, {
//                 headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? getToken() : ''}` },
//             });
//             if (res.ok) setProject(await res.json());
//             else { console.error('Failed:', await res.text()); setProject(null); }
//         } catch (e) {
//             console.error(e); setProject(null);
//         } finally {
//             setLoading(false);
//         }
//     }, [params?.id]);

//     useEffect(() => { fetchProject(); }, [fetchProject]);

//     // ── Export (PDF if backend supports it, else graceful error) ─────────────

//     const handleExport = async () => {
//         if (!project?.id) return;
//         try {
//             const res = await fetch(`${API_BASE}/projects/${project.id}/report`, {
//                 headers: { Authorization: `Bearer ${getToken()}` },
//             });
//             if (!res.ok) { showToast('Export not available', 'error'); return; }
//             const blob = await res.blob();
//             const url  = window.URL.createObjectURL(blob);
//             const a    = Object.assign(document.createElement('a'), {
//                 href: url,
//                 download: `${project.title || 'project'}-report.pdf`,
//             });
//             document.body.appendChild(a);
//             a.click(); a.remove();
//             window.URL.revokeObjectURL(url);
//         } catch (e) {
//             console.error(e);
//             showToast('Export failed', 'error');
//         }
//     };

//     // ── Edit form success ─────────────────────────────────────────────────────

//     const handleEditSuccess = () => {
//         setShowEdit(false);
//         showToast('Project updated');
//         fetchProject();
//     };

//     // ─────────────────────────────────────────────────────────────────────────
//     // Loading / Not Found
//     // ─────────────────────────────────────────────────────────────────────────

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full py-32">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A7AFE] mb-4" />
//                 <p className="text-gray-500 text-sm">Loading project...</p>
//             </div>
//         );
//     }

//     if (!project) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full py-32">
//                 <p className="text-lg text-gray-600 mb-4">Project not found.</p>
//                 <button onClick={() => router.push('/projects')} className="text-[#3A7AFE] hover:underline text-sm">
//                     ← Back to Projects
//                 </button>
//             </div>
//         );
//     }

//     const prio      = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.Medium;
//     const PrioIcon  = prio.icon;
//     const pct       = project.progress_percentage ?? project.completion_percentage ?? 0;
//     const isOverdue =
//         project.delivery_date &&
//         project.status !== 'Delivered' &&
//         new Date(project.delivery_date) < new Date();

//     // ─────────────────────────────────────────────────────────────────────────
//     // Render
//     // ─────────────────────────────────────────────────────────────────────────

//     return (
//         <div className="flex flex-col h-full">

//             {/* ── Sticky header ─────────────────────────────────────────── */}
//             <div className="bg-white border-b sticky top-0 z-10">
//                 <div className="px-6 pt-4 pb-0">

//                     {/* Top row */}
//                     <div className="flex items-start justify-between gap-4 pb-4">
//                         <div className="flex items-start gap-3 min-w-0">
//                             {/* Back */}
//                             <button
//                                 onClick={() => router.push('/projects')}
//                                 className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-0.5 shrink-0"
//                             >
//                                 <ArrowLeft size={18} />
//                             </button>

//                             <div className="min-w-0">
//                                 {/* Breadcrumb */}
//                                 <p className="text-xs text-gray-400 mb-1">
//                                     Projects / {project.client_name || 'No client'}
//                                 </p>

//                                 {/* Title + badges */}
//                                 <div className="flex items-center gap-2 flex-wrap">
//                                     <h1 className="text-xl font-bold text-gray-900 truncate">
//                                         {project.title}
//                                     </h1>
//                                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[project.status] || ''}`}>
//                                         {project.status}
//                                     </span>
//                                     {project.priority && (
//                                         <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${prio.cls}`}>
//                                             <PrioIcon size={11} />
//                                             {project.priority}
//                                         </span>
//                                     )}
//                                     {isOverdue && (
//                                         <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
//                                             Overdue
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Sub info */}
//                                 <p className="text-sm text-gray-500 mt-1">
//                                     {project.client_name || 'No client'}
//                                     {project.service          ? ` · ${project.service}`          : ''}
//                                     {project.project_manager  ? ` · PM: ${project.project_manager}` : ''}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 shrink-0">
//                             <button
//                                 onClick={handleExport}
//                                 className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors text-gray-600"
//                             >
//                                 <Download size={14} />
//                                 Export
//                             </button>
//                             <button
//                                 onClick={() => setShowEdit(true)}
//                                 className="flex items-center gap-1.5 px-3 py-2 bg-[#3A7AFE] text-white rounded-xl text-sm hover:bg-[#2563EB] transition-colors font-medium"
//                             >
//                                 <Edit size={14} />
//                                 Edit
//                             </button>
//                         </div>
//                     </div>

//                     {/* Progress bar */}
//                     <div className="ml-11 mb-3">
//                         <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//                             <span>Progress</span>
//                             <span className="font-semibold text-gray-800">{pct}%</span>
//                         </div>
//                         <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                             <div
//                                 className={`h-full rounded-full transition-all duration-500 ${
//                                     pct >= 100 ? 'bg-green-500' : 'bg-[#3A7AFE]'
//                                 }`}
//                                 style={{ width: `${pct}%` }}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Tab bar */}
//                 <div className="px-6 flex gap-0 overflow-x-auto border-t border-gray-100">
//                     {TABS.map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
//                                 activeTab === tab.id
//                                     ? 'border-[#3A7AFE] text-[#3A7AFE]'
//                                     : 'border-transparent text-gray-500 hover:text-gray-800'
//                             }`}
//                         >
//                             <span>{tab.emoji}</span>
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* ── Tab content ───────────────────────────────────────────── */}
//             <div className="flex-1 overflow-y-auto p-6">
//                 {activeTab === 'overview' && (
//                     <ProjectOverview project={project} onUpdate={fetchProject} />
//                 )}
//                 {activeTab === 'tasks' && (
//                     <TaskTracking project={project} />
//                 )}
//                 {activeTab === 'notes' && (
//                     <NotesDiscussion projectId={project.id} />
//                 )}
//                 {activeTab === 'team' && (
//                     <TeamAllocation project={project} onUpdate={fetchProject} />
//                 )}
//             </div>

//             {/* ── Edit Form (inline dialog, same as list page) ──────────── */}
//             {showEdit && (
//                 <ProjectForm
//                     project={project}
//                     onClose={() => setShowEdit(false)}
//                     onSuccess={handleEditSuccess}
//                 />
//             )}

//             {/* ── Toasts ────────────────────────────────────────────────── */}
//             <ToastContainer toasts={toasts} />
//         </div>
//     );
// }


//testing 2
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Download, Edit, Zap, AlertTriangle,
    TrendingUp, Shield,
    type LucideIcon,
} from 'lucide-react';
import { getToken, authHeader } from '@/lib/auth';
import ProjectOverview from '@/components/projects/ProjectOverview';
import TaskTracking    from '@/components/projects/TaskTracking';
import NotesDiscussion from '@/components/projects/NotesDiscussion';
import TeamAllocation  from '@/components/projects/TeamAllocation';
import ProjectForm     from '@/components/projects/ProjectForm';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://vcrm-backend.onrender.com/api';

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'tasks',    label: 'Tasks',    emoji: '✅' },
    { id: 'notes',    label: 'Notes',    emoji: '💬' },
    { id: 'team',     label: 'Team',     emoji: '👥' },
];

// ── Status / Priority helpers ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    'Requirement': 'bg-purple-100 text-purple-800 border-purple-200',
    'In Progress': 'bg-blue-100   text-blue-800   border-blue-200',
    'Delivered':   'bg-green-100  text-green-800  border-green-200',
    'On Hold':     'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const PRIORITY_CONFIG: Record<string, { cls: string; icon: LucideIcon }> = {
    Low:      { cls: 'bg-gray-100   text-gray-600',   icon: Shield        },
    Medium:   { cls: 'bg-blue-100   text-blue-700',   icon: TrendingUp    },
    High:     { cls: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    Critical: { cls: 'bg-red-100    text-red-700',    icon: Zap           },
};

// ── Toast ─────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
                        t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [project,   setProject]   = useState<any>(null);
    const [loading,   setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEdit,  setShowEdit]  = useState(false);

    // Toast
    const [toasts, setToasts] = useState<Toast[]>([]);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    // Resolve id safely — useParams can return string | string[]
    const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? getToken() : ''}` },
            });
            if (res.ok) setProject(await res.json());
            else { console.error('Failed:', await res.text()); setProject(null); }
        } catch (e) {
            console.error(e);
            setProject(null);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchProject(); }, [fetchProject]);

    // ── Export ────────────────────────────────────────────────────────────────

    const handleExport = async () => {
        if (!project?.id) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${project.id}/report`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) { showToast('Export not available', 'error'); return; }
            const blob = await res.blob();
            const url  = window.URL.createObjectURL(blob);
            const a    = Object.assign(document.createElement('a'), {
                href:     url,
                download: `${project.title || 'project'}-report.pdf`,
            });
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            showToast('Export failed', 'error');
        }
    };

    // ── Edit success ──────────────────────────────────────────────────────────

    const handleEditSuccess = () => {
        setShowEdit(false);
        showToast('Project updated');
        fetchProject();
    };

    // ── Loading / Not Found ───────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A7AFE] mb-4" />
                <p className="text-gray-500 text-sm">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-32">
                <p className="text-lg text-gray-600 mb-4">Project not found.</p>
                <button
                    onClick={() => router.push('/projects')}
                    className="text-[#3A7AFE] hover:underline text-sm"
                >
                    ← Back to Projects
                </button>
            </div>
        );
    }

    const prio     = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.Medium;
    const PrioIcon = prio.icon;
    const pct      = project.progress_percentage ?? project.completion_percentage ?? 0;
    const isOverdue =
        project.delivery_date &&
        project.status !== 'Delivered' &&
        new Date(project.delivery_date) < new Date();

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full">

            {/* ── Sticky header ─────────────────────────────────────────── */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="px-6 pt-4 pb-0">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 pb-4">
                        <div className="flex items-start gap-3 min-w-0">
                            {/* Back */}
                            <button
                                onClick={() => router.push('/projects')}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-0.5 shrink-0"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div className="min-w-0">
                                {/* Breadcrumb */}
                                <p className="text-xs text-gray-400 mb-1">
                                    Projects / {project.client_name || 'No client'}
                                </p>

                                {/* Title + badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 truncate">
                                        {project.title}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[project.status] || ''}`}>
                                        {project.status}
                                    </span>
                                    {project.priority && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${prio.cls}`}>
                                            <PrioIcon size={11} />
                                            {project.priority}
                                        </span>
                                    )}
                                    {isOverdue && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                            Overdue
                                        </span>
                                    )}
                                </div>

                                {/* Sub info */}
                                <p className="text-sm text-gray-500 mt-1">
                                    {project.client_name || 'No client'}
                                    {project.service         ? ` · ${project.service}`              : ''}
                                    {project.project_manager ? ` · PM: ${project.project_manager}`  : ''}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors text-gray-600"
                            >
                                <Download size={14} />
                                Export
                            </button>
                            <button
                                onClick={() => setShowEdit(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#3A7AFE] text-white rounded-xl text-sm hover:bg-[#2563EB] transition-colors font-medium"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="ml-11 mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold text-gray-800">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    pct >= 100 ? 'bg-green-500' : 'bg-[#3A7AFE]'
                                }`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="px-6 flex gap-0 overflow-x-auto border-t border-gray-100">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-[#3A7AFE] text-[#3A7AFE]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <span>{tab.emoji}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab content ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                    <ProjectOverview project={project} onUpdate={fetchProject} />
                )}
                {activeTab === 'tasks' && (
                    <TaskTracking project={project} />
                )}
                {activeTab === 'notes' && (
                    <NotesDiscussion projectId={project.id} />
                )}
                {activeTab === 'team' && (
                    <TeamAllocation project={project} onUpdate={fetchProject} />
                )}
            </div>

            {/* ── Edit Form ─────────────────────────────────────────────── */}
            {showEdit && (
                <ProjectForm
                    project={project}
                    onClose={() => setShowEdit(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* ── Toasts ────────────────────────────────────────────────── */}
            <ToastContainer toasts={toasts} />
        </div>
    );
}