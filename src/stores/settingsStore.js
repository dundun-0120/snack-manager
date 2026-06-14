import { create } from 'zustand';
import dataService from '../services/dataService';

const SECRET_KEY = 'snack-manager-2024';
function encrypt(text) {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
  }
  return btoa(result);
}
function decrypt(text) {
  if (!text) return '';
  try {
    const decoded = atob(text);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch {
    return text;
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个页面' },
  navLast: { key: 'ArrowDown', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到最后一个页面' },
  navPrev: { key: 'ArrowLeft', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到上一个页面' },
  navNext: { key: 'ArrowRight', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到下一个页面' },
  search: { key: 'f', ctrl: true, meta: true, alt: false, shift: false, description: '打开搜索' },
  addSnack: { key: 'n', ctrl: true, meta: true, alt: false, shift: false, description: '添加零食' },
};

const DEFAULT_AI_CONFIG = {
  enabled: false,
  model: 'qwen',
  apiKey: '',
  baseUrl: '',
};

const DEFAULT_SETTINGS = {
  theme: 'cute',
  cuteColors: DEFAULT_CUTE_COLORS,
  shortcuts: DEFAULT_SHORTCUTS,
  aiConfig: DEFAULT_AI_CONFIG,
  autoSync: true,
  syncInterval: 5,
  notifications: true,
  soundEffects: true,
  language: 'zh-CN',
};

const useSettingsStore = create((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  loading: false,
  error: null,

  initSettings: async () => {
    set({ loading: true, error: null });
    try {
      const stored = await dataService.getSettings();
      if (stored) {
        set({ settings: { ...DEFAULT_SETTINGS, ...stored }, loading: false });
      } else {
        set({ settings: { ...DEFAULT_SETTINGS }, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ loading: true, error: null });
    try {
      const current = get().settings;
      const updated = { ...current, ...newSettings };
      await dataService.saveSettings(updated);
      set({ settings: updated, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateCuteColor: async (colorKey, colorValue) => {
    const current = get().settings;
    const updated = {
      ...current,
      cuteColors: { ...current.cuteColors, [colorKey]: colorValue },
    };
    return get().updateSettings(updated);
  },

  updateShortcut: async (shortcutKey, shortcutValue) => {
    const current = get().settings;
    const updated = {
      ...current,
      shortcuts: { ...current.shortcuts, [shortcutKey]: shortcutValue },
    };
    return get().updateSettings(updated);
  },

  updateAIConfig: async (aiConfig) => {
    const current = get().settings;
    const updated = {
      ...current,
      aiConfig: { ...current.aiConfig, ...aiConfig },
    };
    return get().updateSettings(updated);
  },

  resetSettings: async () => {
    set({ loading: true, error: null });
    try {
      await dataService.saveSettings(DEFAULT_SETTINGS);
      set({ settings: { ...DEFAULT_SETTINGS }, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  resetCuteColors: async () => {
    return get().updateSettings({ cuteColors: DEFAULT_CUTE_COLORS });
  },

  resetShortcuts: async () => {
    return get().updateSettings({ shortcuts: DEFAULT_SHORTCUTS });
  },

  clearError: () => set({ error: null }),
}));

export default useSettingsStore;
