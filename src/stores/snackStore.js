import { create } from 'zustand';
import dataService from '../services/dataService';

const useSnackStore = create((set, get) => ({
  snacks: [],
  categories: [],
  selectedSnack: null,
  loading: false,
  error: null,

  fetchSnacks: async () => {
    set({ loading: true, error: null });
    try {
      const snacks = dataService.snacks.getAll();
      set({ snacks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = dataService.categories.getAll();
      set({ categories });
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  },

  addSnack: async (snack) => {
    try {
      dataService.snacks.add(snack);
      get().fetchSnacks();
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateSnack: async (snack) => {
    try {
      dataService.snacks.update(snack);
      get().fetchSnacks();
    } catch (err) {
      set({ error: err.message });
    }
  },

  deleteSnack: async (id) => {
    try {
      dataService.snacks.delete(id);
      get().fetchSnacks();
    } catch (err) {
      set({ error: err.message });
    }
  },

  setSelectedSnack: (snack) => set({ selectedSnack: snack }),
}));

export default useSnackStore;
