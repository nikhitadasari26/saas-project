import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskData, setTaskData] = useState({ title: '', priority: 'Medium' });

  // Wrapped in useCallback to satisfy dependency requirements
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      setTasks(res.data || []);
    } catch (err) { 
      console.error("Fetch tasks failed:", err); 
    }
  }, [id]); // Only recreates if the project ID changes

  // Dependency array now correctly includes fetchTasks
  useEffect(() => { 
    fetchTasks(); 
  }, [fetchTasks]); 

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, taskData);
      setShowModal(false);
      setTaskData({ title: '', priority: 'Medium' });
      fetchTasks();
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-slate-800">Project Tasks</h1>
        <button onClick={() => setShowModal(true)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-emerald-600 transition-all">+ New Task</button>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4 font-bold text-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {task.title}
              </div>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                'bg-blue-50 text-blue-600'
              }`}>
                {task.priority} Priority
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-10 font-medium">No tasks found. Click "+ New Task" to start.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleAddTask} className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-8">Add Task to Project</h2>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Task Name</label>
            <input required className="w-full border p-4 rounded-2xl mb-6 bg-slate-50 focus:ring-2 ring-emerald-500 outline-none" placeholder="Build API" value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} />
            
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Priority</label>
            <select className="w-full border p-4 rounded-2xl mb-8 bg-slate-50" value={taskData.priority} onChange={e => setTaskData({...taskData, priority: e.target.value})}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            
            <div className="flex gap-4">
               <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 bg-slate-100 text-slate-500 rounded-2xl font-black">Cancel</button>
               <button type="submit" className="flex-1 p-4 bg-emerald-500 text-white rounded-2xl font-black text-lg">Create Task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;