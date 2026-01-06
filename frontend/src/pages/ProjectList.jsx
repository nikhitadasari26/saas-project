import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProjectModal from '../components/ProjectModal';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-black text-slate-800">Projects</h1>
          <p className="text-slate-500 font-medium">
            Manage your organization's projects and tasks
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group bg-white rounded-2xl border border-slate-200
                       hover:border-blue-500 hover:shadow-xl
                       transition-all cursor-pointer overflow-hidden"
          >
            <div className="flex">
              {/* Left Accent */}
              <div className="w-2 bg-blue-500 group-hover:bg-blue-600 transition-all" />

              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {project.name}
                </h3>

                <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Active Project
                  </span>

                  <span className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    View Project →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-slate-400 font-medium">No projects found</p>
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
