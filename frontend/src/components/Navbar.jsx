import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => location.pathname.startsWith(path) ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-600' : 'text-slate-400 hover:bg-slate-800 hover:text-white';

  return (
    <nav className="w-64 bg-[#0f172a] h-screen flex flex-col p-4 sticky top-0 shadow-2xl">
      <div className="mb-10 px-4 py-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white uppercase tracking-tighter">SAAS PROJECT</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Nikhita's System</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${isActive('/dashboard')}`}>📊 Dashboard</Link>
        <Link to="/projects" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${isActive('/projects')}`}>📁 Projects</Link>
        <Link to="/users" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${isActive('/users')}`}>👥 Users</Link>
      </div>

      <div className="mt-auto p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{user.email?.charAt(0).toUpperCase()}</div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-white font-bold truncate">{user.email}</p>
            <p className="text-[8px] text-blue-400 font-bold uppercase">ADMIN</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full p-2 text-red-400 hover:bg-red-900/20 rounded-lg text-xs font-bold transition-all">🚪 Sign Out</button>
      </div>
    </nav>
  );
};

export default Navbar;