import { create } from 'zustand';
import dataService from '../services/dataService';

// 简单 XOR 加密（防止明文暴露，不是强加密）
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
    return text; // 兼容旧数据（未加密的）
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个
cd ~/Desktop/snack-manager && cat > src/stores/settingsStore.js << 'ENDOFFILE'
import { create } from 'zustand';
import dataService from '../services/dataService';

// 简单 XOR 加密（防止明文暴露，不是强加密）
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
    return text; // 兼容旧数据（未加密的）
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个
cd ~/Desktop/snack-manager && cat > src/stores/settingsStore.js << 'ENDOFFILE'
import { create } from 'zustand';
import dataService from '../services/dataService';

// 简单 XOR 加密（防止明文暴露，不是强加密）
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
    return text; // 兼容旧数据（未加密的）
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个菜单' },
  navLast: { key: 'ArrowDown', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到最后一个菜单' },
};

const DEFAULT_CUTE_EFFECTS = {
  bounce: true,    // 菜单弹跳
  gradient: true,  // 渐变流动
  sparkle: true,   // 按钮闪烁
  float: true,     // 卡片悬浮
  wiggle: true,    // 图标摇摆
  breathe: true,   // 配额呼吸
  fade: true,      // 页面淡入
  wave: true,      // 按钮波浪
};

const useSettingsStore = create((set, get) => ({
  settings: {},
  theme: 'professional',
  autoUpdate: true,
  cuteColors: { ...DEFAULT_CUTE_COLORS },
  quotaDisplayMode: 'remaining',
  cuteEffects: { ...DEFAULT_CUTE_EFFECTS },
  aiConfig: { enabled: true, model: 'qwen', apiKey: '' },
  priceConfig: { autoSearch: true },
  alertConfig: { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true },
  shortcuts: { ...DEFAULT_SHORTCUTS },
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await dataService.settings.getAll();
      const theme = settings.theme || 'professional';
      const autoUpdate = settings.auto_update !== 'false';
      const cuteColors = settings.cute_colors ? JSON.parse(settings.cute_colors) : { ...DEFAULT_CUTE_COLORS };
      const quotaDisplayMode = settings.quota_display_mode || 'remaining';
      const cuteEffects = settings.cute_effects ? JSON.parse(settings.cute_effects) : { ...DEFAULT_CUTE_EFFECTS };
      const aiConfig = settings.ai_config ? JSON.parse(settings.ai_config) : { enabled: true, model: 'qwen', apiKey: '' };
      const priceConfig = settings.price_config ? JSON.parse(settings.price_config) : { autoSearch: true };
      const alertConfig = settings.alert_config ? JSON.parse(settings.alert_config) : { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
      const shortcuts = settings.shortcuts ? JSON.parse(settings.shortcuts) : { ...DEFAULT_SHORTCUTS };

      // 解密 API Key
      if (aiConfig.apiKey) {
        aiConfig.apiKey = decrypt(aiConfig.apiKey);
      }

      set({
        settings,
        theme,
        autoUpdate,
        cuteColors,
        quotaDisplayMode,
        cuteEffects,
        aiConfig,
        priceConfig,
        alertConfig,
        shortcuts,
        loading: false,
      });

      // 应用主题
      document.body.className = 'theme-' + theme;
      // 应用自定义颜色
      setTimeout(() => {
        get().applyCuteColors();
        get().applyCuteEffects();
      }, 0);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setTheme: (theme) => {
    set({ theme });
    document.body.className = 'theme-' + theme;
    dataService.settings.update('theme', String(theme));
    // 切换主题后重新应用自定义颜色和灵动效果
    setTimeout(() => {
      get().applyCuteColors();
      get().applyCuteEffects();
    }, 0);
  },

  setCuteColor: (key, value) => {
    const newColors = { ...get().cuteColors, [key]: value };
    set({ cuteColors: newColors });
    dataService.settings.update('cute_colors', JSON.stringify(newColors));
    get().applyCuteColors();
  },

  resetCuteColors: () => {
    // 恢复用户设置的默认配色，如果没有则恢复原始默认
    const currentColors = get().cuteColors;
    const defaultColors = currentColors._userDefault || DEFAULT_CUTE_COLORS;
    set({ cuteColors: { ...defaultColors, _userDefault: defaultColors } });
    dataService.settings.update('cute_colors', JSON.stringify(defaultColors));
    get().applyCuteColors();
  },

  setDefaultCuteColors: () => {
    // 将当前配色设为默认配色（刷新后也会使用这个配色）
    const currentColors = get().cuteColors;
    const colorsToSave = { primary: currentColors.primary, secondary: currentColors.secondary, border: currentColors.border, bg: currentColors.bg };
    dataService.settings.update('cute_colors_default', JSON.stringify(colorsToSave));
    // 同时更新内存中的标记，以便 resetCuteColors 知道用户默认是什么
    set({ cuteColors: { ...currentColors, _userDefault: colorsToSave } });
    alert('已将当前配色设为默认配色！刷新后也会保持。');
  },

  // 根据颜色亮度计算文字颜色（黑或白）
  getContrastColor: (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // 计算亮度 (YIQ)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#333333' : '#ffffff';
  },

  applyCuteColors: () => {
    const { theme, cuteColors } = get();
    if (theme !== 'cute') return;
    // 计算按钮文字颜色
    const btnTextColor = get().getContrastColor(cuteColors.primary);
    // 动态注入/更新 CSS 变量覆盖
    let styleEl = document.getElementById('cute-custom-colors');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cute-custom-colors';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      body.theme-cute {
        --primary-color: ${cuteColors.primary};
        --secondary-color: ${cuteColors.secondary};
        --border-color: ${cuteColors.border};
        --bg-color: ${cuteColors.bg};
        --btn-text-color: ${btnTextColor};
      }
      body.theme-cute .sidebar {
        background: linear-gradient(180deg, ${cuteColors.bg} 0%, ${cuteColors.primary}22 100%);
        border-right: 2px solid ${cuteColors.border};
      }
      body.theme-cute .sidebar-logo {
        border-bottom: 2px dashed ${cuteColors.border};
      }
      body.theme-cute .sidebar-menu li a.active {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .sidebar-menu li a:hover {
        background-color: ${cuteColors.primary}26;
      }
      body.theme-cute .header,
      body.theme-cute .footer {
        background: linear-gradient(90deg, ${cuteColors.bg} 0%, ${cuteColors.primary}15 100%);
        border-color: ${cuteColors.border};
      }
      body.theme-cute .add-btn,
      body.theme-cute .submit-btn {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .confirm-btn {
        background: linear-gradient(135deg, ${cuteColors.secondary}, ${cuteColors.secondary}cc);
      }
      body.theme-cute .snack-card,
      body.theme-cute .stat-card,
      body.theme-cute .section,
      body.theme-cute .settings-section,
      body.theme-cute .ranking-section,
      body.theme-cute .stats-section,
      body.theme-cute .recommend-section,
      body.theme-cute .tips-section {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .modal-content {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input,
      body.theme-cute .form-group select,
      body.theme-cute .form-group textarea {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input:focus,
      body.theme-cute .form-group select:focus,
      body.theme-cute .form-group textarea:focus {
        border-color: ${cuteColors.primary};
        box-shadow: 0 0 0 3px ${cuteColors.primary}33;
      }
      body.theme-cute .member-avatar {
        border-color: ${cuteColors.border};
      }
    `;
  },

  setQuotaDisplayMode: (mode) => {
    set({ quotaDisplayMode: mode });
    dataService.settings.update('quota_display_mode', mode);
  },

  setCuteEffect: (key, value) => {
    const newEffects = { ...get().cuteEffects, [key]: value };
    set({ cuteEffects: newEffects });
    dataService.settings.update('cute_effects', JSON.stringify(newEffects));
    get().applyCuteEffects();
  },

  resetCuteEffects: () => {
    set({ cuteEffects: { ...DEFAULT_CUTE_EFFECTS } });
    dataService.settings.update('cute_effects', JSON.stringify(DEFAULT_CUTE_EFFECTS));
    get().applyCuteEffects();
  },

  applyCuteEffects: () => {
    const { theme, cuteEffects } = get();
    if (theme !== 'cute') {
      // 非可爱主题时移除效果
      document.body.classList.remove('effect-bounce', 'effect-gradient', 'effect-sparkle', 'effect-float', 'effect-wiggle', 'effect-breathe', 'effect-fade', 'effect-wave');
      return;
    }
    // 根据开关添加/移除效果类
    const effectMap = {
      bounce: 'effect-bounce',
      gradient: 'effect-gradient',
      sparkle: 'effect-sparkle',
      float: 'effect-float',
      wiggle: 'effect-wiggle',
      breathe: 'effect-breathe',
      fade: 'effect-fade',
      wave: 'effect-wave',
    };
    Object.entries(effectMap).forEach(([key, className]) => {
      if (cuteEffects[key]) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    });
  },

  setAiConfig: (key, value) => {
    const newConfig = { ...get().aiConfig, [key]: value };
    // 加密 API Key
    if (key === 'apiKey') {
      newConfig.apiKey = value;
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(value) }));
    } else {
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(newConfig.apiKey) }));
    }
    set({ aiConfig: newConfig });
  },

  resetAiConfig: () => {
    const defaultConfig = { enabled: true, model: 'qwen', apiKey: '' };
    set({ aiConfig: defaultConfig });
    dataService.settings.update('ai_config', JSON.stringify({ ...defaultConfig, apiKey: encrypt('') }));
  },

  setPriceConfig: (key, value) => {
    const newConfig = { ...get().priceConfig, [key]: value };
    set({ priceConfig: newConfig });
    dataService.settings.update('price_config', JSON.stringify(newConfig));
  },

  resetPriceConfig: () => {
    const defaultConfig = { autoSearch: true };
    set({ priceConfig: defaultConfig });
    dataService.settings.update('price_config', JSON.stringify(defaultConfig));
  },

  setAlertConfig: (key, value) => {
    const newConfig = { ...get().alertConfig, [key]: value };
    set({ alertConfig: newConfig });
    dataService.settings.update('alert_config', JSON.stringify(newConfig));
  },

  resetAlertConfig: () => {
    const defaultConfig = { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
    set({ alertConfig: defaultConfig });
    dataService.settings.update('alert_config', JSON.stringify(defaultConfig));
  },

  setShortcut: (key, shortcut) => {
    const newShortcuts = { ...get().shortcuts, [key]: shortcut };
    set({ shortcuts: newShortcuts });
    dataService.settings.update('shortcuts', JSON.stringify(newShortcuts));
  },

  resetShortcuts: () => {
    set({ shortcuts: { ...DEFAULT_SHORTCUTS } });
    dataService.settings.update('shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
  },

  backupData: async () => {
    try {
      const data = await dataService.backup.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snack-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('备份失败:', err);
      return false;
    }
  },
}));

export default useSettingsStore;
ENDOFFILEcd ~/Desktop/snack-manager && cat > src/stores/settingsStore.js << 'ENDOFFILE'
import { create } from 'zustand';
import dataService from '../services/dataService';

// 简单 XOR 加密（防止明文暴露，不是强加密）
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
    return text; // 兼容旧数据（未加密的）
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个菜单' },
  navLast: { key: 'ArrowDown', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到最后一个菜单' },
};

const DEFAULT_CUTE_EFFECTS = {
  bounce: true,    // 菜单弹跳
  gradient: true,  // 渐变流动
  sparkle: true,   // 按钮闪烁
  float: true,     // 卡片悬浮
  wiggle: true,    // 图标摇摆
  breathe: true,   // 配额呼吸
  fade: true,      // 页面淡入
  wave: true,      // 按钮波浪
};

const useSettingsStore = create((set, get) => ({
  settings: {},
  theme: 'professional',
  autoUpdate: true,
  cuteColors: { ...DEFAULT_CUTE_COLORS },
  quotaDisplayMode: 'remaining',
  cuteEffects: { ...DEFAULT_CUTE_EFFECTS },
  aiConfig: { enabled: true, model: 'qwen', apiKey: '' },
  priceConfig: { autoSearch: true },
  alertConfig: { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true },
  shortcuts: { ...DEFAULT_SHORTCUTS },
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await dataService.settings.getAll();
      const theme = settings.theme || 'professional';
      const autoUpdate = settings.auto_update !== 'false';
      const cuteColors = settings.cute_colors ? JSON.parse(settings.cute_colors) : { ...DEFAULT_CUTE_COLORS };
      const quotaDisplayMode = settings.quota_display_mode || 'remaining';
      const cuteEffects = settings.cute_effects ? JSON.parse(settings.cute_effects) : { ...DEFAULT_CUTE_EFFECTS };
      const aiConfig = settings.ai_config ? JSON.parse(settings.ai_config) : { enabled: true, model: 'qwen', apiKey: '' };
      const priceConfig = settings.price_config ? JSON.parse(settings.price_config) : { autoSearch: true };
      const alertConfig = settings.alert_config ? JSON.parse(settings.alert_config) : { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
      const shortcuts = settings.shortcuts ? JSON.parse(settings.shortcuts) : { ...DEFAULT_SHORTCUTS };

      // 解密 API Key
      if (aiConfig.apiKey) {
        aiConfig.apiKey = decrypt(aiConfig.apiKey);
      }

      set({
        settings,
        theme,
        autoUpdate,
        cuteColors,
        quotaDisplayMode,
        cuteEffects,
        aiConfig,
        priceConfig,
        alertConfig,
        shortcuts,
        loading: false,
      });

      // 应用主题
      document.body.className = 'theme-' + theme;
      // 应用自定义颜色
      setTimeout(() => {
        get().applyCuteColors();
        get().applyCuteEffects();
      }, 0);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setTheme: (theme) => {
    set({ theme });
    document.body.className = 'theme-' + theme;
    dataService.settings.update('theme', String(theme));
    // 切换主题后重新应用自定义颜色和灵动效果
    setTimeout(() => {
      get().applyCuteColors();
      get().applyCuteEffects();
    }, 0);
  },

  setCuteColor: (key, value) => {
    const newColors = { ...get().cuteColors, [key]: value };
    set({ cuteColors: newColors });
    dataService.settings.update('cute_colors', JSON.stringify(newColors));
    get().applyCuteColors();
  },

  resetCuteColors: () => {
    // 恢复用户设置的默认配色，如果没有则恢复原始默认
    const currentColors = get().cuteColors;
    const defaultColors = currentColors._userDefault || DEFAULT_CUTE_COLORS;
    set({ cuteColors: { ...defaultColors, _userDefault: defaultColors } });
    dataService.settings.update('cute_colors', JSON.stringify(defaultColors));
    get().applyCuteColors();
  },

  setDefaultCuteColors: () => {
    // 将当前配色设为默认配色（刷新后也会使用这个配色）
    const currentColors = get().cuteColors;
    const colorsToSave = { primary: currentColors.primary, secondary: currentColors.secondary, border: currentColors.border, bg: currentColors.bg };
    dataService.settings.update('cute_colors_default', JSON.stringify(colorsToSave));
    // 同时更新内存中的标记，以便 resetCuteColors 知道用户默认是什么
    set({ cuteColors: { ...currentColors, _userDefault: colorsToSave } });
    alert('已将当前配色设为默认配色！刷新后也会保持。');
  },

  // 根据颜色亮度计算文字颜色（黑或白）
  getContrastColor: (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // 计算亮度 (YIQ)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#333333' : '#ffffff';
  },

  applyCuteColors: () => {
    const { theme, cuteColors } = get();
    if (theme !== 'cute') return;
    // 计算按钮文字颜色
    const btnTextColor = get().getContrastColor(cuteColors.primary);
    // 动态注入/更新 CSS 变量覆盖
    let styleEl = document.getElementById('cute-custom-colors');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cute-custom-colors';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      body.theme-cute {
        --primary-color: ${cuteColors.primary};
        --secondary-color: ${cuteColors.secondary};
        --border-color: ${cuteColors.border};
        --bg-color: ${cuteColors.bg};
        --btn-text-color: ${btnTextColor};
      }
      body.theme-cute .sidebar {
        background: linear-gradient(180deg, ${cuteColors.bg} 0%, ${cuteColors.primary}22 100%);
        border-right: 2px solid ${cuteColors.border};
      }
      body.theme-cute .sidebar-logo {
        border-bottom: 2px dashed ${cuteColors.border};
      }
      body.theme-cute .sidebar-menu li a.active {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .sidebar-menu li a:hover {
        background-color: ${cuteColors.primary}26;
      }
      body.theme-cute .header,
      body.theme-cute .footer {
        background: linear-gradient(90deg, ${cuteColors.bg} 0%, ${cuteColors.primary}15 100%);
        border-color: ${cuteColors.border};
      }
      body.theme-cute .add-btn,
      body.theme-cute .submit-btn {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .confirm-btn {
        background: linear-gradient(135deg, ${cuteColors.secondary}, ${cuteColors.secondary}cc);
      }
      body.theme-cute .snack-card,
      body.theme-cute .stat-card,
      body.theme-cute .section,
      body.theme-cute .settings-section,
      body.theme-cute .ranking-section,
      body.theme-cute .stats-section,
      body.theme-cute .recommend-section,
      body.theme-cute .tips-section {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .modal-content {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input,
      body.theme-cute .form-group select,
      body.theme-cute .form-group textarea {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input:focus,
      body.theme-cute .form-group select:focus,
      body.theme-cute .form-group textarea:focus {
        border-color: ${cuteColors.primary};
        box-shadow: 0 0 0 3px ${cuteColors.primary}33;
      }
      body.theme-cute .member-avatar {
        border-color: ${cuteColors.border};
      }
    `;
  },

  setQuotaDisplayMode: (mode) => {
    set({ quotaDisplayMode: mode });
    dataService.settings.update('quota_display_mode', mode);
  },

  setCuteEffect: (key, value) => {
    const newEffects = { ...get().cuteEffects, [key]: value };
    set({ cuteEffects: newEffects });
    dataService.settings.update('cute_effects', JSON.stringify(newEffects));
    get().applyCuteEffects();
  },

  resetCuteEffects: () => {
    set({ cuteEffects: { ...DEFAULT_CUTE_EFFECTS } });
    dataService.settings.update('cute_effects', JSON.stringify(DEFAULT_CUTE_EFFECTS));
    get().applyCuteEffects();
  },

  applyCuteEffects: () => {
    const { theme, cuteEffects } = get();
    if (theme !== 'cute') {
      // 非可爱主题时移除效果
      document.body.classList.remove('effect-bounce', 'effect-gradient', 'effect-sparkle', 'effect-float', 'effect-wiggle', 'effect-breathe', 'effect-fade', 'effect-wave');
      return;
    }
    // 根据开关添加/移除效果类
    const effectMap = {
      bounce: 'effect-bounce',
      gradient: 'effect-gradient',
      sparkle: 'effect-sparkle',
      float: 'effect-float',
      wiggle: 'effect-wiggle',
      breathe: 'effect-breathe',
      fade: 'effect-fade',
      wave: 'effect-wave',
    };
    Object.entries(effectMap).forEach(([key, className]) => {
      if (cuteEffects[key]) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    });
  },

  setAiConfig: (key, value) => {
    const newConfig = { ...get().aiConfig, [key]: value };
    // 加密 API Key
    if (key === 'apiKey') {
      newConfig.apiKey = value;
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(value) }));
    } else {
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(newConfig.apiKey) }));
    }
    set({ aiConfig: newConfig });
  },

  resetAiConfig: () => {
    const defaultConfig = { enabled: true, model: 'qwen', apiKey: '' };
    set({ aiConfig: defaultConfig });
    dataService.settings.update('ai_config', JSON.stringify({ ...defaultConfig, apiKey: encrypt('') }));
  },

  setPriceConfig: (key, value) => {
    const newConfig = { ...get().priceConfig, [key]: value };
    set({ priceConfig: newConfig });
    dataService.settings.update('price_config', JSON.stringify(newConfig));
  },

  resetPriceConfig: () => {
    const defaultConfig = { autoSearch: true };
    set({ priceConfig: defaultConfig });
    dataService.settings.update('price_config', JSON.stringify(defaultConfig));
  },

  setAlertConfig: (key, value) => {
    const newConfig = { ...get().alertConfig, [key]: value };
    set({ alertConfig: newConfig });
    dataService.settings.update('alert_config', JSON.stringify(newConfig));
  },

  resetAlertConfig: () => {
    const defaultConfig = { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
    set({ alertConfig: defaultConfig });
    dataService.settings.update('alert_config', JSON.stringify(defaultConfig));
  },

  setShortcut: (key, shortcut) => {
    const newShortcuts = { ...get().shortcuts, [key]: shortcut };
    set({ shortcuts: newShortcuts });
    dataService.settings.update('shortcuts', JSON.stringify(newShortcuts));
  },

  resetShortcuts: () => {
    set({ shortcuts: { ...DEFAULT_SHORTCUTS } });
    dataService.settings.update('shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
  },

  backupData: async () => {
    try {
      const data = await dataService.backup.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snack-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('备份失败:', err);
      return false;
    }
  },
}));

export default useSettingsStore;
ENDOFFI
cd ~/Desktop/snack-manager && cat > src/stores/settingsStore.js << 'ENDOFFILE'
import { create } from 'zustand';
import dataService from '../services/dataService';

// 简单 XOR 加密（防止明文暴露，不是强加密）
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
    return text; // 兼容旧数据（未加密的）
  }
}

const DEFAULT_CUTE_COLORS = {
  primary: '#FF6B6B',
  secondary: '#FFE66D',
  border: '#FFD93D',
  bg: '#FFF9F0',
};

const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到第一个菜单' },
  navLast: { key: 'ArrowDown', ctrl: true, meta: true, alt: false, shift: false, description: '跳转到最后一个菜单' },
};

const DEFAULT_CUTE_EFFECTS = {
  bounce: true,    // 菜单弹跳
  gradient: true,  // 渐变流动
  sparkle: true,   // 按钮闪烁
  float: true,     // 卡片悬浮
  wiggle: true,    // 图标摇摆
  breathe: true,   // 配额呼吸
  fade: true,      // 页面淡入
  wave: true,      // 按钮波浪
};

const useSettingsStore = create((set, get) => ({
  settings: {},
  theme: 'professional',
  autoUpdate: true,
  cuteColors: { ...DEFAULT_CUTE_COLORS },
  quotaDisplayMode: 'remaining',
  cuteEffects: { ...DEFAULT_CUTE_EFFECTS },
  aiConfig: { enabled: true, model: 'qwen', apiKey: '' },
  priceConfig: { autoSearch: true },
  alertConfig: { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true },
  shortcuts: { ...DEFAULT_SHORTCUTS },
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await dataService.settings.getAll();
      const theme = settings.theme || 'professional';
      const autoUpdate = settings.auto_update !== 'false';
      const cuteColors = settings.cute_colors ? JSON.parse(settings.cute_colors) : { ...DEFAULT_CUTE_COLORS };
      const quotaDisplayMode = settings.quota_display_mode || 'remaining';
      const cuteEffects = settings.cute_effects ? JSON.parse(settings.cute_effects) : { ...DEFAULT_CUTE_EFFECTS };
      const aiConfig = settings.ai_config ? JSON.parse(settings.ai_config) : { enabled: true, model: 'qwen', apiKey: '' };
      const priceConfig = settings.price_config ? JSON.parse(settings.price_config) : { autoSearch: true };
      const alertConfig = settings.alert_config ? JSON.parse(settings.alert_config) : { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
      const shortcuts = settings.shortcuts ? JSON.parse(settings.shortcuts) : { ...DEFAULT_SHORTCUTS };

      // 解密 API Key
      if (aiConfig.apiKey) {
        aiConfig.apiKey = decrypt(aiConfig.apiKey);
      }

      set({
        settings,
        theme,
        autoUpdate,
        cuteColors,
        quotaDisplayMode,
        cuteEffects,
        aiConfig,
        priceConfig,
        alertConfig,
        shortcuts,
        loading: false,
      });

      // 应用主题
      document.body.className = 'theme-' + theme;
      // 应用自定义颜色
      setTimeout(() => {
        get().applyCuteColors();
        get().applyCuteEffects();
      }, 0);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setTheme: (theme) => {
    set({ theme });
    document.body.className = 'theme-' + theme;
    dataService.settings.update('theme', String(theme));
    // 切换主题后重新应用自定义颜色和灵动效果
    setTimeout(() => {
      get().applyCuteColors();
      get().applyCuteEffects();
    }, 0);
  },

  setCuteColor: (key, value) => {
    const newColors = { ...get().cuteColors, [key]: value };
    set({ cuteColors: newColors });
    dataService.settings.update('cute_colors', JSON.stringify(newColors));
    get().applyCuteColors();
  },

  resetCuteColors: () => {
    // 恢复用户设置的默认配色，如果没有则恢复原始默认
    const currentColors = get().cuteColors;
    const defaultColors = currentColors._userDefault || DEFAULT_CUTE_COLORS;
    set({ cuteColors: { ...defaultColors, _userDefault: defaultColors } });
    dataService.settings.update('cute_colors', JSON.stringify(defaultColors));
    get().applyCuteColors();
  },

  setDefaultCuteColors: () => {
    // 将当前配色设为默认配色（刷新后也会使用这个配色）
    const currentColors = get().cuteColors;
    const colorsToSave = { primary: currentColors.primary, secondary: currentColors.secondary, border: currentColors.border, bg: currentColors.bg };
    dataService.settings.update('cute_colors_default', JSON.stringify(colorsToSave));
    // 同时更新内存中的标记，以便 resetCuteColors 知道用户默认是什么
    set({ cuteColors: { ...currentColors, _userDefault: colorsToSave } });
    alert('已将当前配色设为默认配色！刷新后也会保持。');
  },

  // 根据颜色亮度计算文字颜色（黑或白）
  getContrastColor: (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // 计算亮度 (YIQ)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#333333' : '#ffffff';
  },

  applyCuteColors: () => {
    const { theme, cuteColors } = get();
    if (theme !== 'cute') return;
    // 计算按钮文字颜色
    const btnTextColor = get().getContrastColor(cuteColors.primary);
    // 动态注入/更新 CSS 变量覆盖
    let styleEl = document.getElementById('cute-custom-colors');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cute-custom-colors';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      body.theme-cute {
        --primary-color: ${cuteColors.primary};
        --secondary-color: ${cuteColors.secondary};
        --border-color: ${cuteColors.border};
        --bg-color: ${cuteColors.bg};
        --btn-text-color: ${btnTextColor};
      }
      body.theme-cute .sidebar {
        background: linear-gradient(180deg, ${cuteColors.bg} 0%, ${cuteColors.primary}22 100%);
        border-right: 2px solid ${cuteColors.border};
      }
      body.theme-cute .sidebar-logo {
        border-bottom: 2px dashed ${cuteColors.border};
      }
      body.theme-cute .sidebar-menu li a.active {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .sidebar-menu li a:hover {
        background-color: ${cuteColors.primary}26;
      }
      body.theme-cute .header,
      body.theme-cute .footer {
        background: linear-gradient(90deg, ${cuteColors.bg} 0%, ${cuteColors.primary}15 100%);
        border-color: ${cuteColors.border};
      }
      body.theme-cute .add-btn,
      body.theme-cute .submit-btn {
        background: linear-gradient(135deg, ${cuteColors.primary}, ${cuteColors.primary}cc);
      }
      body.theme-cute .confirm-btn {
        background: linear-gradient(135deg, ${cuteColors.secondary}, ${cuteColors.secondary}cc);
      }
      body.theme-cute .snack-card,
      body.theme-cute .stat-card,
      body.theme-cute .section,
      body.theme-cute .settings-section,
      body.theme-cute .ranking-section,
      body.theme-cute .stats-section,
      body.theme-cute .recommend-section,
      body.theme-cute .tips-section {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .modal-content {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input,
      body.theme-cute .form-group select,
      body.theme-cute .form-group textarea {
        border-color: ${cuteColors.border};
      }
      body.theme-cute .form-group input:focus,
      body.theme-cute .form-group select:focus,
      body.theme-cute .form-group textarea:focus {
        border-color: ${cuteColors.primary};
        box-shadow: 0 0 0 3px ${cuteColors.primary}33;
      }
      body.theme-cute .member-avatar {
        border-color: ${cuteColors.border};
      }
    `;
  },

  setQuotaDisplayMode: (mode) => {
    set({ quotaDisplayMode: mode });
    dataService.settings.update('quota_display_mode', mode);
  },

  setCuteEffect: (key, value) => {
    const newEffects = { ...get().cuteEffects, [key]: value };
    set({ cuteEffects: newEffects });
    dataService.settings.update('cute_effects', JSON.stringify(newEffects));
    get().applyCuteEffects();
  },

  resetCuteEffects: () => {
    set({ cuteEffects: { ...DEFAULT_CUTE_EFFECTS } });
    dataService.settings.update('cute_effects', JSON.stringify(DEFAULT_CUTE_EFFECTS));
    get().applyCuteEffects();
  },

  applyCuteEffects: () => {
    const { theme, cuteEffects } = get();
    if (theme !== 'cute') {
      // 非可爱主题时移除效果
      document.body.classList.remove('effect-bounce', 'effect-gradient', 'effect-sparkle', 'effect-float', 'effect-wiggle', 'effect-breathe', 'effect-fade', 'effect-wave');
      return;
    }
    // 根据开关添加/移除效果类
    const effectMap = {
      bounce: 'effect-bounce',
      gradient: 'effect-gradient',
      sparkle: 'effect-sparkle',
      float: 'effect-float',
      wiggle: 'effect-wiggle',
      breathe: 'effect-breathe',
      fade: 'effect-fade',
      wave: 'effect-wave',
    };
    Object.entries(effectMap).forEach(([key, className]) => {
      if (cuteEffects[key]) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    });
  },

  setAiConfig: (key, value) => {
    const newConfig = { ...get().aiConfig, [key]: value };
    // 加密 API Key
    if (key === 'apiKey') {
      newConfig.apiKey = value;
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(value) }));
    } else {
      dataService.settings.update('ai_config', JSON.stringify({ ...newConfig, apiKey: encrypt(newConfig.apiKey) }));
    }
    set({ aiConfig: newConfig });
  },

  resetAiConfig: () => {
    const defaultConfig = { enabled: true, model: 'qwen', apiKey: '' };
    set({ aiConfig: defaultConfig });
    dataService.settings.update('ai_config', JSON.stringify({ ...defaultConfig, apiKey: encrypt('') }));
  },

  setPriceConfig: (key, value) => {
    const newConfig = { ...get().priceConfig, [key]: value };
    set({ priceConfig: newConfig });
    dataService.settings.update('price_config', JSON.stringify(newConfig));
  },

  resetPriceConfig: () => {
    const defaultConfig = { autoSearch: true };
    set({ priceConfig: defaultConfig });
    dataService.settings.update('price_config', JSON.stringify(defaultConfig));
  },

  setAlertConfig: (key, value) => {
    const newConfig = { ...get().alertConfig, [key]: value };
    set({ alertConfig: newConfig });
    dataService.settings.update('alert_config', JSON.stringify(newConfig));
  },

  resetAlertConfig: () => {
    const defaultConfig = { expiringDays: 7, lowStockThreshold: 3, defaultChartType: 'table', autoUpdateCheck: true };
    set({ alertConfig: defaultConfig });
    dataService.settings.update('alert_config', JSON.stringify(defaultConfig));
  },

  setShortcut: (key, shortcut) => {
    const newShortcuts = { ...get().shortcuts, [key]: shortcut };
    set({ shortcuts: newShortcuts });
    dataService.settings.update('shortcuts', JSON.stringify(newShortcuts));
  },

  resetShortcuts: () => {
    set({ shortcuts: { ...DEFAULT_SHORTCUTS } });
    dataService.settings.update('shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
  },

  backupData: async () => {
    try {
      const data = await dataService.backup.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snack-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('备份失败:', err);
      return false;
    }
  },
}));

export default useSettingsStore;
