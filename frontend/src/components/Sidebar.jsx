import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
      {/* TOP */}
      <div>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">SAAS PROJECT</h1>
          <p className="text-xs text-slate-400 mt-1">NIKHITA'S SYSTEM</p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`
            }
          >
            📁 Projects
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`
            }
          >
            👥 Users
          </NavLink>
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-4 border-t border-slate-700">
        <div className="mb-3 text-sm">
          <p className="font-semibold">{user?.email || 'User'}</p>
          <p className="text-xs text-slate-400 uppercase">
            {user?.role || '—'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-slate-800"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
