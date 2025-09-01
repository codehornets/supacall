import axios from 'axios';
import { getTokens, setTokens, removeTokens, getCurrentOrgId, removeCurrentOrgId } from './storage';

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
  async (config) => {
    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = getTokens();
    const currentOrgId = getCurrentOrgId();

    if (
      accessTokenExpiry &&
      accessToken &&
      new Date(accessTokenExpiry) < new Date() &&
      refreshToken &&
      refreshTokenExpiry &&
      new Date(refreshTokenExpiry) > new Date()
    ) {
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      setTokens(response.data.accessToken, response.data.refreshToken, response.data.accessTokenExpiry, response.data.refreshTokenExpiry);
      config.headers.Authorization = `Bearer ${response.data.accessToken}`;
    }

    if (accessToken && accessTokenExpiry && new Date(accessTokenExpiry) > new Date()) {
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


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401 || error.response.status === 403) {
      removeTokens();
      removeCurrentOrgId();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
