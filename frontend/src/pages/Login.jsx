import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  // 1. State to hold your input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // 2. The function that handles the login
  const handleLogin = async (e) => {
    e.preventDefault(); // STOPS THE REFRESH
    setError('');

    try {
      // Sends the data to your backend at port 5000
      const res = await api.post('/auth/login', { 
        email, 
        password, 
        tenantSubdomain 
      });

      if (res.data.success) {
        // Save the token and user data so ProtectedRoute lets you in
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        
        // Take the user to the dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      // Handles the 401 and 500 errors from your backend
      setError(err.response?.data?.message || 'Login failed. Check your connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-xl shadow-blue-200">📥</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-slate-400 font-bold text-sm mb-10 tracking-tight">Sign in to your SaaS platform</p>
        
        {/* Show error message if login fails */}
        {error && <p className="mb-6 text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">Email Address</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">Password</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">Organization Subdomain</label>
            <input 
              required
              className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-4 ring-blue-500/10 transition-all font-medium" 
              placeholder="techco"
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
          Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Create Organization</span>
        </p>
      </div>
    </div>
  );
};

export default Login;