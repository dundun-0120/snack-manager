import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/themes/professional.css';
import './styles/themes/cute.css';
import './styles/themes/dark.css';

// 在 React 渲染之前同步设置主题，避免闪烁
(function initTheme() {
  try {
    const settingsRaw = localStorage.getItem('sm_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : [];
    const themeEntry = settings.find(s => s.key === 'theme');
    const theme = themeEntry ? themeEntry.value : 'professional';
    document.body.className = 'theme-' + theme;
    // 如果是可爱主题且有自定义颜色，提前注入避免闪烁
    if (theme === 'cute') {
      const colorsEntry = settings.find(s => s.key === 'cute_colors');
      if (colorsEntry) {
        try {
          const c = JSON.parse(colorsEntry.value);
          const style = document.createElement('style');
          style.id = 'cute-custom-colors';
          style.textContent = `body.theme-cute{--primary-color:${c.primary};--secondary-color:${c.secondary};--border-color:${c.border};--bg-color:${c.bg}}`;
          document.head.appendChild(style);
        } catch { /* ignore */ }
      }
    }
  } catch {
    document.body.className = 'theme-professional';
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
