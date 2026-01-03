import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import TaskModal from '../components/TaskModal';
import api from '../services/api';

const ProjectDetails = () => {
  const { projectId } = useParams();
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
    <div className="max-w-6xl mx-auto p-6">
      {project && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {project.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {project.description}
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Project Tasks
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Task
          </button>
        </div>

        <div className="grid gap-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className="p-4 border rounded bg-gray-50 flex justify-between"
            >
              <div>
                <h4 className="font-semibold">{task.title}</h4>
                <p className="text-sm text-gray-500">
                  Priority: {task.priority}
                </p>
              </div>
              <span className="text-xs font-bold uppercase">
                {task.status}
              </span>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-gray-400 text-center">
              No tasks yet
            </p>
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
