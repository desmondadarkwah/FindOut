import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AdminContext = createContext();

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminContextProvider');
  }
  return context;
};

const AdminContextProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ MANUAL check - only called when needed
  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setLoading(false);
        return false;
      }
  
      const response = await axiosInstance.get('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('auth-response: ',response)
  
      if (response.data.success) {
        setAdmin(response.data.admin);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin auth check failed:', error);
      // ✅ AUTO-CLEAR expired/invalid tokens
      // localStorage.removeItem('adminToken');
      // setAdmin(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axiosInstance.post('/api/admin/login', {
        email,
        password
      });

      console.log('login-response: ' ,response)

      if (response.data.success) {
        setAdmin(response.data.admin);
        localStorage.setItem('adminToken', response.data.token);
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('adminToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    checkAuth, // ✅ NEW - manual check function
    isAuthenticated: !!admin,
    isSuperAdmin: admin?.isSuperAdmin || false
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;