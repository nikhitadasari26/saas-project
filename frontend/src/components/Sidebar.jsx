import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Determine the correct dashboard path based on user role
  const dashboardPath = user?.role === 'super_admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col justify-between shadow-2xl shadow-slate-200/50 z-10 sticky top-0 h-screen">
      {/* TOP */}
      <div className="p-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200">
            📥
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">SaaS App</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nikhita's System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavLink
            to={dashboardPath}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`
            }
          >
            <span className="text-lg">📊</span> Dashboard
          </NavLink>

          {user?.role === 'tenant_admin' && (
            <>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`
                }
              >
                <span className="text-lg">📁</span> Projects
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`
                }
              >
                <span className="text-lg">👥</span> Team
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-6 m-4 bg-slate-50 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full text-center py-3 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
