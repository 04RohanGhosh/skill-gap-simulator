import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authAPI from './apiService';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    isAdmin?: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: {
    name?: string;
    email?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const { data } = response;

          set({
            user: {
              id: data._id,
              name: data.name,
              email: data.email,
              avatar_url: data.avatar_url,
              isAdmin: data.isAdmin,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage
          localStorage.setItem('access_token', data.token);
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register({ name, email, password });
          const { data } = response;

          set({
            user: {
              id: data._id,
              name: data.name,
              email: data.email,
              avatar_url: data.avatar_url,
              isAdmin: data.isAdmin,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage
          localStorage.setItem('access_token', data.token);
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local storage
          localStorage.removeItem('access_token');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          const { data } = response;

          set({
            user: {
              id: data._id,
              name: data.name,
              email: data.email,
              avatar_url: data.avatar_url,
              isAdmin: data.isAdmin,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Fetch user error:', error);
          localStorage.removeItem('access_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(userData);
          const { data } = response;

          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  name: data.name || state.user.name,
                  email: data.email || state.user.email,
                  avatar_url: data.avatar_url || state.user.avatar_url,
                }
              : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Profile update failed');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state on app load
export const initializeAuth = async () => {
  const store = useAuthStore.getState();
  await store.fetchUser();
};