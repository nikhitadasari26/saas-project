import React from 'react';

const Dashboard = () => {
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

      {/* Subscription Status */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-xl">
            ⚡
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              Subscription Status
            </p>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
              Plan: PRO
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Projects" value="5" color="bg-blue-500" />
        <StatCard title="Active Tasks" value="5" color="bg-orange-500" />
        <StatCard title="Completed Tasks" value="1" color="bg-green-500" />
        <StatCard title="Team Members" value="5" color="bg-purple-500" />
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
