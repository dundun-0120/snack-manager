import { supabase } from './supabase';

export const authService = {
  signUp: async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nickname } }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, nickname }]);
    }
    return data;
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  signOut: async () => { await supabase.auth.signOut(); },
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  onAuthChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};
