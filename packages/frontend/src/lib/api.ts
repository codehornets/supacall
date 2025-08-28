import axios from 'axios';
import { getTokens, setTokens, removeTokens, getCurrentOrgId } from './storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    const currentOrgId = getCurrentOrgId();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (currentOrgId) {
      config.headers['x-org-id'] = currentOrgId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { refreshToken } = getTokens();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
      }, {
        withCredentials: true
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setTokens(accessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      // Clear auth data on refresh token failure
      removeTokens();
      window.location.href = '/auth/login';
      return Promise.reject(refreshError);
    }
  }
);