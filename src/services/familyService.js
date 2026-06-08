import { supabase } from './supabase';

export const familyService = {
  createFamily: async (name, password) => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase.from('families').insert([{ name, password, creator_id: user.id }]).select().single();
    if (error) throw error;
    await supabase.from('family_members').insert([{ family_id: data.id, user_id: user.id, role: 'parent' }]);
    return data;
  },
  joinFamily: async (password) => {
    const { data: family, error } = await supabase.from('families').select('*').eq('password', password).single();
    if (error || !family) throw new Error('家庭密码错误');
    const user = (await supabase.auth.getUser()).data.user;
    const { data: existing } = await supabase.from('family_members').select('*').eq('family_id', family.id).eq('user_id', user.id).single();
    if (existing) throw new Error('你已加入该家庭');
    await supabase.from('family_members').insert([{ family_id: family.id, user_id: user.id, role: 'child' }]);
    return family;
  },
  getMyFamilies: async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase.from('family_members').select('family_id, role, families(*)').eq('user_id', user.id);
    if (error) throw error;
    return data.map(d => ({ ...d.families, role: d.role }));
  },
  getFamilyMembers: async (familyId) => {
    const { data, error } = await supabase.from('family_members').select('*, profiles(*)').eq('family_id', familyId);
    if (error) throw error;
    return data;
  },
  updateMemberRole: async (memberId, role) => {
    const { error } = await supabase.from('family_members').update({ role }).eq('id', memberId);
    if (error) throw error;
  },
};
