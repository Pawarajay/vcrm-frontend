

'use client';
import { authHeader } from '@/lib/auth';

import { useState, useEffect, useMemo } from 'react';
import {
    Plus, ChevronDown, ChevronUp, User, Calendar,
    CheckCircle2, Loader2, Circle, AlertTriangle,
    Pencil, Trash2, Zap, TrendingUp, Shield, ArrowUpDown,
    LayoutGrid, List,
} from 'lucide-react';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://vcrm-backend.onrender.com/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task {
    id: any;
    title: string;
    description?: string;
    assigned_to?: any;
    assigned_to_name?: string;
    status: string;
    priority: string;
    start_date?: string;
    due_date?: string;
    created_at?: string;
}

interface TeamMember {
    id: any;
    name: string;
    role?: string;
}

interface Project {
    id: any;
}

interface FormData {
    title: string;
    description: string;
    assigned_to: string;
    status: string;
    priority: string;
    start_date: string;
    due_date: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TASK_STATUSES = [
    { value: 'Pending',  label: 'Pending',  icon: Circle,       color: 'text-gray-400',  bg: 'bg-gray-100  text-gray-700'  },
    { value: 'Working',  label: 'Working',  icon: Loader2,      color: 'text-blue-500',  bg: 'bg-blue-100  text-blue-700'  },
    { value: 'Complete', label: 'Complete', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 text-green-700' },
];

const PRIORITY_OPTIONS = [
    { value: 'Low',      label: 'Low',      icon: Shield,        bg: 'bg-gray-100   text-gray-600'   },
    { value: 'Medium',   label: 'Medium',   icon: TrendingUp,    bg: 'bg-blue-100   text-blue-700'   },
    { value: 'High',     label: 'High',     icon: AlertTriangle, bg: 'bg-orange-100 text-orange-700' },
    { value: 'Critical', label: 'Critical', icon: Zap,           bg: 'bg-red-100    text-red-700'    },
];

const SORT_OPTIONS = [
    { value: 'created',  label: 'Newest first' },
    { value: 'due_date', label: 'Due date'      },
    { value: 'priority', label: 'Priority'      },
    { value: 'status',   label: 'Status'        },
];

const PRIORITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const EMPTY_FORM: FormData = {
    title: '', description: '', assigned_to: '', status: 'Pending', priority: 'Medium', start_date: '', due_date: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d?: string): string => {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const checkOverdue    = (due?: string, status?: string): boolean => !!due && status !== 'Complete' && new Date(due) < new Date();
const getStatusMeta   = (v: string) => TASK_STATUSES.find(s => s.value === v)    || TASK_STATUSES[0];
const getPriorityMeta = (v: string) => PRIORITY_OPTIONS.find(p => p.value === v) || PRIORITY_OPTIONS[1];

// ── Badges ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const m = getStatusMeta(status);
    const I = m.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${m.bg}`}>
            <I size={11} className={status === 'Working' ? 'animate-spin' : ''} />
            {m.label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const m = getPriorityMeta(priority);
    const I = m.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.bg}`}>
            <I size={10} /> {m.label}
        </span>
    );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ tasks }: { tasks: Task[] }) {
    if (!tasks.length) return null;
    const done = tasks.filter(t => t.status === 'Complete').length;
    const pct  = Math.round((done / tasks.length) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">{done}/{tasks.length} done · {pct}%</span>
        </div>
    );
}

// ── Task Stat Cards ───────────────────────────────────────────────────────────

function TaskStats({ tasks }: { tasks: Task[] }) {
    const complete = tasks.filter(t => t.status === 'Complete').length;
    const working  = tasks.filter(t => t.status === 'Working').length;
    const overdue  = tasks.filter(t => checkOverdue(t.due_date, t.status)).length;

    return (
        <div className="grid grid-cols-4 gap-3">
            {[
                { label: 'Total',    value: tasks.length, bg: 'bg-gray-100',  text: 'text-gray-800',  ring: false },
                { label: 'Working',  value: working,      bg: 'bg-blue-50',   text: 'text-blue-700',  ring: false },
                { label: 'Complete', value: complete,     bg: 'bg-green-50',  text: 'text-green-700', ring: false },
                { label: 'Overdue',  value: overdue,      bg: overdue > 0 ? 'bg-red-50' : 'bg-gray-50', text: overdue > 0 ? 'text-red-700' : 'text-gray-500', ring: overdue > 0 },
            ].map(i => (
                <div key={i.label} className={`${i.bg} rounded-xl px-4 py-3 text-center ${i.ring ? 'ring-1 ring-red-300' : ''}`}>
                    <p className={`text-2xl font-bold ${i.text}`}>{i.value}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{i.label}</p>
                </div>
            ))}
        </div>
    );
}

// ── Task Form ─────────────────────────────────────────────────────────────────

function TaskForm({ task, teamMembers, onSave, onCancel }: {
    task: Task | null;
    teamMembers: TeamMember[];
    onSave: (form: FormData) => Promise<void>;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<FormData>(task ? {
        title:       task.title       || '',
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        status:      task.status      || 'Pending',
        priority:    task.priority    || 'Medium',
        start_date:  task.start_date  ? task.start_date.split('T')[0] : '',
        due_date:    task.due_date    ? task.due_date.split('T')[0]   : '',
    } : { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800">{task ? 'Edit Task' : 'Add New Task'}</h4>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handle}
                        required
                        placeholder="e.g. Design homepage wireframe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description / Notes</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handle}
                        rows={2}
                        placeholder="Details, requirements, or references..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Assign To</label>
                        <select
                            name="assigned_to"
                            value={form.assigned_to}
                            onChange={handle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Unassigned</option>
                            {(teamMembers || []).map(m => (
                                <option key={m.id} value={m.id}>{m.name}{m.role ? ` (${m.role})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
                        <div className="grid grid-cols-4 gap-1">
                            {PRIORITY_OPTIONS.map(p => {
                                const I = p.icon;
                                const active = form.priority === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                                        className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all border ${
                                            active
                                                ? p.value === 'Critical' ? 'bg-red-600 text-white border-red-600'
                                                : p.value === 'High'     ? 'bg-orange-500 text-white border-orange-500'
                                                : p.value === 'Medium'   ? 'bg-blue-600 text-white border-blue-600'
                                                                         : 'bg-gray-500 text-white border-gray-500'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <I size={10} />{p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            value={form.due_date}
                            onChange={handle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        {saving ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Task Row (list view) ──────────────────────────────────────────────────────

function TaskRow({ task, teamMembers, onStatusChange, onEdit, onDelete }: {
    task: Task;
    teamMembers: TeamMember[];
    onStatusChange: (id: any, status: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: any) => void;
}) {
    const [expanded,   setExpanded]   = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const overdue = checkOverdue(task.due_date, task.status);

    const assigneeName = useMemo(() => {
        if (!task.assigned_to) return task.assigned_to_name || null;
        return (teamMembers || []).find(m => String(m.id) === String(task.assigned_to))?.name || task.assigned_to_name || null;
    }, [task.assigned_to, task.assigned_to_name, teamMembers]);

    return (
        <div className={`bg-white rounded-xl border transition-shadow hover:shadow-sm ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Status icon */}
                <div className="relative shrink-0">
                    <button onClick={() => setStatusOpen(o => !o)} className="focus:outline-none" title="Change status">
                        {(() => {
                            const m = getStatusMeta(task.status);
                            const I = m.icon;
                            return <I size={20} className={`${m.color} ${task.status === 'Working' ? 'animate-spin' : ''}`} />;
                        })()}
                    </button>
                    {statusOpen && (
                        <div className="absolute left-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px]">
                            {TASK_STATUSES.map(s => {
                                const I = s.icon;
                                return (
                                    <button
                                        key={s.value}
                                        onClick={() => { onStatusChange(task.id, s.value); setStatusOpen(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left ${task.status === s.value ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                                    >
                                        <I size={13} />{s.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(o => !o)}>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${task.status === 'Complete' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        {overdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">
                                <AlertTriangle size={10} /> Overdue
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {assigneeName && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <User size={10} />{assigneeName}
                            </span>
                        )}
                        {task.due_date && (
                            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                <Calendar size={10} />Due {fmt(task.due_date)}
                            </span>
                        )}
                        {task.start_date && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                Start {fmt(task.start_date)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <StatusBadge status={task.status} />
                    <button onClick={() => onEdit(task)} title="Edit" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(task.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                    </button>
                    <button onClick={() => setExpanded(o => !o)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>
            {expanded && task.description && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>
            )}
        </div>
    );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({ task, teamMembers, onEdit, onDelete }: {
    task: Task;
    teamMembers: TeamMember[];
    onEdit: (task: Task) => void;
    onDelete: (id: any) => void;
}) {
    const overdue = checkOverdue(task.due_date, task.status);
    const assigneeName = useMemo(() => {
        if (!task.assigned_to) return task.assigned_to_name || null;
        return (teamMembers || []).find(m => String(m.id) === String(task.assigned_to))?.name || task.assigned_to_name || null;
    }, [task.assigned_to, task.assigned_to_name, teamMembers]);

    return (
        <div className={`bg-white rounded-xl border p-3 space-y-2 hover:shadow-sm transition-shadow ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-2">
                <p className={`text-xs font-semibold leading-snug flex-1 ${task.status === 'Complete' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                </p>
                <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(task)} className="p-1 text-gray-300 hover:text-blue-500 transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(task.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
                <PriorityBadge priority={task.priority} />
                {overdue && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">Overdue</span>}
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                {assigneeName
                    ? <span className="flex items-center gap-1"><User size={10} />{assigneeName}</span>
                    : <span />
                }
                {task.due_date && (
                    <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                        <Calendar size={10} />{fmt(task.due_date)}
                    </span>
                )}
            </div>
        </div>
    );
}


function KanbanColumn({ status, tasks, teamMembers, onEdit, onDelete, onAddClick }: {
    status: string;
    tasks: Task[];
    teamMembers: TeamMember[];
    onEdit: (task: Task) => void;
    onDelete: (id: any) => void;
    onAddClick: () => void;
}) {
    const m = getStatusMeta(status);
    const I = m.icon;
    return (
        <div className="flex-1 min-w-[220px] bg-gray-50 rounded-xl border border-gray-200 flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <I size={13} className={`${m.color} ${status === 'Working' ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{status}</span>
                    <span className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 font-medium">{tasks.length}</span>
                </div>
                <button onClick={onAddClick} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                    <Plus size={14} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {tasks.length === 0
                    ? <div className="text-center py-8 text-xs text-gray-400">No tasks</div>
                    : tasks.map(task => (
                        <KanbanCard key={task.id} task={task} teamMembers={teamMembers} onEdit={onEdit} onDelete={onDelete} />
                    ))
                }
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TaskTracking({ project }: { project: Project }) {
    const [tasks,        setTasks]        = useState<Task[]>([]);
    const [teamMembers,  setTeamMembers]  = useState<TeamMember[]>([]);
    const [showForm,     setShowForm]     = useState(false);
    const [editingTask,  setEditingTask]  = useState<Task | null>(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [sort,         setSort]         = useState('created');
    const [viewMode,     setViewMode]     = useState<'list' | 'board'>('list');
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        if (!project?.id) return;
        fetchTasks();
        fetchTeamMembers();
    }, [project?.id]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/projects/${project.id}/tasks`, { headers: authHeader() });
            if (res.ok) {
                const d = await res.json();
                setTasks(Array.isArray(d) ? d : d.tasks || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch(`${API_BASE}/users`, { headers: authHeader() });
            if (res.ok) {
                const d = await res.json();
                setTeamMembers(Array.isArray(d) ? d : d.users || []);
            }
        } catch (e) { console.error(e); }
    };

    const handleSaveTask = async (formData: FormData) => {
        try {
            const isEdit = !!editingTask;
            const res = await fetch(
                isEdit
                    ? `${API_BASE}/projects/${project.id}/tasks/${editingTask!.id}`
                    : `${API_BASE}/projects/${project.id}/tasks`,
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify({ ...formData, assigned_to: formData.assigned_to || null }),
                }
            );
            if (res.ok) { setShowForm(false); setEditingTask(null); fetchTasks(); }
            else console.error('Save failed:', await res.text());
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (taskId: any, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        try {
            let res = await fetch(`${API_BASE}/projects/${project.id}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.status === 405) {
                const task = tasks.find(t => t.id === taskId);
                res = await fetch(`${API_BASE}/projects/${project.id}/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify({ ...(task || {}), status: newStatus }),
                });
            }
            if (!res.ok) fetchTasks();
        } catch (e) { console.error(e); fetchTasks(); }
    };

    const handleDelete = async (taskId: any) => {
        if (!confirm('Delete this task? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${project.id}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: authHeader(),
            });
            if (res.ok) setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (e) { console.error(e); }
    };

    const counts = useMemo(() => ({
        All:      tasks.length,
        Pending:  tasks.filter(t => t.status === 'Pending').length,
        Working:  tasks.filter(t => t.status === 'Working').length,
        Complete: tasks.filter(t => t.status === 'Complete').length,
    }), [tasks]);

    const overdueCount = useMemo(() => tasks.filter(t => checkOverdue(t.due_date, t.status)).length, [tasks]);

    const sortedFiltered = useMemo(() => {
        const list = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);
        return [...list].sort((a, b) => {
            if (sort === 'priority') return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
            if (sort === 'due_date') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (sort === 'status') return TASK_STATUSES.findIndex(s => s.value === a.status) - TASK_STATUSES.findIndex(s => s.value === b.status);
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [tasks, filterStatus, sort]);

    const boardTasks = useMemo(() => {
        const map: Record<string, Task[]> = {};
        TASK_STATUSES.forEach(s => { map[s.value] = tasks.filter(t => t.status === s.value); });
        return map;
    }, [tasks]);

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">Task Management</h3>
                    {tasks.length > 0 && <div className="mt-2 max-w-sm"><ProgressBar tasks={tasks} /></div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* View toggle */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            title="List view"
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            <List size={15} />
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            title="Board view"
                            className={`p-2 transition-colors ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingTask(null); setShowForm(o => !o); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        <Plus size={15} /> Add Task
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            {tasks.length > 0 && <TaskStats tasks={tasks} />}

            {/* Form */}
            {(showForm || editingTask) && (
                <TaskForm
                    task={editingTask}
                    teamMembers={teamMembers}
                    onSave={handleSaveTask}
                    onCancel={() => { setShowForm(false); setEditingTask(null); }}
                />
            )}

            {loading ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Loader2 size={30} className="mx-auto text-blue-400 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm">Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <CheckCircle2 size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-base">No tasks yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click "Add Task" to create the first task for this project.</p>
                </div>
            ) : viewMode === 'board' ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {TASK_STATUSES.map(s => (
                        <KanbanColumn
                            key={s.value}
                            status={s.value}
                            tasks={boardTasks[s.value] || []}
                            teamMembers={teamMembers}
                            onEdit={t => { setShowForm(false); setEditingTask(t); }}
                            onDelete={handleDelete}
                            onAddClick={() => { setEditingTask(null); setShowForm(true); }}
                        />
                    ))}
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex gap-1.5 flex-wrap">
                            {(['All', 'Pending', 'Working', 'Complete'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {s}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filterStatus === s ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {s === 'All' ? tasks.length : counts[s]}
                                    </span>
                                    {s !== 'Complete' && overdueCount > 0 &&
                                        (s === 'All' || tasks.filter(t => t.status === s && checkOverdue(t.due_date, t.status)).length > 0) && (
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <ArrowUpDown size={13} className="text-gray-400" />
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:ring-2 focus:ring-blue-500"
                            >
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                    {sortedFiltered.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No {filterStatus !== 'All' ? filterStatus : ''} tasks</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {sortedFiltered.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    teamMembers={teamMembers}
                                    onStatusChange={handleStatusChange}
                                    onEdit={t => { setShowForm(false); setEditingTask(t); }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}