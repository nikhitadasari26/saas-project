import React, { useState } from 'react';
import api from '../services/api';

const ProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', formData);
      if (res.data.success) {
        onProjectCreated();
        onClose();
      }
    } catch (err) {
      console.error("Error creating project:", err.response?.status);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Adds vertical spacing between inputs */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Project Name</label>
            <input 
              required
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="e.g. Mobile Application"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Description</label>
            <textarea 
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none min-h-[120px]"
              placeholder="Track development progress..."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button type="submit" className="px-7 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;