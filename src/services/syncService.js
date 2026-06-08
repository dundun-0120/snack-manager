import { supabase } from './supabase';

const getFamilyId = () => localStorage.getItem('current_family_id');

export const syncService = {
  snacks: {
    getAll: async () => {
      const familyId = getFamilyId();
      if (!familyId) return [];
      const { data, error } = await supabase.from('snacks').select('*').eq('family_id', familyId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    add: async (snack) => {
      const familyId = getFamilyId();
      const { data, error } = await supabase.from('snacks').insert([{ ...snack, family_id: familyId }]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (snack) => {
      const { data, error } = await supabase.from('snacks').update(snack).eq('id', snack.id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => { await supabase.from('snacks').delete().eq('id', id); },
  },
  claims: {
    getQueue: async () => {
      const familyId = getFamilyId();
      if (!familyId) return [];
      const { data } = await supabase.from('claims').select('*, snacks(name), profiles(nickname)').eq('family_id', familyId).eq('status', 'pending').order('requested_at', { ascending: false });
      return data || [];
    },
    request: async (snackId, quantity) => {
      const familyId = getFamilyId();
      const user = (await supabase.auth.getUser()).data.user;
      const { data: member } = await supabase.from('family_members').select('id').eq('family_id', familyId).eq('user_id', user.id).single();
      const { data, error } = await supabase.from('claims').insert([{ family_id: familyId, snack_id: snackId, member_id: member.id, quantity, status: 'pending' }]).select().single();
      if (error) throw error;
      return data;
    },
    approve: async (claimId) => {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('claims').update({ status: 'approved', processed_at: new Date().toISOString(), processed_by: user.id }).eq('id', claimId);
    },
    reject: async (claimId) => {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('claims').update({ status: 'rejected', processed_at: new Date().toISOString(), processed_by: user.id }).eq('id', claimId);
    },
  },
  subscribe: (table, callback) => {
    const familyId = getFamilyId();
    if (!familyId) return null;
    return supabase.channel(`${table}:${familyId}`).on('postgres_changes', { event: '*', schema: 'public', table, filter: `family_id=eq.${familyId}` }, callback).subscribe();
  },
};
