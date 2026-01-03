import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Look for the token

  if (!token) {
    // If no token exists, send them to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;