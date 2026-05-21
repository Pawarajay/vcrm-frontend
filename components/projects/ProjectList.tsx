// 'use client';

// import { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Calendar, Briefcase, User, Search, SlidersHorizontal,
//     CheckCircle2, Clock, Loader2, Circle, X, ChevronDown
// } from 'lucide-react';

// // ── Constants ─────────────────────────────────────────────────────────────────

// const STATUS_CONFIG = {
//     'Requirement': {
//         bar: 'bg-purple-50 text-purple-700',
//         dot: 'bg-purple-500',
//         border: 'hover:border-purple-400',
//         icon: Circle,
//         iconColor: 'text-purple-400',
//     },
//     'In Progress': {
//         bar: 'bg-blue-50 text-blue-700',
//         dot: 'bg-blue-500',
//         border: 'hover:border-blue-400',
//         icon: Loader2,
//         iconColor: 'text-blue-400',
//     },
//     'Delivered': {
//         bar: 'bg-green-50 text-green-700',
//         dot: 'bg-green-500',
//         border: 'hover:border-green-400',
//         icon: CheckCircle2,
//         iconColor: 'text-green-500',
//     },
//     'On Hold': {
//         bar: 'bg-yellow-50 text-yellow-700',
//         dot: 'bg-yellow-500',
//         border: 'hover:border-yellow-400',
//         icon: Clock,
//         iconColor: 'text-yellow-500',
//     },
// };

// const ALL_STATUSES = Object.keys(STATUS_CONFIG);

// const SERVICE_OPTIONS = [
//     'Website',
//     'WhatsApp API',
//     'LMS',
//     'CRM',
//     'Social Media',
//     'Other',
// ];

// // ── Helpers ───────────────────────────────────────────────────────────────────

// const fmtDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const d = new Date(dateStr);
//     if (isNaN(d)) return 'N/A';
//     return d.toLocaleDateString('en-IN', {
//         day: 'numeric', month: 'short', year: 'numeric',
//     });
// };

// const isGoLiveOverdue = (dateStr, status) => {
//     if (!dateStr || status === 'Delivered') return false;
//     return new Date(dateStr) < new Date();
// };

// const getStatusConfig = (status) =>
//     STATUS_CONFIG[status] || STATUS_CONFIG['Requirement'];

// // ── Task Progress Mini-bar ────────────────────────────────────────────────────

// function TaskProgress({ total = 0, done = 0 }) {
//     if (total === 0) return null;
//     const pct = Math.round((done / total) * 100);
//     return (
//         <div className="flex items-center gap-2">
//             <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                 <div
//                     className="h-full bg-blue-500 rounded-full transition-all duration-500"
//                     style={{ width: `${pct}%` }}
//                 />
//             </div>
//             <span className="text-xs text-gray-400 whitespace-nowrap">
//                 {done}/{total} tasks
//             </span>
//         </div>
//     );
// }

// // ── Project Card ──────────────────────────────────────────────────────────────

// function ProjectCard({ project }) {
//     const router      = useRouter();
//     const cfg         = getStatusConfig(project.status);
//     const StatusIcon  = cfg.icon;
//     const overdue     = isGoLiveOverdue(project.delivery_date, project.status);

//     const taskTotal   = project.task_count       ?? 0;
//     const taskDone    = project.task_done_count   ?? 0;

//     return (
//         <div
//             onClick={() => router.push(`/projects/${project.id}`)}
//             className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 ${cfg.border} flex flex-col`}
//         >
//             <div className="p-5 flex-1">

//                 {/* ── Status row ── */}
//                 <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                         <StatusIcon
//                             size={15}
//                             className={`${cfg.iconColor} ${project.status === 'In Progress' ? 'animate-spin' : ''}`}
//                         />
//                         <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
//                             {project.status}
//                         </span>
//                     </div>

//                     {/* Overdue chip */}
//                     {overdue && (
//                         <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
//                             Overdue
//                         </span>
//                     )}
//                 </div>

//                 {/* ── Title ── */}
//                 <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-3 leading-snug">
//                     {project.title}
//                 </h3>

//                 {/* ── Client & Service ── */}
//                 <div className="space-y-1.5 mb-4">
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <User size={13} className="text-gray-400 shrink-0" />
//                         <span className="truncate">{project.client_name || 'No Client'}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <Briefcase size={13} className="text-gray-400 shrink-0" />
//                         <span className="truncate">{project.service || '—'}</span>
//                     </div>
//                 </div>

//                 {/* ── Task progress (only if tasks exist) ── */}
//                 <TaskProgress total={taskTotal} done={taskDone} />

//             </div>

//             {/* ── Dates footer ── */}
//             <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 gap-3">
//                 <div>
//                     <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
//                     <div className="flex items-center gap-1">
//                         <Calendar size={11} className="text-gray-400 shrink-0" />
//                         <span className="text-xs font-medium text-gray-700">
//                             {fmtDate(project.start_date)}
//                         </span>
//                     </div>
//                 </div>
//                 <div>
//                     <p className={`text-xs mb-0.5 ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
//                         Go-Live Date
//                     </p>
//                     <div className="flex items-center gap-1">
//                         <Calendar size={11} className={`shrink-0 ${overdue ? 'text-red-400' : 'text-gray-400'}`} />
//                         <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
//                             {fmtDate(project.delivery_date)}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* ── Status colour bar ── */}
//             <div className={`px-5 py-2 rounded-b-xl text-xs font-semibold text-center tracking-wide uppercase ${cfg.bar}`}>
//                 {project.status}
//             </div>
//         </div>
//     );
// }

// // ── Filter Bar ────────────────────────────────────────────────────────────────

// function FilterBar({ filters, onChange, clientOptions, onClear }) {
//     const [open, setOpen] = useState(false);
//     const hasActive =
//         filters.status !== 'All' ||
//         filters.service !== 'All' ||
//         filters.client !== 'All';

//     return (
//         <div className="relative">
//             <button
//                 onClick={() => setOpen((o) => !o)}
//                 className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
//                     hasActive
//                         ? 'border-blue-500 bg-blue-50 text-blue-700'
//                         : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
//                 }`}
//             >
//                 <SlidersHorizontal size={15} />
//                 Filters
//                 {hasActive && (
//                     <span className="w-2 h-2 bg-blue-600 rounded-full" />
//                 )}
//                 <ChevronDown size={13} />
//             </button>

//             {open && (
//                 <div className="absolute left-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-[260px] space-y-4">

//                     {/* Status */}
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
//                             Status
//                         </label>
//                         <div className="flex flex-wrap gap-1.5">
//                             {['All', ...ALL_STATUSES].map((s) => (
//                                 <button
//                                     key={s}
//                                     onClick={() => onChange({ ...filters, status: s })}
//                                     className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
//                                         filters.status === s
//                                             ? 'bg-blue-600 text-white'
//                                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                                     }`}
//                                 >
//                                     {s}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Service */}
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
//                             Service
//                         </label>
//                         <select
//                             value={filters.service}
//                             onChange={(e) => onChange({ ...filters, service: e.target.value })}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         >
//                             <option value="All">All Services</option>
//                             {SERVICE_OPTIONS.map((s) => (
//                                 <option key={s} value={s}>{s}</option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Client */}
//                     {clientOptions.length > 0 && (
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
//                                 Client
//                             </label>
//                             <select
//                                 value={filters.client}
//                                 onChange={(e) => onChange({ ...filters, client: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                                 <option value="All">All Clients</option>
//                                 {clientOptions.map((c) => (
//                                     <option key={c} value={c}>{c}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}

//                     {/* Clear */}
//                     {hasActive && (
//                         <button
//                             onClick={() => { onClear(); setOpen(false); }}
//                             className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
//                         >
//                             <X size={13} /> Clear all filters
//                         </button>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// // ── Summary Stats ─────────────────────────────────────────────────────────────

// function SummaryStats({ projects }) {
//     const counts = useMemo(() => {
//         const map = { total: projects.length };
//         ALL_STATUSES.forEach((s) => {
//             map[s] = projects.filter((p) => p.status === s).length;
//         });
//         return map;
//     }, [projects]);

//     const stats = [
//         { label: 'Total',       value: counts.total,          color: 'text-gray-800',  bg: 'bg-gray-100'   },
//         { label: 'Requirement', value: counts['Requirement'],  color: 'text-purple-700',bg: 'bg-purple-50'  },
//         { label: 'In Progress', value: counts['In Progress'],  color: 'text-blue-700',  bg: 'bg-blue-50'    },
//         { label: 'Delivered',   value: counts['Delivered'],    color: 'text-green-700', bg: 'bg-green-50'   },
//         { label: 'On Hold',     value: counts['On Hold'],      color: 'text-yellow-700',bg: 'bg-yellow-50'  },
//     ];

//     return (
//         <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
//             {stats.map((s) => (
//                 <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 text-center`}>
//                     <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ── Main Component ────────────────────────────────────────────────────────────

// export default function ProjectList({ projects, onUpdate }) {
//     const [search, setSearch]   = useState('');
//     const [filters, setFilters] = useState({
//         status:  'All',
//         service: 'All',
//         client:  'All',
//     });

//     // Unique client names from the projects list for the filter dropdown
//     const clientOptions = useMemo(() => {
//         const names = projects
//             .map((p) => p.client_name)
//             .filter(Boolean);
//         return [...new Set(names)].sort();
//     }, [projects]);

//     // Apply search + filters
//     const filtered = useMemo(() => {
//         return projects.filter((p) => {
//             const q = search.toLowerCase();

//             const matchSearch =
//                 !q ||
//                 p.title?.toLowerCase().includes(q)       ||
//                 p.client_name?.toLowerCase().includes(q) ||
//                 p.service?.toLowerCase().includes(q);

//             const matchStatus  = filters.status  === 'All' || p.status       === filters.status;
//             const matchService = filters.service === 'All' || p.service      === filters.service;
//             const matchClient  = filters.client  === 'All' || p.client_name  === filters.client;

//             return matchSearch && matchStatus && matchService && matchClient;
//         });
//     }, [projects, search, filters]);

//     const clearFilters = () => {
//         setSearch('');
//         setFilters({ status: 'All', service: 'All', client: 'All' });
//     };

//     const hasAnyFilter =
//         search !== '' ||
//         filters.status  !== 'All' ||
//         filters.service !== 'All' ||
//         filters.client  !== 'All';

//     // ── Empty state (no projects at all) ──
//     if (projects.length === 0) {
//         return (
//             <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
//                 <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
//                 <p className="text-gray-500 font-medium text-lg">No projects yet</p>
//                 <p className="text-gray-400 text-sm mt-1">
//                     Create your first project to get started.
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-5">

//             {/* ── Summary stats ── */}
//             <SummaryStats projects={projects} />

//             {/* ── Search + Filter row ── */}
//             <div className="flex flex-col sm:flex-row gap-3">

//                 {/* Search */}
//                 <div className="relative flex-1">
//                     <Search
//                         size={16}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                     />
//                     <input
//                         type="text"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         placeholder="Search by project name, client, or service..."
//                         className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     {search && (
//                         <button
//                             onClick={() => setSearch('')}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                         >
//                             <X size={15} />
//                         </button>
//                     )}
//                 </div>

//                 {/* Filter dropdown */}
//                 <FilterBar
//                     filters={filters}
//                     onChange={setFilters}
//                     clientOptions={clientOptions}
//                     onClear={clearFilters}
//                 />
//             </div>

//             {/* ── Results count ── */}
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-gray-500">
//                     Showing{' '}
//                     <span className="font-semibold text-gray-800">{filtered.length}</span>
//                     {' '}of{' '}
//                     <span className="font-semibold text-gray-800">{projects.length}</span>
//                     {' '}projects
//                 </p>
//                 {hasAnyFilter && filtered.length !== projects.length && (
//                     <button
//                         onClick={clearFilters}
//                         className="text-xs text-blue-600 hover:underline flex items-center gap-1"
//                     >
//                         <X size={12} /> Clear filters
//                     </button>
//                 )}
//             </div>

//             {/* ── No results after filtering ── */}
//             {filtered.length === 0 ? (
//                 <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
//                     <Search size={36} className="mx-auto text-gray-300 mb-3" />
//                     <p className="text-gray-500 font-medium">No projects match your search</p>
//                     <p className="text-gray-400 text-sm mt-1">
//                         Try different keywords or clear the filters.
//                     </p>
//                     <button
//                         onClick={clearFilters}
//                         className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
//                     >
//                         Clear filters
//                     </button>
//                 </div>
//             ) : (
//                 /* ── Project grid ── */
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                     {filtered.map((project) => (
//                         <ProjectCard key={project.id} project={project} />
//                     ))}
//                 </div>
//             )}

//         </div>
//     );
// }


//testing (19-05-2026)


// 'use client';

// import { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Calendar, Briefcase, User, Search, SlidersHorizontal,
//     CheckCircle2, Clock, Loader2, Circle, X, ChevronDown,
//     Zap, AlertTriangle, TrendingUp, Shield, Users,
//     Pencil, Trash2, MoreVertical, ChevronRight,
// } from 'lucide-react';

// // ── Status config ─────────────────────────────────────────────────────────────

// const STATUS_CONFIG = {
//     'Requirement': { bar: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500', border: 'hover:border-purple-300', icon: Circle,       iconColor: 'text-purple-400' },
//     'In Progress': { bar: 'bg-blue-50   text-blue-700',   dot: 'bg-blue-500',   border: 'hover:border-blue-300',   icon: Loader2,      iconColor: 'text-blue-400'   },
//     'Delivered':   { bar: 'bg-green-50  text-green-700',  dot: 'bg-green-500',  border: 'hover:border-green-300',  icon: CheckCircle2, iconColor: 'text-green-500'  },
//     'On Hold':     { bar: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', border: 'hover:border-yellow-300', icon: Clock,        iconColor: 'text-yellow-500' },
// };

// // ── Priority config ───────────────────────────────────────────────────────────

// const PRIORITY_CONFIG = {
//     Low:      { cls: 'bg-gray-100   text-gray-600',   icon: Shield,        dot: 'bg-gray-400'   },
//     Medium:   { cls: 'bg-blue-100   text-blue-700',   icon: TrendingUp,    dot: 'bg-blue-500'   },
//     High:     { cls: 'bg-orange-100 text-orange-700', icon: AlertTriangle, dot: 'bg-orange-500' },
//     Critical: { cls: 'bg-red-100    text-red-700',    icon: Zap,           dot: 'bg-red-500'    },
// };

// const ALL_STATUSES   = ['Requirement', 'In Progress', 'Delivered', 'On Hold'];
// const ALL_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
// const SERVICE_OPTIONS = ['Website', 'WhatsApp API', 'LMS', 'CRM', 'Social Media', 'Other'];

// // ── Types ─────────────────────────────────────────────────────────────────────

// interface Project {
//     id: string;
//     title: string;
//     client_id?: string | null;
//     client_name?: string | null;
//     service?: string | null;
//     status: string;
//     priority: string;
//     start_date?: string | null;
//     delivery_date?: string | null;
//     sales_owner?: string | null;
//     project_manager?: string | null;
//     developer_assigned?: string | null;
//     progress_percentage?: number;
//     completion_percentage?: number;
//     task_count?: number;
//     task_done_count?: number;
//     project_update?: string | null;
//     created_at?: string;
// }

// interface ProjectListProps {
//     projects: Project[];
//     onUpdate?: () => void;
//     onEdit?: (project: Project) => void;
//     onDelete?: (project: Project) => void;
//     onStatusChange?: (id: string, status: string) => void;
//     onProgressChange?: (id: string, progress: number) => void;
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────

// const fmtDate = (d: string | null | undefined) => {
//     if (!d) return 'N/A';
//     const date = new Date(d);
//     return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// };

// const isOverdue = (d: string | null | undefined, status: string) =>
//     !!d && status !== 'Delivered' && new Date(d) < new Date();

// // ── Avatar initials chip ──────────────────────────────────────────────────────

// function MiniAvatar({ name, color = 'blue' }: { name?: string | null; color?: 'blue' | 'green' | 'purple' }) {
//     if (!name) return null;
//     const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
//     const COLORS = {
//         blue:   'bg-blue-100   text-blue-700',
//         green:  'bg-green-100  text-green-700',
//         purple: 'bg-purple-100 text-purple-700',
//     };
//     return (
//         <div
//             title={name}
//             className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${COLORS[color]}`}
//         >
//             {initials}
//         </div>
//     );
// }

// // ── Task progress bar ─────────────────────────────────────────────────────────

// function TaskProgress({ total = 0, done = 0 }: { total?: number; done?: number }) {
//     if (total === 0) return null;
//     const pct = Math.round((done / total) * 100);
//     return (
//         <div className="flex items-center gap-2">
//             <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
//                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
//             </div>
//             <span className="text-[11px] text-gray-400 whitespace-nowrap">{done}/{total}</span>
//         </div>
//     );
// }

// // ── Context Menu (3-dot) ──────────────────────────────────────────────────────

// function CardMenu({
//     project,
//     onEdit,
//     onDelete,
//     onStatusChange,
// }: {
//     project: Project;
//     onEdit?: (p: Project) => void;
//     onDelete?: (p: Project) => void;
//     onStatusChange?: (id: string, status: string) => void;
// }) {
//     const [open, setOpen] = useState(false);

//     if (!onEdit && !onDelete && !onStatusChange) return null;

//     return (
//         <div className="relative" onClick={e => e.stopPropagation()}>
//             <button
//                 onClick={() => setOpen(o => !o)}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//                 <MoreVertical size={14} />
//             </button>

//             {open && (
//                 <>
//                     {/* Backdrop */}
//                     <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

//                     <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 text-sm">
//                         {onEdit && (
//                             <button
//                                 onClick={() => { setOpen(false); onEdit(project); }}
//                                 className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700"
//                             >
//                                 <Pencil size={13} className="text-gray-400" />
//                                 Edit Project
//                             </button>
//                         )}

//                         {onStatusChange && (
//                             <>
//                                 <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
//                                     Change Status
//                                 </div>
//                                 {ALL_STATUSES.filter(s => s !== project.status).map(s => (
//                                     <button
//                                         key={s}
//                                         onClick={() => { setOpen(false); onStatusChange(project.id, s); }}
//                                         className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700"
//                                     >
//                                         <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.dot || 'bg-gray-400'}`} />
//                                         {s}
//                                     </button>
//                                 ))}
//                             </>
//                         )}

//                         {onDelete && (
//                             <>
//                                 <div className="border-t border-gray-100 mt-1" />
//                                 <button
//                                     onClick={() => { setOpen(false); onDelete(project); }}
//                                     className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 mt-1"
//                                 >
//                                     <Trash2 size={13} />
//                                     Delete Project
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// // ── Project Card ──────────────────────────────────────────────────────────────

// function ProjectCard({
//     project,
//     onEdit,
//     onDelete,
//     onStatusChange,
//     onProgressChange,
// }: {
//     project: Project;
//     onEdit?: (p: Project) => void;
//     onDelete?: (p: Project) => void;
//     onStatusChange?: (id: string, status: string) => void;
//     onProgressChange?: (id: string, progress: number) => void;
// }) {
//     const router     = useRouter();
//     const cfg        = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Requirement'];
//     const prioCfg    = PRIORITY_CONFIG[project.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;
//     const PrioIcon   = prioCfg.icon;
//     const StatusIcon = cfg.icon;
//     const overdue    = isOverdue(project.delivery_date, project.status);
//     const pct        = project.progress_percentage ?? project.completion_percentage ?? 0;

//     const handleCardClick = () => {
//         // Navigate to detail page if it exists, otherwise just open edit
//         router.push(`/projects/${project.id}`);
//     };

//     return (
//         <div
//             className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 ${cfg.border} flex flex-col`}
//         >
//             <div className="p-5 flex-1 space-y-3">

//                 {/* Status + Priority + Menu */}
//                 <div className="flex items-center justify-between gap-2">
//                     <div className="flex items-center gap-1.5">
//                         <StatusIcon
//                             size={13}
//                             className={`${cfg.iconColor} ${project.status === 'In Progress' ? 'animate-spin' : ''}`}
//                         />
//                         <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
//                             {project.status}
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                         {overdue && (
//                             <span className="text-[11px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
//                                 Overdue
//                             </span>
//                         )}
//                         {project.priority && (
//                             <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${prioCfg.cls}`}>
//                                 <PrioIcon size={10} />
//                                 {project.priority}
//                             </span>
//                         )}
//                         <CardMenu
//                             project={project}
//                             onEdit={onEdit}
//                             onDelete={onDelete}
//                             onStatusChange={onStatusChange}
//                         />
//                     </div>
//                 </div>

//                 {/* Title — clickable */}
//                 <button
//                     onClick={handleCardClick}
//                     className="text-left w-full group"
//                 >
//                     <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#3A7AFE] transition-colors">
//                         {project.title}
//                         <ChevronRight size={12} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </h3>
//                 </button>

//                 {/* Client + Service */}
//                 <div className="space-y-1">
//                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
//                         <User size={11} className="text-gray-400 shrink-0" />
//                         <span className="truncate">{project.client_name || 'No client'}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
//                         <Briefcase size={11} className="text-gray-400 shrink-0" />
//                         <span className="truncate">{project.service || '—'}</span>
//                     </div>
//                 </div>

//                 {/* Team avatars */}
//                 {(project.sales_owner || project.project_manager || project.developer_assigned) && (
//                     <div className="flex items-center gap-1.5">
//                         <Users size={11} className="text-gray-300 shrink-0" />
//                         <div className="flex items-center -space-x-1.5">
//                             <MiniAvatar name={project.sales_owner}        color="green"  />
//                             <MiniAvatar name={project.project_manager}    color="blue"   />
//                             <MiniAvatar name={project.developer_assigned} color="purple" />
//                         </div>
//                     </div>
//                 )}

//                 {/* Progress bar — interactive if handler provided */}
//                 {(pct > 0 || onProgressChange) && (
//                     <div onClick={e => e.stopPropagation()}>
//                         <div className="flex justify-between text-[11px] text-gray-400 mb-1">
//                             <span>Progress</span>
//                             <span className="font-semibold text-gray-700">{pct}%</span>
//                         </div>
//                         {onProgressChange ? (
//                             <input
//                                 type="range"
//                                 min="0" max="100" step="5"
//                                 value={pct}
//                                 onChange={e => onProgressChange(project.id, Number(e.target.value))}
//                                 className="w-full accent-[#3A7AFE] h-1.5"
//                             />
//                         ) : (
//                             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                 <div
//                                     className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-[#3A7AFE]'}`}
//                                     style={{ width: `${pct}%` }}
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Task mini-progress */}
//                 <TaskProgress total={project.task_count ?? 0} done={project.task_done_count ?? 0} />
//             </div>

//             {/* Dates footer */}
//             <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 gap-3">
//                 <div>
//                     <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Start</p>
//                     <p className="text-xs font-medium text-gray-700">{fmtDate(project.start_date)}</p>
//                 </div>
//                 <div>
//                     <p className={`text-[10px] mb-0.5 uppercase tracking-wide ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
//                         Go-Live
//                     </p>
//                     <p className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
//                         {fmtDate(project.delivery_date)}
//                     </p>
//                 </div>
//             </div>

//             {/* Status colour bar */}
//             <div className={`px-5 py-1.5 rounded-b-xl text-[11px] font-semibold text-center tracking-widest uppercase ${cfg.bar}`}>
//                 {project.status}
//             </div>
//         </div>
//     );
// }

// // ── Filter Bar ────────────────────────────────────────────────────────────────

// interface Filters {
//     status: string;
//     priority: string;
//     service: string;
//     client: string;
// }

// function FilterBar({ filters, onChange, clientOptions, onClear }: {
//     filters: Filters;
//     onChange: (f: Filters) => void;
//     clientOptions: string[];
//     onClear: () => void;
// }) {
//     const [open, setOpen] = useState(false);
//     const hasActive =
//         filters.status   !== 'All' ||
//         filters.priority !== 'All' ||
//         filters.service  !== 'All' ||
//         filters.client   !== 'All';

//     return (
//         <div className="relative">
//             <button
//                 onClick={() => setOpen(o => !o)}
//                 className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm transition-colors ${
//                     hasActive
//                         ? 'border-[#3A7AFE] bg-blue-50 text-[#3A7AFE]'
//                         : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
//                 }`}
//             >
//                 <SlidersHorizontal size={15} />
//                 Filters
//                 {hasActive && <span className="w-2 h-2 bg-[#3A7AFE] rounded-full" />}
//                 <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
//             </button>

//             {open && (
//                 <>
//                     <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
//                     <div className="absolute left-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 space-y-4">

//                         {/* Status */}
//                         <FilterGroup label="Status">
//                             <div className="flex flex-wrap gap-1.5">
//                                 {['All', ...ALL_STATUSES].map(s => (
//                                     <Chip key={s} active={filters.status === s} onClick={() => onChange({ ...filters, status: s })}>
//                                         {s}
//                                     </Chip>
//                                 ))}
//                             </div>
//                         </FilterGroup>

//                         {/* Priority */}
//                         <FilterGroup label="Priority">
//                             <div className="flex flex-wrap gap-1.5">
//                                 {['All', ...ALL_PRIORITIES].map(p => (
//                                     <Chip key={p} active={filters.priority === p} onClick={() => onChange({ ...filters, priority: p })}>
//                                         {p}
//                                     </Chip>
//                                 ))}
//                             </div>
//                         </FilterGroup>

//                         {/* Service */}
//                         <FilterGroup label="Service">
//                             <select
//                                 value={filters.service}
//                                 onChange={e => onChange({ ...filters, service: e.target.value })}
//                                 className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-full focus:border-[#3A7AFE] focus:outline-none bg-white text-gray-900 h-9"
//                             >
//                                 <option value="All">All services</option>
//                                 {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
//                             </select>
//                         </FilterGroup>

//                         {/* Client */}
//                         {clientOptions.length > 0 && (
//                             <FilterGroup label="Client">
//                                 <select
//                                     value={filters.client}
//                                     onChange={e => onChange({ ...filters, client: e.target.value })}
//                                     className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-full focus:border-[#3A7AFE] focus:outline-none bg-white text-gray-900 h-9"
//                                 >
//                                     <option value="All">All clients</option>
//                                     {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
//                                 </select>
//                             </FilterGroup>
//                         )}

//                         {hasActive && (
//                             <button
//                                 onClick={() => { onClear(); setOpen(false); }}
//                                 className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50"
//                             >
//                                 <X size={12} /> Clear all filters
//                             </button>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
//     return (
//         <div>
//             <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
//             {children}
//         </div>
//     );
// }

// function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
//     return (
//         <button
//             onClick={onClick}
//             className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
//                 active ? 'bg-[#3A7AFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//         >
//             {children}
//         </button>
//     );
// }

// // ── Summary bar ───────────────────────────────────────────────────────────────

// function SummaryBar({ projects }: { projects: Project[] }) {
//     const counts = useMemo(() => {
//         const m: Record<string, number> = { total: projects.length };
//         ALL_STATUSES.forEach(s => { m[s] = projects.filter(p => p.status === s).length; });
//         return m;
//     }, [projects]);

//     const items = [
//         { label: 'Total',       value: counts['total'],        bg: 'bg-gray-100',  text: 'text-gray-800'   },
//         { label: 'Requirement', value: counts['Requirement'],  bg: 'bg-purple-50', text: 'text-purple-700' },
//         { label: 'In Progress', value: counts['In Progress'],  bg: 'bg-blue-50',   text: 'text-blue-700'   },
//         { label: 'Delivered',   value: counts['Delivered'],    bg: 'bg-green-50',  text: 'text-green-700'  },
//         { label: 'On Hold',     value: counts['On Hold'],      bg: 'bg-yellow-50', text: 'text-yellow-700' },
//     ];

//     return (
//         <div className="grid grid-cols-5 gap-3">
//             {items.map(i => (
//                 <div key={i.label} className={`${i.bg} rounded-xl px-3 py-3 text-center`}>
//                     <p className={`text-2xl font-bold ${i.text}`}>{i.value}</p>
//                     <p className="text-[11px] text-gray-500 mt-0.5">{i.label}</p>
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ── Main ──────────────────────────────────────────────────────────────────────

// export default function ProjectList({
//     projects,
//     onUpdate,
//     onEdit,
//     onDelete,
//     onStatusChange,
//     onProgressChange,
// }: ProjectListProps) {
//     const [search,  setSearch]  = useState('');
//     const [filters, setFilters] = useState<Filters>({ status: 'All', priority: 'All', service: 'All', client: 'All' });
//     const [sort,    setSort]    = useState('newest');

//     const clientOptions = useMemo(() => {
//         return [...new Set(projects.map(p => p.client_name).filter(Boolean))] as string[];
//     }, [projects]);

//     const filtered = useMemo(() => {
//         const q = search.toLowerCase();
//         let list = projects.filter(p => {
//             const matchSearch =
//                 !q ||
//                 p.title?.toLowerCase().includes(q)              ||
//                 p.client_name?.toLowerCase().includes(q)        ||
//                 p.service?.toLowerCase().includes(q)            ||
//                 p.project_manager?.toLowerCase().includes(q)    ||
//                 p.developer_assigned?.toLowerCase().includes(q);

//             return (
//                 matchSearch &&
//                 (filters.status   === 'All' || p.status      === filters.status)   &&
//                 (filters.priority === 'All' || p.priority    === filters.priority) &&
//                 (filters.service  === 'All' || p.service     === filters.service)  &&
//                 (filters.client   === 'All' || p.client_name === filters.client)
//             );
//         });

//         const PRIO_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
//         list = [...list].sort((a, b) => {
//             if (sort === 'priority') return (PRIO_ORDER[b.priority] || 0) - (PRIO_ORDER[a.priority] || 0);
//             if (sort === 'progress') return ((b.progress_percentage ?? 0) - (a.progress_percentage ?? 0));
//             if (sort === 'oldest')   return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
//             return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
//         });

//         return list;
//     }, [projects, search, filters, sort]);

//     const clearFilters = () => {
//         setSearch('');
//         setFilters({ status: 'All', priority: 'All', service: 'All', client: 'All' });
//     };

//     const hasAnyFilter = search !== '' || Object.values(filters).some(v => v !== 'All');

//     if (projects.length === 0) {
//         return (
//             <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
//                 <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
//                 <p className="text-gray-500 font-medium text-lg">No projects yet</p>
//                 <p className="text-gray-400 text-sm mt-1">Create your first project to get started.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-5">

//             {/* Summary bar */}
//             <SummaryBar projects={projects} />

//             {/* Search + Filter + Sort */}
//             <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="relative flex-1">
//                     <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                     <input
//                         type="text"
//                         value={search}
//                         onChange={e => setSearch(e.target.value)}
//                         placeholder="Search project, client, team member..."
//                         className="rounded-xl border border-gray-200 focus:border-[#3A7AFE] focus:ring-0 text-sm bg-white w-full pl-9 pr-9 py-2.5 outline-none"
//                     />
//                     {search && (
//                         <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                             <X size={14} />
//                         </button>
//                     )}
//                 </div>

//                 <FilterBar filters={filters} onChange={setFilters} clientOptions={clientOptions} onClear={clearFilters} />

//                 <select
//                     value={sort}
//                     onChange={e => setSort(e.target.value)}
//                     className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-white focus:border-[#3A7AFE] focus:outline-none h-9"
//                 >
//                     <option value="newest">Newest first</option>
//                     <option value="oldest">Oldest first</option>
//                     <option value="priority">By priority</option>
//                     <option value="progress">By progress</option>
//                 </select>
//             </div>

//             {/* Results count */}
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-gray-500">
//                     Showing <span className="font-semibold text-gray-800">{filtered.length}</span>
//                     {' '}of{' '}
//                     <span className="font-semibold text-gray-800">{projects.length}</span> projects
//                 </p>
//                 {hasAnyFilter && filtered.length !== projects.length && (
//                     <button onClick={clearFilters} className="text-xs text-[#3A7AFE] hover:underline flex items-center gap-1">
//                         <X size={11} /> Clear filters
//                     </button>
//                 )}
//             </div>

//             {/* Grid */}
//             {filtered.length === 0 ? (
//                 <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
//                     <Search size={36} className="mx-auto text-gray-300 mb-3" />
//                     <p className="text-gray-500 font-medium">No projects match your search</p>
//                     <p className="text-gray-400 text-sm mt-1">Try different keywords or clear the filters.</p>
//                     <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-[#3A7AFE] text-white text-sm rounded-xl hover:bg-[#2563EB]">
//                         Clear filters
//                     </button>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                     {filtered.map(p => (
//                         <ProjectCard
//                             key={p.id}
//                             project={p}
//                             onEdit={onEdit}
//                             onDelete={onDelete}
//                             onStatusChange={onStatusChange}
//                             onProgressChange={onProgressChange}
//                         />
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }



//testing (20-05-2026)


'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar, Briefcase, User, Search, SlidersHorizontal,
    CheckCircle2, Clock, Loader2, Circle, X, ChevronDown,
    Zap, AlertTriangle, TrendingUp, Shield, Users,
    Pencil, Trash2, MoreVertical, ChevronRight,
} from 'lucide-react';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    'Requirement': { bar: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500', border: 'hover:border-purple-300', icon: Circle,       iconColor: 'text-purple-400' },
    'In Progress': { bar: 'bg-blue-50   text-blue-700',   dot: 'bg-blue-500',   border: 'hover:border-blue-300',   icon: Loader2,      iconColor: 'text-blue-400'   },
    'Delivered':   { bar: 'bg-green-50  text-green-700',  dot: 'bg-green-500',  border: 'hover:border-green-300',  icon: CheckCircle2, iconColor: 'text-green-500'  },
    'On Hold':     { bar: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', border: 'hover:border-yellow-300', icon: Clock,        iconColor: 'text-yellow-500' },
};

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
    Low:      { cls: 'bg-gray-100   text-gray-600',   icon: Shield,        dot: 'bg-gray-400'   },
    Medium:   { cls: 'bg-blue-100   text-blue-700',   icon: TrendingUp,    dot: 'bg-blue-500'   },
    High:     { cls: 'bg-orange-100 text-orange-700', icon: AlertTriangle, dot: 'bg-orange-500' },
    Critical: { cls: 'bg-red-100    text-red-700',    icon: Zap,           dot: 'bg-red-500'    },
};

const ALL_STATUSES   = ['Requirement', 'In Progress', 'Delivered', 'On Hold'];
const ALL_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const SERVICE_OPTIONS = ['Website', 'WhatsApp API', 'LMS', 'CRM', 'Social Media', 'Other'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
    id: string;
    title: string;
    client_id?: string | null;
    client_name?: string | null;
    service?: string | null;
    status: string;
    priority: string;
    start_date?: string | null;
    delivery_date?: string | null;
    sales_owner?: string | null;
    project_manager?: string | null;
    developer_assigned?: string | null;
    progress_percentage?: number;
    completion_percentage?: number;
    task_count?: number;
    task_done_count?: number;
    project_update?: string | null;
    created_at?: string;
}

interface ProjectListProps {
    projects: Project[];
    onUpdate?: () => void;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onStatusChange?: (id: string, status: string) => void;
    onProgressChange?: (id: string, progress: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string | null | undefined) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isOverdue = (d: string | null | undefined, status: string) =>
    !!d && status !== 'Delivered' && new Date(d) < new Date();

// ── Avatar initials chip ──────────────────────────────────────────────────────

function MiniAvatar({ name, color = 'blue' }: { name?: string | null; color?: 'blue' | 'green' | 'purple' }) {
    if (!name) return null;
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const COLORS = {
        blue:   'bg-blue-100   text-blue-700',
        green:  'bg-green-100  text-green-700',
        purple: 'bg-purple-100 text-purple-700',
    };
    return (
        <div
            title={name}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${COLORS[color]}`}
        >
            {initials}
        </div>
    );
}

// ── Task progress bar ─────────────────────────────────────────────────────────

function TaskProgress({ total = 0, done = 0 }: { total?: number; done?: number }) {
    if (total === 0) return null;
    const pct = Math.round((done / total) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{done}/{total}</span>
        </div>
    );
}

// ── Context Menu (3-dot) ──────────────────────────────────────────────────────

function CardMenu({
    project,
    onEdit,
    onDelete,
    onStatusChange,
}: {
    project: Project;
    onEdit?: (p: Project) => void;
    onDelete?: (p: Project) => void;
    onStatusChange?: (id: string, status: string) => void;
}) {
    const [open, setOpen] = useState(false);

    if (!onEdit && !onDelete && !onStatusChange) return null;

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(o => !o)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <MoreVertical size={14} />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 text-sm">
                        {onEdit && (
                            <button
                                onClick={() => { setOpen(false); onEdit(project); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700"
                            >
                                <Pencil size={13} className="text-gray-400" />
                                Edit Project
                            </button>
                        )}

                        {onStatusChange && (
                            <>
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                                    Change Status
                                </div>
                                {ALL_STATUSES.filter(s => s !== project.status).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { setOpen(false); onStatusChange(project.id, s); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700"
                                    >
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.dot || 'bg-gray-400'}`} />
                                        {s}
                                    </button>
                                ))}
                            </>
                        )}

                        {onDelete && (
                            <>
                                <div className="border-t border-gray-100 mt-1" />
                                <button
                                    onClick={() => { setOpen(false); onDelete(project); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 mt-1"
                                >
                                    <Trash2 size={13} />
                                    Delete Project
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({
    project,
    onEdit,
    onDelete,
    onStatusChange,
    onProgressChange,
}: {
    project: Project;
    onEdit?: (p: Project) => void;
    onDelete?: (p: Project) => void;
    onStatusChange?: (id: string, status: string) => void;
    onProgressChange?: (id: string, progress: number) => void;
}) {
    const router     = useRouter();
    const cfg        = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Requirement'];
    const prioCfg    = PRIORITY_CONFIG[project.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;
    const PrioIcon   = prioCfg.icon;
    const StatusIcon = cfg.icon;
    const overdue    = isOverdue(project.delivery_date, project.status);
    const pct        = project.progress_percentage ?? project.completion_percentage ?? 0;

    const handleCardClick = () => {
        // Navigate to detail page if it exists, otherwise just open edit
        router.push(`/projects/${project.id}`);
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 ${cfg.border} flex flex-col`}
        >
            <div className="p-5 flex-1 space-y-3">

                {/* Status + Priority + Menu */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <StatusIcon
                            size={13}
                            className={`${cfg.iconColor} ${project.status === 'In Progress' ? 'animate-spin' : ''}`}
                        />
                        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                            {project.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {overdue && (
                            <span className="text-[11px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                                Overdue
                            </span>
                        )}
                        {project.priority && (
                            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${prioCfg.cls}`}>
                                <PrioIcon size={10} />
                                {project.priority}
                            </span>
                        )}
                        <CardMenu
                            project={project}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                        />
                    </div>
                </div>

                {/* Title — clickable */}
                <button
                    onClick={handleCardClick}
                    className="text-left w-full group"
                >
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#3A7AFE] transition-colors">
                        {project.title}
                        <ChevronRight size={12} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                </button>

                {/* Client + Service */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={11} className="text-gray-400 shrink-0" />
                        <span className="truncate">{project.client_name || 'No client'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Briefcase size={11} className="text-gray-400 shrink-0" />
                        <span className="truncate">{project.service || '—'}</span>
                    </div>
                </div>

                {/* Team avatars */}
                {(project.sales_owner || project.project_manager || project.developer_assigned) && (
                    <div className="flex items-center gap-1.5">
                        <Users size={11} className="text-gray-300 shrink-0" />
                        <div className="flex items-center -space-x-1.5">
                            <MiniAvatar name={project.sales_owner}        color="green"  />
                            <MiniAvatar name={project.project_manager}    color="blue"   />
                            <MiniAvatar name={project.developer_assigned} color="purple" />
                        </div>
                    </div>
                )}

                {/* Progress bar — interactive if handler provided */}
                {(pct > 0 || onProgressChange) && (
                    <div onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold text-gray-700">{pct}%</span>
                        </div>
                        {onProgressChange ? (
                            <input
                                type="range"
                                min="0" max="100" step="5"
                                value={pct}
                                onChange={e => onProgressChange(project.id, Number(e.target.value))}
                                className="w-full accent-[#3A7AFE] h-1.5"
                            />
                        ) : (
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-[#3A7AFE]'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Task mini-progress */}
                <TaskProgress total={project.task_count ?? 0} done={project.task_done_count ?? 0} />
            </div>

            {/* Dates footer */}
            <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Start</p>
                    <p className="text-xs font-medium text-gray-700">{fmtDate(project.start_date)}</p>
                </div>
                <div>
                    <p className={`text-[10px] mb-0.5 uppercase tracking-wide ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                        Go-Live
                    </p>
                    <p className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {fmtDate(project.delivery_date)}
                    </p>
                </div>
            </div>

            {/* Status colour bar */}
            <div className={`px-5 py-1.5 rounded-b-xl text-[11px] font-semibold text-center tracking-widest uppercase ${cfg.bar}`}>
                {project.status}
            </div>
        </div>
    );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

interface Filters {
    status: string;
    priority: string;
    service: string;
    client: string;
}

function FilterBar({ filters, onChange, clientOptions, onClear }: {
    filters: Filters;
    onChange: (f: Filters) => void;
    clientOptions: string[];
    onClear: () => void;
}) {
    const [open, setOpen] = useState(false);
    const hasActive =
        filters.status   !== 'All' ||
        filters.priority !== 'All' ||
        filters.service  !== 'All' ||
        filters.client   !== 'All';

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm transition-colors ${
                    hasActive
                        ? 'border-[#3A7AFE] bg-blue-50 text-[#3A7AFE]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
                <SlidersHorizontal size={15} />
                Filters
                {hasActive && <span className="w-2 h-2 bg-[#3A7AFE] rounded-full" />}
                <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 space-y-4">

                        {/* Status */}
                        <FilterGroup label="Status">
                            <div className="flex flex-wrap gap-1.5">
                                {['All', ...ALL_STATUSES].map(s => (
                                    <Chip key={s} active={filters.status === s} onClick={() => onChange({ ...filters, status: s })}>
                                        {s}
                                    </Chip>
                                ))}
                            </div>
                        </FilterGroup>

                        {/* Priority */}
                        <FilterGroup label="Priority">
                            <div className="flex flex-wrap gap-1.5">
                                {['All', ...ALL_PRIORITIES].map(p => (
                                    <Chip key={p} active={filters.priority === p} onClick={() => onChange({ ...filters, priority: p })}>
                                        {p}
                                    </Chip>
                                ))}
                            </div>
                        </FilterGroup>

                        {/* Service */}
                        <FilterGroup label="Service">
                            <select
                                value={filters.service}
                                onChange={e => onChange({ ...filters, service: e.target.value })}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-full focus:border-[#3A7AFE] focus:outline-none bg-white text-gray-900 h-9"
                            >
                                <option value="All">All services</option>
                                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </FilterGroup>

                        {/* Client */}
                        {clientOptions.length > 0 && (
                            <FilterGroup label="Client">
                                <select
                                    value={filters.client}
                                    onChange={e => onChange({ ...filters, client: e.target.value })}
                                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-full focus:border-[#3A7AFE] focus:outline-none bg-white text-gray-900 h-9"
                                >
                                    <option value="All">All clients</option>
                                    {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </FilterGroup>
                        )}

                        {hasActive && (
                            <button
                                onClick={() => { onClear(); setOpen(false); }}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50"
                            >
                                <X size={12} /> Clear all filters
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            {children}
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-[#3A7AFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {children}
        </button>
    );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ projects }: { projects: Project[] }) {
    const counts = useMemo(() => {
        const m: Record<string, number> = { total: projects.length };
        ALL_STATUSES.forEach(s => { m[s] = projects.filter(p => p.status === s).length; });
        return m;
    }, [projects]);

    const items = [
        { label: 'Total',       value: counts['total'],        bg: 'bg-gray-100',  text: 'text-gray-800'   },
        { label: 'Requirement', value: counts['Requirement'],  bg: 'bg-purple-50', text: 'text-purple-700' },
        { label: 'In Progress', value: counts['In Progress'],  bg: 'bg-blue-50',   text: 'text-blue-700'   },
        { label: 'Delivered',   value: counts['Delivered'],    bg: 'bg-green-50',  text: 'text-green-700'  },
        { label: 'On Hold',     value: counts['On Hold'],      bg: 'bg-yellow-50', text: 'text-yellow-700' },
    ];

    return (
        <div className="grid grid-cols-5 gap-3">
            {items.map(i => (
                <div key={i.label} className={`${i.bg} rounded-xl px-3 py-3 text-center`}>
                    <p className={`text-2xl font-bold ${i.text}`}>{i.value}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{i.label}</p>
                </div>
            ))}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProjectList({
    projects,
    onUpdate,
    onEdit,
    onDelete,
    onStatusChange,
    onProgressChange,
}: ProjectListProps) {
    const [search,  setSearch]  = useState('');
    const [filters, setFilters] = useState<Filters>({ status: 'All', priority: 'All', service: 'All', client: 'All' });
    const [sort,    setSort]    = useState('newest');

    const clientOptions = useMemo(() => {
        return [...new Set(projects.map(p => p.client_name).filter(Boolean))] as string[];
    }, [projects]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        let list = projects.filter(p => {
            const matchSearch =
                !q ||
                p.title?.toLowerCase().includes(q)              ||
                p.client_name?.toLowerCase().includes(q)        ||
                p.service?.toLowerCase().includes(q)            ||
                p.project_manager?.toLowerCase().includes(q)    ||
                p.developer_assigned?.toLowerCase().includes(q);

            return (
                matchSearch &&
                (filters.status   === 'All' || p.status      === filters.status)   &&
                (filters.priority === 'All' || p.priority    === filters.priority) &&
                (filters.service  === 'All' || p.service     === filters.service)  &&
                (filters.client   === 'All' || p.client_name === filters.client)
            );
        });

        const PRIO_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        list = [...list].sort((a, b) => {
            if (sort === 'priority') return (PRIO_ORDER[b.priority] || 0) - (PRIO_ORDER[a.priority] || 0);
            if (sort === 'progress') return ((b.progress_percentage ?? 0) - (a.progress_percentage ?? 0));
            if (sort === 'oldest')   return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        return list;
    }, [projects, search, filters, sort]);

    const clearFilters = () => {
        setSearch('');
        setFilters({ status: 'All', priority: 'All', service: 'All', client: 'All' });
    };

    const hasAnyFilter = search !== '' || Object.values(filters).some(v => v !== 'All');

    if (projects.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-lg">No projects yet</p>
                <p className="text-gray-400 text-sm mt-1">Create your first project to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Summary bar */}
            <SummaryBar projects={projects} />

            {/* Search + Filter + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search project, client, team member..."
                        className="rounded-xl border border-gray-200 focus:border-[#3A7AFE] focus:ring-0 text-sm bg-white w-full pl-9 pr-9 py-2.5 outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <FilterBar filters={filters} onChange={setFilters} clientOptions={clientOptions} onClear={clearFilters} />

                <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-white focus:border-[#3A7AFE] focus:outline-none h-9"
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="priority">By priority</option>
                    <option value="progress">By progress</option>
                </select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{filtered.length}</span>
                    {' '}of{' '}
                    <span className="font-semibold text-gray-800">{projects.length}</span> projects
                </p>
                {hasAnyFilter && filtered.length !== projects.length && (
                    <button onClick={clearFilters} className="text-xs text-[#3A7AFE] hover:underline flex items-center gap-1">
                        <X size={11} /> Clear filters
                    </button>
                )}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
                    <Search size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No projects match your search</p>
                    <p className="text-gray-400 text-sm mt-1">Try different keywords or clear the filters.</p>
                    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-[#3A7AFE] text-white text-sm rounded-xl hover:bg-[#2563EB]">
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(p => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            onProgressChange={onProgressChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}