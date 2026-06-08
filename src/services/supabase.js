import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://amzlxvvihxmsymhgwbnb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qhHjLA7_fUtB9g5_v_hTSg_TReVXTOx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
};
