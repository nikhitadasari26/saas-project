import React, { useState } from 'react';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: formData.title,
        priority: formData.priority,
      });

      onTaskCreated(); // refresh task list
      onClose();       // close modal
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Add Task to Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Task name"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <select
            className="w-full border p-3 rounded"
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
