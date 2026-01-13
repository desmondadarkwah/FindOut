import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenService';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
});

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses as is
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('Refresh token not available');

        // Request new tokens using the refresh cd fro
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refresh-token`, { refreshToken });
        setTokens(data); // Save the new tokens

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest); // Retry the original request
      } catch (refreshError) {
        clearTokens(); // Clear tokens if refreshing fails
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
