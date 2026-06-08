import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import CuteSettingsModal from '../CuteSettingsModal/CuteSettingsModal';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [showCuteSettings, setShowCuteSettings] = useState(false);

  return (
    <header className="header">
      <div className="header-title">
        家庭零食管理系统
      </div>
      <div className="header-actions">
        <button className="cute-settings-btn" onClick={() => setShowCuteSettings(true)} title="可爱主题设置">
          🎨
        </button>
        <ThemeSwitcher />
        <button className="settings-btn" onClick={() => navigate('/settings')}>
          ⚙️ 设置
        </button>
      </div>
      <CuteSettingsModal isOpen={showCuteSettings} onClose={() => setShowCuteSettings(false)} />
    </header>
  );
}

export default Header;
