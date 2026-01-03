import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import TaskModal from '../components/TaskModal';
import api from '../services/api';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define fetchData once with useCallback so it can be used in useEffect and the Modal
  const fetchData = useCallback(async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      const taskRes = await api.get(`/tasks/project/${projectId}`);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data);
    } catch (err) { 
      console.error("Error fetching data:", err); 
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Layout>
      {project && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Project Tasks</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Add Task
          </button>
        </div>

        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                <div className="flex space-x-2 mt-1">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Priority: {task.priority}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">No tasks assigned to this project yet.</div>
          )}
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectId={projectId}
        onTaskCreated={fetchData} // Re-fetches the list after a new task is added
      />
    </Layout>
  );
};

export default ProjectDetails;