import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetData = React.useCallback(async () => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (token && storedUser) {
      console.log('AuthContext: Found token/user in storage, fetching tenant...');
      setUser(storedUser);
      if (storedUser.role !== 'super_admin' && storedUser.tenantId) {
        try {
          console.log(`AuthContext: Fetching tenant ${storedUser.tenantId}...`);
          const res = await api.get(`/tenants/${storedUser.tenantId}`);
          console.log('AuthContext: Tenant fetched successfully:', res.data.data);
          setTenant(res.data.data);
        } catch (error) {
          console.error("AuthContext: Failed to fetch tenant data", error);
          if (error.response && error.response.status === 401) {
            console.error("AuthContext: Token seems invalid (401), but NOT logging out automatically to prevent loops.");
            // logout(); 
          }
        }
      }
    } else {
      console.log('AuthContext: No token/user found in storage');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndSetData();
  }, [fetchAndSetData]);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    await fetchAndSetData(); // Fetch tenant data after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTenant(null);
    // This will force a redirect to login via ProtectedRoute
    window.location.href = '/login';
  };

  const refreshTenantData = () => {
    fetchAndSetData();
  };

  const value = {
    user,
    tenant,
    loading,
    login,
    logout,
    refreshTenantData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
