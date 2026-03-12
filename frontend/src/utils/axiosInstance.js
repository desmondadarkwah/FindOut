import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenService';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
});

// ✅ FIX: Don't override Authorization header if it's already set (for admin routes)
axiosInstance.interceptors.request.use((config) => {
  // Skip if Authorization header is already set (admin routes set it manually)
  if (config.headers.Authorization) {
    return config;
  }

  // Only add user token if no Authorization header exists
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ SKIP interceptor for admin routes
    if (originalRequest.url?.includes('/api/admin')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('Refresh token not available');

        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refresh-token`, { refreshToken });
        setTokens(data);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;