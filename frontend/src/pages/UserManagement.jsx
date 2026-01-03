import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    try {
      if (!user?.tenantId) return;
      const res = await api.get(`/tenants/${user.tenantId}/users`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!user?.tenantId) {
      setError('Tenant information missing. Please login again.');
      return;
    }

    try {
      await api.post(`/tenants/${user.tenantId}/users`, formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Team Members</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase">Name</th>
              <th className="p-4 text-xs font-bold uppercase">Email</th>
              <th className="p-4 text-xs font-bold uppercase">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{u.full_name || u.fullName}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Add New Team Member</h2>

            <input
              required
              className="w-full border p-3 rounded-lg mb-4"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <input
              required
              type="email"
              className="w-full border p-3 rounded-lg mb-4"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <input
              required
              type="password"
              className="w-full border p-3 rounded-lg mb-4"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <select
              className="w-full border p-3 rounded-lg mb-6"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 p-3 text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-bold"
              >
                Save User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
