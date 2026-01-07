import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

const PlanIcon = ({ plan }) => {
  switch (plan) {
    case 'free': return <Shield className="w-5 h-5 mr-2 text-gray-500" />;
    case 'pro': return <ShieldCheck className="w-5 h-5 mr-2 text-blue-500" />;
    case 'enterprise': return <ShieldCheck className="w-5 h-5 mr-2 text-purple-500" />;
    default: return null;
  }
};

const TenantDashboard = () => {
  const { tenant } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const projectUsage = tenant ? (tenant.stats.totalProjects / tenant.max_projects) * 100 : 0;
  const userUsage = tenant ? (tenant.stats.totalUsers / tenant.max_users) * 100 : 0;

  if (!tenant) return <div className="p-10 font-bold text-slate-400">Loading tenant data...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Projects" value={tenant.stats.totalProjects} />
        <StatCard title="Total Tasks" value={tenant.stats.totalTasks} />
        <StatCard title="Team Members" value={tenant.stats.totalUsers} />
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">Subscription Status</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-8 rounded-3xl border border-slate-100">
          <div className="flex items-center">
            <div className="bg-white p-3 rounded-2xl shadow-sm mr-4">
              <PlanIcon plan={tenant.subscription_plan} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
              <span className="text-2xl font-black text-slate-800 capitalize">
                {tenant.subscription_plan}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            {tenant.requested_plan ? (
              <div className="flex items-center px-6 py-3 bg-yellow-50 text-yellow-700 rounded-2xl font-bold text-sm border border-yellow-100">
                <ShieldAlert className="w-5 h-5 mr-3" />
                Upgrade to {tenant.requested_plan} Pending
              </div>
            ) : (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1"
              >
                Refine Plan ➜
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <UsageBar title="Projects Created" used={tenant.stats.totalProjects} limit={tenant.max_projects} percentage={projectUsage} />
          <UsageBar title="Team Members" used={tenant.stats.totalUsers} limit={tenant.max_users} percentage={userUsage} />
        </div>
      </div>

      {isUpgradeModalOpen && (
        <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />
      )}
    </>
  );
};

const AdminDashboard = () => {
  // Placeholder for now
  return (
    <div className="p-8 text-center pt-20">
      <div className="w-20 h-20 bg-slate-800 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-slate-300">
        ⚡
      </div>
      <h1 className="text-3xl font-black text-slate-800">
        Super Admin Dashboard
      </h1>
      <p className="text-slate-500 font-bold mt-2">
        Tenant management and upgrade approvals will be here.
      </p>
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 font-bold mt-1">
          Welcome back, {user?.fullName || 'User'}!
        </p>
      </div>

      {user?.role === 'super_admin' ? <AdminDashboard /> : <TenantDashboard />}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white text-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
      {title}
    </p>
    <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600">
      {value}
    </p>
  </div>
);

const UsageBar = ({ title, used, limit, percentage }) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <p className="font-bold text-slate-700">{title}</p>
      <div className="bg-slate-100 px-3 py-1 rounded-lg">
        <p className="text-xs font-black text-slate-500">{used} / {limit}</p>
      </div>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
      <div
        className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/30"
        style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
      ></div>
    </div>
  </div>
);

export default Dashboard;
