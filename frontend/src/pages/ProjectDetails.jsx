import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import TaskModal from '../components/TaskModal';
import api from '../services/api';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      const taskRes = await api.get(`/projects/${projectId}/tasks`);

      setProject(projRes.data.data);
      setTasks(taskRes.data.data.tasks || []);
    } catch (err) {
      console.error('Error fetching project/tasks:', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="mb-8 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors flex items-center gap-2"
      >
        <span>←</span> Back to Projects
      </button>

      {project && (
        <div className="mb-10 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">
                {project.name}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
              Active Project
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Project Tasks
            </h2>
            <p className="text-slate-400 font-bold mt-1 text-sm">Manage tasks for this project</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1 text-sm"
          >
            + Add Task
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className="group p-6 border border-slate-100 rounded-[1.5rem] bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-slate-700 text-lg mb-1 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                    {task.priority} Priority
                  </span>
                  <p className="text-xs font-bold text-slate-400">
                    Due: {task.due_date || 'No Date'}
                  </p>
                </div>
              </div>

              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-200 text-slate-500'
                }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
              <p className="text-slate-400 font-bold">No tasks found</p>
              <p className="text-slate-300 text-sm font-medium mt-2">Get started by creating a new task</p>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onTaskCreated={fetchData}
      />
    </div>
  );
};

export default ProjectDetails;
