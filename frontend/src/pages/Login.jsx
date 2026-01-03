import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await api.post('/auth/login', {
      email,
      password,
      tenantSubdomain,
    });

    console.log('LOGIN RESPONSE:', res.data);

    const token = res.data.data.token;
    const user = res.data.data.user;

    // ✅ SAVE AUTH DATA
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('SAVED TOKEN:', token);

    // ✅ FORCE REDIRECT
    navigate('/dashboard', { replace: true });

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Invalid credentials');
  }
};



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-xl shadow-blue-200">
          📥
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-2">
          Welcome Back
        </h2>

        <p className="text-slate-400 font-bold text-sm mb-10 tracking-tight">
          Sign in to your SaaS platform
        </p>

        {error && (
          <p className="mb-6 text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">
              Email Address
            </label>
            <input
              required
              type="email"
              className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-4 ring-blue-500/10 transition-all font-medium"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">
              Password
            </label>
            <input
              required
              type="password"
              className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-4 ring-blue-500/10 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">
              Organization Subdomain
            </label>
            <input
              required
              className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-4 ring-blue-500/10 transition-all font-medium"
              placeholder="demo"
              value={tenantSubdomain}
              onChange={(e) => setTenantSubdomain(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4"
          >
            ➜ Sign In
          </button>
        </form>

        <p className="mt-10 text-slate-400 font-bold text-sm">
          Don't have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Create Organization
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
