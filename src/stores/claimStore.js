import { create } from 'zustand';
import dataService from '../services/dataService';

const useClaimStore = create((set, get) => ({
  queue: [],
  records: [],
  error: null,

  fetchQueue: async () => {
    try {
      const queue = dataService.claims.getQueue();
      // 手动附加 member_name 和 snack_name
      const members = dataService.members.getAll();
      const snacks = dataService.snacks.getAll();
      const enrichedQueue = queue.map(q => ({
        ...q,
        member_name: members.find(m => m.id === q.member_id)?.name || '未知',
        snack_name: snacks.find(s => s.id === q.snack_id)?.name || '未知',
        size_level: snacks.find(s => s.id === q.snack_id)?.size_level || '中',
      }));
      set({ queue: enrichedQueue });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchRecords: async () => {
    try {
      const records = dataService.claims.getRecords();
      set({ records });
    } catch (err) {
      set({ error: err.message });
    }
  },

  addClaim: async (claim) => {
    try {
      dataService.claims.add(claim);
      get().fetchQueue();
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateClaim: async (claim) => {
    try {
      dataService.claims.update(claim);
      get().fetchQueue();
    } catch (err) {
      set({ error: err.message });
    }
  },

  confirmClaim: async (id) => {
    try {
      dataService.claims.confirm(id);
      get().fetchQueue();
      get().fetchRecords();
    } catch (err) {
      set({ error: err.message });
    }
  },

  cancelClaim: async (id, reason) => {
    try {
      dataService.claims.cancel(id, reason);
      get().fetchQueue();
    } catch (err) {
      set({ error: err.message });
    }
  },
}));

export default useClaimStore;
