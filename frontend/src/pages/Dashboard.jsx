import React from 'react';

const Dashboard = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 font-semibold">Welcome back to your project!</p>
      </div>

      {/* Subscription Status from Friend's UI */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10 flex justify-between items-center">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-200">⚡</div>
            <div>
              <p className="text-lg font-bold text-slate-800 tracking-tight">Subscription Status</p>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Plan: <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded ml-1">PRO</span></p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-[#00a3ff] p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">💼</div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Projects</p>
          <p className="text-5xl font-black mt-2">5</p>
        </div>

        <div className="bg-[#ff8a00] p-8 rounded-[3rem] text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">📈</div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Active Tasks</p>
          <p className="text-5xl font-black mt-2">5</p>
        </div>

        <div className="bg-[#00d14b] p-8 rounded-[3rem] text-white shadow-2xl shadow-green-200 relative overflow-hidden">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">✅</div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Completed Tasks</p>
          <p className="text-5xl font-black mt-2">1</p>
        </div>

        <div className="bg-[#b14eff] p-8 rounded-[3rem] text-white shadow-2xl shadow-purple-200 relative overflow-hidden">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">👥</div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Team Members</p>
          <p className="text-5xl font-black mt-2">5</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;