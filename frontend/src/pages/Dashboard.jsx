import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 font-semibold">
          Welcome back to your project!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Projects" value={stats.totalProjects} color="bg-blue-500" />
        <StatCard title="Active Tasks" value={stats.activeTasks} color="bg-orange-500" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} color="bg-green-500" />
        <StatCard title="Team Members" value={stats.teamMembers} color="bg-purple-500" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`${color} text-white rounded-[2.5rem] p-8 shadow-xl`}>
    <p className="text-xs font-black uppercase tracking-widest opacity-80">
      {title}
    </p>
    <p className="text-4xl font-black mt-4">{value}</p>
  </div>
);

export default Dashboard;
