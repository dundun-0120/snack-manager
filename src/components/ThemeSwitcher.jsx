import React from 'react';
import useSettingsStore from '../stores/settingsStore';
import './ThemeSwitcher.css';

const themes = [
  { id: 'professional', name: '简洁专业', icon: '🎨' },
  { id: 'cute', name: '活泼可爱', icon: '🌈' },
  { id: 'dark', name: '深色模式', icon: '🌙' },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useSettingsStore();
  
  const handleChange = (e) => {
    setTheme(e.target.value);
    document.body.className = 'theme-' + e.target.value;
  };
  
  return (
    <div className="theme-switcher">
      <select value={theme} onChange={handleChange}>
        {themes.map(t => (
          <option key={t.id} value={t.id}>
            {t.icon} {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ThemeSwitcher;
