import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h2>SaaS Portal</h2>
        <nav>
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>Projects</Link>
          <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}>Team Management</Link>
        </nav>
        
        <div style={{marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #334155'}}>
          <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>{user.email}</p>
          <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="nav-link" style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer'}}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;