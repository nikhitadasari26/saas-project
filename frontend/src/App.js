import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute'; 
import Navbar from './components/Navbar'; 

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* This matches the side-nav layout in the Multi-Tenant repo */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex w-full">
              <Navbar /> 
              <main className="flex-1 min-h-screen p-8 bg-[#f8fafc]">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<ProjectList />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/users" element={<UserManagement />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;