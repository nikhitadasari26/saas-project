import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [isSubdomainLogin, setIsSubdomainLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useAuth();
  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const getSubdomain = () => {
      const hostname = window.location.hostname;
      if (hostname.includes('localhost')) {
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'localhost') {
          return parts[0];
        }
      }
      // Basic production logic
      else {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts[0];
        }
      }
      return null;
    };

    const detectedSubdomain = getSubdomain();
    if (detectedSubdomain) {
      setSubdomain(detectedSubdomain);
      setIsSubdomainLogin(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        subdomain,
      });

      const token = res.data.data.token;
      const user = res.data.data.user;

      // Handle subdomain redirection if necessary
      // Handle subdomain redirection if necessary

      // If user has a tenant subdomain but we are NOT on it (e.g. login from localhost or wrong subdomain)
      /*
      // If user has a tenant subdomain but we are NOT on it (e.g. login from localhost or wrong subdomain)
      if (user.role !== 'super_admin' && user.tenantSubdomain && currentSubdomain !== user.tenantSubdomain) {
        // Construct the new URL
        // We assume port 3000 for frontend. In prod this logic needs to be robust.
        const protocol = window.location.protocol;
        const rootDomain = currentHostname.includes('localhost') ? 'localhost' : currentHostname.split('.').slice(-2).join('.');
        const port = window.location.port ? `:${window.location.port}` : '';

        const targetUrl = `${protocol}//${user.tenantSubdomain}.${rootDomain}${port}/sso?token=${token}`;

        window.location.href = targetUrl;
        return;
      }
      */

      // Use the login function from context (stores in localStorage)
      await login(user, token);

      // Redirect based on role
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-xl shadow-blue-200">
          📥
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-2">
          {isSubdomainLogin ? `Sign in to ${subdomain}` : 'Welcome Back'}
        </h2>

        <p className="text-slate-400 font-bold text-sm mb-10 tracking-tight">
          {isSubdomainLogin ? `Enter your credentials to continue.` : 'Sign in to your SaaS platform'}
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

          {!isSubdomainLogin && (
            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2 block">
                Organization Subdomain (Optional for Super Admin)
              </label>
              <input
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-4 ring-blue-500/10 transition-all font-medium"
                placeholder="Leave empty if Super Admin"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Signing In...' : '➜ Sign In'}
          </button>
        </form>

        <p className="mt-10 text-slate-400 font-bold text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 cursor-pointer">
            Create Organization
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
