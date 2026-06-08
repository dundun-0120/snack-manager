import { create } from 'zustand';
import { authService } from '../services/authService';
import { getCurrentProfile } from '../services/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getUser();
      if (user) {
        const profile = await getCurrentProfile();
        set({ user, profile, isAuthenticated: true });
      }
    } catch (err) { console.error('Auth init error:', err); }
    finally { set({ isLoading: false }); }
  },
  login: async (email, password) => {
    const { user } = await authService.signIn(email, password);
    const profile = await getCurrentProfile();
    set({ user, profile, isAuthenticated: true });
  },
  register: async (email, password, nickname) => {
    await authService.signUp(email, password, nickname);
  },
  logout: async () => {
    await authService.signOut();
    set({ user: null, profile: null, isAuthenticated: false });
  },
  subscribe: () => {
    const { data } = authService.onAuthChange((user) => {
      if (user) { getCurrentProfile().then(profile => set({ user, profile, isAuthenticated: true })); }
      else { set({ user: null, profile: null, isAuthenticated: false }); }
    });
    return data.subscription;
  },
}));

export default useAuthStore;
