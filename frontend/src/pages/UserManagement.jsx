import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'member' // Default role for new users
  });
  const [error, setError] = useState('');

  const { user } = useAuth(); // Use context

  const fetchUsers = async () => {
    try {
      // API call now uses the simpler route
      const res = await api.get('/users');
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    if (user?.role === 'tenant_admin') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // API call now uses the simpler route
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'member' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  // RBAC check
  if (user?.role !== 'tenant_admin') {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center pt-20">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
          🚫
        </div>
        <h1 className="text-3xl font-black text-slate-800">Access Denied</h1>
        <p className="mt-4 text-slate-500 font-bold">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Team Members</h1>
          <p className="text-slate-500 font-bold mt-2">Manage access and roles</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl font-bold border border-red-100 flex items-center">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest pl-8">Name</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 pl-8 font-bold text-slate-700">{u.full_name || u.fullName}</td>
                <td className="p-6 text-slate-500 font-medium">{u.email}</td>
                <td className="p-6">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${u.role === 'tenant_admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-50 text-blue-600'
                    }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="p-12 text-center text-slate-400 font-bold">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-2">New Team Member</h2>
            <p className="text-slate-400 font-bold text-sm mb-8">Invite a user to your organization</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Full Name</label>
                <input
                  required
                  className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Password</label>
                <input
                  required
                  type="password"
                  className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Role</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="member">Data Entry Member</option>
                    <option value="tenant_admin">Administrator</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-slate-400 font-black hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
