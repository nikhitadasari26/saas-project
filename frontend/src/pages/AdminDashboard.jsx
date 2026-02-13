import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenants');
      setTenants(res.data.data.tenants);
    } catch (err) {
      setError('Failed to fetch tenants.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleApprove = async (tenantId, newPlan) => {
    try {
      await api.put(`/tenants/${tenantId}`, {
        subscriptionPlan: newPlan,
      });
      alert('Upgrade approved successfully!');
      fetchTenants(); // Refresh the list
    } catch (err) {
      alert('Failed to approve upgrade.');
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-400">Loading tenants...</div>;
  if (error) return <div className="p-10 font-bold text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Super Admin</h1>
        <p className="text-slate-500 font-bold mt-2">Manage all system tenants and approvals</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-700">All Tenants ({tenants.length})</h2>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-50">
            <tr>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest pl-8">Organization</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Plan</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-6 pl-8">
                  <div className="font-bold text-slate-800 text-lg">{tenant.name}</div>
                  <div className="text-xs text-slate-400 font-bold mt-1">{tenant.subdomain}.localhost</div>
                </td>
                <td className="p-6">
                  <span className="font-bold text-slate-600 capitalize bg-slate-100 px-3 py-1 rounded-lg text-sm border border-slate-200">
                    {tenant.subscription_plan}
                  </span>
                </td>
                <td className="p-6">
                  {tenant.requested_plan ? (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm border border-yellow-200">
                      ⚠ Upgrade Pending
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm border border-green-200">
                      {tenant.status}
                    </span>
                  )}
                </td>
                <td className="p-6">
                  {tenant.requested_plan ? (
                    <button
                      onClick={() => handleApprove(tenant.id, tenant.requested_plan)}
                      className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:scale-105 transition-all text-xs uppercase tracking-wide"
                    >
                      Approve {tenant.requested_plan} ➜
                    </button>
                  ) : (
                    <span className="text-slate-300 font-bold text-xl">•</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tenants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">No tenants found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
