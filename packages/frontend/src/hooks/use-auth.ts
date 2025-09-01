import { create } from 'zustand';
import { api } from '@/lib/api';
import {
  setTokens,
  removeTokens,
  setCurrentOrgId,
  removeCurrentOrgId,
  getTokens,
  getCurrentOrgId
} from '@/lib/storage';

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAuthenticated: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentOrg: (orgId: string) => void;
}

type State = AuthState;
type Actions = {
  setState: (state: Partial<State>) => void;
};

export const useAuth = create<State & Actions>((set, get) => ({
  user: null,
  organizations: [],
  currentOrg: null,
  isLoading: true, // Start with loading true
  isInitialized: false,
  error: null,
  isAuthenticated: false,
  setState: (newState) => set(newState),

  init: async () => {
    try {
      const { refreshToken } = getTokens();

      // If no tokens, not authenticated
      if (!refreshToken) {
        set({ isLoading: false, isAuthenticated: false, isInitialized: true });
        return;
      }

      // Get user data and organizations
      const response = await api.get('/auth/me');
      const { user, organizations } = response.data;

      // Handle organization selection
      const storedOrgId = getCurrentOrgId();
      let currentOrg = null;

      if (storedOrgId) {
        currentOrg = organizations.find((org: Organization) => org.id === storedOrgId);
      }

      // If no stored org or stored org not found, use first org
      if (!currentOrg && organizations.length > 0) {
        currentOrg = organizations[0];
        setCurrentOrgId(currentOrg.id);
      }

      set({
        user,
        organizations,
        currentOrg,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        user: null,
        organizations: [],
        currentOrg: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Session expired. Please login again.'
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, organizations, accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = response.data;

      setTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);

      if (organizations.length > 0) {
        setCurrentOrgId(organizations[0].id);
        set({ currentOrg: organizations[0] });
      }

      set({
        user,
        organizations,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to login',
        isLoading: false,
        isInitialized: true,
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, organizationName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        organizationName,
      });

      const { user, organizations, accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = response.data;

      setTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);

      if (organizations.length > 0) {
        setCurrentOrgId(organizations[0].id);
        set({ currentOrg: organizations[0] });
      }

      set({
        user,
        organizations,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to register',
        isLoading: false,
        isInitialized: true,
      });
      throw error;
    }
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/verify-email', { email, code });
      set(state => ({
        user: state.user ? { ...state.user, isVerified: true } : null,
        isLoading: false,
        isInitialized: true,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to verify email',
        isLoading: false,
        isInitialized: true,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { refreshToken } = getTokens();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeTokens();
      removeCurrentOrgId();
      set({
        user: null,
        organizations: [],
        currentOrg: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  setCurrentOrg: (orgId: string) => {
    set(state => {
      const org = state.organizations.find(o => o.id === orgId);
      if (org) {
        setCurrentOrgId(orgId);
        return { currentOrg: org };
      }
      return {};
    });
  },
}));
