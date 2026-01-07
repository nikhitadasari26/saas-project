import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProjectModal from '../components/ProjectModal';
import { useAuth } from '../context/AuthContext';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Projects</h1>
          <p className="text-slate-500 font-bold mt-2">
            Manage your organization's projects and tasks
          </p>
        </div>

        {user?.role === 'tenant_admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group bg-white rounded-[2rem] border border-slate-100 p-8
                       hover:border-blue-500/30 hover:shadow-2xl hover:shadow-slate-200/50
                       transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 group-hover:bg-blue-600 transition-all" />

            <div className="pl-4">
              <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>

              <p className="text-slate-500 font-medium text-sm mb-8 line-clamp-2 leading-relaxed">
                {project.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Active This Week
                </span>

                <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  ➜
                </span>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <p className="text-slate-400 font-bold text-lg">No projects found</p>
            {user?.role === 'tenant_admin' && (
              <p className="text-slate-300 font-medium text-sm mt-2">Create your first project to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => {
          setIsModalOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
};

export default ProjectList;
