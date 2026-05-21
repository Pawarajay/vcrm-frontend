
// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { ArrowLeft } from 'lucide-react';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-api.vasifytech.com/api';
// // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function EditProjectPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!params?.id) return;
//     const fetchProject = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/projects/${params.id}`, {
//           headers: {
//             Authorization:
//               typeof window !== 'undefined'
//                 ? `Bearer ${localStorage.getItem('token')}`
//                 : '',
//           },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           setProject(data);
//         } else {
//           console.error('Failed to load project for edit', await res.text());
//         }
//       } catch (e) {
//         console.error('Error loading project for edit', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProject();
//   }, [params?.id]);

//   const handleChange = (field, value) => {
//     setProject((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!project) return;
//     try {
//       const res = await fetch(`${API_BASE}/projects/${params.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization:
//             typeof window !== 'undefined'
//               ? `Bearer ${localStorage.getItem('token')}`
//               : '',
//         },
//         body: JSON.stringify({
//           title: project.title,
//           client_name: project.client_name,
//           priority: project.priority,
//           status: project.status,
//           health_rating: project.health_rating,
//           start_date: project.start_date,
//           end_date: project.end_date,
//           budget: project.budget,
//           description: project.description,
//         }),
//       });

//       if (res.ok) {
//         router.push(`/projects/${params.id}`);
//       } else {
//         console.error('Failed to update project', await res.text());
//       }
//     } catch (e) {
//       console.error('Error updating project', e);
//     }
//   };

//   if (loading || !project) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-gray-600">Loading project...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-3xl mx-auto px-6 py-6">
//         <button
//           onClick={() => router.push(`/projects/${params.id}`)}
//           className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft size={18} /> Back to Project
//         </button>

//         <h1 className="text-2xl font-bold mb-4">Edit Project</h1>

//         <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-lg shadow">
//           <div>
//             <label className="block text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               value={project.title || ''}
//               onChange={(e) => handleChange('title', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Client Name</label>
//             <input
//               type="text"
//               value={project.client_name || ''}
//               onChange={(e) => handleChange('client_name', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Priority</label>
//               <select
//                 value={project.priority || 'Medium'}
//                 onChange={(e) => handleChange('priority', e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg"
//               >
//                 <option value="Low">Low</option>
//                 <option value="Medium">Medium</option>
//                 <option value="High">High</option>
//                 <option value="Critical">Critical</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Status</label>
//               <select
//                 value={project.status || 'Not Started'}
//                 onChange={(e) => handleChange('status', e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg"
//               >
//                 <option value="Not Started">Not Started</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="On Hold">On Hold</option>
//                 <option value="Completed">Completed</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Health</label>
//               <select
//                 value={project.health_rating || 'Green'}
//                 onChange={(e) => handleChange('health_rating', e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg"
//               >
//                 <option value="Green">Green</option>
//                 <option value="Yellow">Yellow</option>
//                 <option value="Red">Red</option>
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={project.start_date || ''}
//                 onChange={(e) => handleChange('start_date', e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={project.end_date || ''}
//                 onChange={(e) => handleChange('end_date', e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Budget</label>
//             <input
//               type="number"
//               value={project.budget || ''}
//               onChange={(e) => handleChange('budget', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Description</label>
//             <textarea
//               rows={4}
//               value={project.description || ''}
//               onChange={(e) => handleChange('description', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//             />
//           </div>

//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => router.push(`/projects/${params.id}`)}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



//testing

'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://vcrm-backend.onrender.com/api';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/projects`, {
        headers: {
          Authorization: `Bearer ${
            typeof window !== 'undefined' ? localStorage.getItem('token') : ''
          }`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.projects)
          ? data.projects
          : [];
        setProjects(list);
      } else {
        console.error('Failed to fetch projects:', await res.text());
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Stats derived from projects list
  const stats = {
    total:      projects.length,
    inProgress: projects.filter((p) => p.status === 'In Progress').length,
    delivered:  projects.filter((p) => p.status === 'Delivered').length,
    onHold:     projects.filter((p) => p.status === 'On Hold').length,
  };

  return (
    // ✅ FIX: removed min-h-screen — sidebar layout controls the full height
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all client projects
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={17} />
          New Project
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={TrendingUp}
          iconColor="text-blue-600"
          bg="bg-blue-50 border-blue-100"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={AlertCircle}
          iconColor="text-yellow-600"
          bg="bg-yellow-50 border-yellow-100"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          iconColor="text-green-600"
          bg="bg-green-50 border-green-100"
        />
        <StatCard
          title="On Hold"
          value={stats.onHold}
          icon={Clock}
          iconColor="text-red-500"
          bg="bg-red-50 border-red-100"
        />
      </div>

      {/* Project list — has search + filter built in from ProjectList.jsx */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-500 text-sm">Loading projects...</p>
        </div>
      ) : (
        <ProjectList projects={projects} onUpdate={fetchProjects} />
      )}

      {/* New project modal */}
      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

// ── Stat Card component ───────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, iconColor, bg }) {
  return (
    <div className={`${bg} border rounded-xl p-5 flex items-center justify-between`}>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-white p-2.5 rounded-lg shadow-sm">
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}