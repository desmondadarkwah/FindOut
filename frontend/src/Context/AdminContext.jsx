import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAdmin(response.data.admin);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        localStorage.removeItem('adminToken');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/api/admin/login', {
        email,
        password
      });

      if (response.data.success) {
        setAdmin(response.data.admin);
        localStorage.setItem('adminToken', response.data.token);
        
        // Configure axios to use admin token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
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
      navigate('/admin-login');
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
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