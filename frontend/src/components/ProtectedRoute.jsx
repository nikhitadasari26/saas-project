import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4 text-center">Loading session...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user found in context, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
