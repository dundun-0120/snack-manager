import { create } from 'zustand';
import dataService from '../services/dataService';

const useMemberStore = create((set, get) => ({
  members: [],
  selectedMember: null,
  error: null,

  fetchMembers: async () => {
    try {
      const members = dataService.members.getAll();
      set({ members });
    } catch (err) {
      set({ error: err.message });
    }
  },

  addMember: async (member) => {
    try {
      dataService.members.add(member);
      get().fetchMembers();
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateMember: async (member) => {
    try {
      dataService.members.update(member);
      get().fetchMembers();
    } catch (err) {
      set({ error: err.message });
    }
  },

  deleteMember: async (id) => {
    try {
      dataService.members.delete(id);
      get().fetchMembers();
    } catch (err) {
      set({ error: err.message });
    }
  },

  setSelectedMember: (member) => set({ selectedMember: member }),
}));

export default useMemberStore;
