import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Projects</h1>
          <p className="text-slate-500 font-medium">Manage your organization's projects and tasks</p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">📁</div>
              <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{project.name}</h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">{project.description}</p>
            <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Jan 3, 2026</span>
              <span className="text-blue-600">View Details ➜</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;