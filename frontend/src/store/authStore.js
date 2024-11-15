import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      signup: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.signup(userData);
          set({ 
            user: response.data.user, 
            token: response.data.token, 
            isAuthenticated: true,
            loading: false 
          });
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.error || 'Signup failed', 
            loading: false 
          });
          throw error;
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          set({ 
            user: response.data.user, 
            token: response.data.token, 
            isAuthenticated: true,
            loading: false 
          });
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.error || 'Login failed', 
            loading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      getCurrentUser: async () => {
        try {
          const response = await authAPI.getCurrentUser();
          set({ user: response.data });
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.error });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore; 