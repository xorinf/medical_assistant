// store/authStore.js
// -----------------------------------------------------------------------------
// Zustand store for the current user + JWT. Persists to localStorage so a
// page refresh keeps you logged in.
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, bindTokenGetter, ApiError } from '../lib/api.js';

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  LAB: 'lab',
  PATIENT: 'patient',
});

export const ROLE_LABELS = Object.freeze({
  admin: 'Clinic Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  lab: 'Lab Technician',
  patient: 'Patient',
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const data = await api.post('/api/auth/login', { email, password });
          set({ token: data.token, user: data.user, loading: false });
          return data.user;
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Login failed';
          set({ loading: false, error: msg });
          throw err;
        }
      },

      async register(payload) {
        set({ loading: true, error: null });
        try {
          const data = await api.post('/api/auth/register', payload);
          set({ token: data.token, user: data.user, loading: false });
          return data.user;
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Registration failed';
          set({ loading: false, error: msg });
          throw err;
        }
      },

      async refreshMe() {
        if (!get().token) return null;
        try {
          const data = await api.get('/api/auth/me');
          set({ user: data.user });
          return data.user;
        } catch (_) {
          // token expired — clear silently
          set({ token: null, user: null });
          return null;
        }
      },

      logout() {
        set({ token: null, user: null, error: null });
      },
    }),
    {
      name: 'medassist-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Wire the token getter to the api wrapper.
bindTokenGetter(() => useAuthStore.getState().token);
