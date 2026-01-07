import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    subdomain: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register-tenant', {
        organizationName: formData.organizationName,
        subdomain: formData.subdomain,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password
      });

      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12 w-full max-w-[600px]">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-xl shadow-blue-200">
          🚀
        </div>

        <h2 className="text-3xl font-black text-slate-800 text-center mb-2 tracking-tight">Start Your Journey</h2>
        <p className="text-slate-400 font-bold text-sm text-center mb-10">Create your organization workspace</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 mb-8 rounded-2xl font-bold text-sm flex items-center justify-center border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Organization</label>
              <input
                type="text" placeholder="TechCorp" required
                className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Subdomain</label>
              <input
                type="text" placeholder="techcorp" required
                className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Admin Name</label>
                <input
                  type="text" placeholder="John Doe" required
                  className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Admin Email</label>
                <input
                  type="email" placeholder="admin@company.com" required
                  className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Password</label>
              <input
                type="password" placeholder="••••••••" required
                className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Confirm</label>
              <input
                type="password" placeholder="••••••••" required
                className="w-full bg-slate-50 border-0 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-lg text-white transition-all shadow-xl mt-6 ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1'
              }`}
          >
            {loading ? 'Creating Account...' : '➜ Create Organization'}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-400 font-bold text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;