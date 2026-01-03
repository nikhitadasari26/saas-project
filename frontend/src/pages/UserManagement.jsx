import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users'); // Ensure backend route exists
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/auth/add-user', formData); // Backend adds user to your tenant
    setShowModal(false);
    fetchUsers();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Team Members</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">+ Add User</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{user.full_name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{user.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Add New Team Member</h2>
            <input required className="w-full border p-3 rounded-lg mb-4" placeholder="Full Name" onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input required type="email" className="w-full border p-3 rounded-lg mb-4" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" name="password" className="w-full border p-3 rounded-lg mb-4" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
            <select className="w-full border p-3 rounded-lg mb-6" onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 text-slate-500 font-bold">Cancel</button>
              <button type="submit" className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-bold">Save User</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;