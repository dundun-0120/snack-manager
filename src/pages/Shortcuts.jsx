import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../stores/settingsStore';
import './Shortcuts.css';

// 格式化快捷键显示
function formatShortcut(shortcut) {
  if (!shortcut) return '未设置';
  const parts = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  
  let key = shortcut.key;
  if (key === 'ArrowUp') key = '↑';
  if (key === 'ArrowDown') key = '↓';
  if (key === 'ArrowLeft') key = '←';
  if (key === 'ArrowRight') key = '→';
  
  parts.push(key);
  return parts.join(' + ');
}

// 快捷键配置项组件
function ShortcutItem({ label, shortcut, onChange }) {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 忽略单独的修饰键
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }
    
    // 忽略 Escape 键（用于取消）
    if (e.key === 'Escape') {
      setIsRecording(false);
      return;
    }
    
    const newShortcut = {
      key: e.key,
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      alt: e.altKey,
      shift: e.shiftKey,
      description: shortcut?.description || '',
    };
    
    onChange(newShortcut);
    setIsRecording(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    window.addEventListener('keydown', handleKeyDown, { once: true });
  };

  return (
    <div className="shortcut-item">
      <span className="shortcut-label">{label}</span>
      <button
        className={`shortcut-key ${isRecording ? 'recording' : ''}`}
        onClick={startRecording}
      >
        {isRecording ? '按快捷键...' : formatShortcut(shortcut)}
      </button>
    </div>
  );
}

function Shortcuts() {
  const navigate = useNavigate();
  const { shortcuts, fetchSettings, setShortcut, resetShortcuts } = useSettingsStore();
  const [localShortcuts, setLocalShortcuts] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setLocalShortcuts(shortcuts);
  }, [shortcuts]);

  const handleShortcutChange = (key, newShortcut) => {
    setLocalShortcuts(prev => ({ ...prev, [key]: newShortcut }));
    setShortcut(key, newShortcut);
  };

  const handleReset = () => {
    if (confirm('确定要恢复默认快捷键设置吗？')) {
      resetShortcuts();
    }
  };

  return (
    <div className="shortcuts-page">
      <div className="shortcuts-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          ← 返回设置
        </button>
        <h1>⌨️ 快捷键设置</h1>
      </div>

      <div className="shortcuts-sections">
        <div className="shortcuts-section">
          <h2>🧭 导航快捷键</h2>
          <div className="shortcuts-list">
            <ShortcutItem
              label="跳转到第一个菜单（首页概览）"
              shortcut={localShortcuts.navFirst}
              onChange={(newShortcut) => handleShortcutChange('navFirst', newShortcut)}
            />
            <ShortcutItem
              label="跳转到最后一个菜单（系统设置）"
              shortcut={localShortcuts.navLast}
              onChange={(newShortcut) => handleShortcutChange('navLast', newShortcut)}
            />
          </div>
          <p className="shortcuts-hint">
            💡 提示：点击快捷键按钮后，按下你想要的组合键即可设置。按 Escape 取消。
          </p>
        </div>

        <div className="shortcuts-section">
          <h2>ℹ️ 默认快捷键说明</h2>
          <div className="shortcuts-info">
            <div className="info-item">
              <span className="info-key">↑ / ↓</span>
              <span className="info-desc">在菜单项之间上下切换</span>
            </div>
            <div className="info-item">
              <span className="info-key">Ctrl/Cmd + ↑</span>
              <span className="info-desc">跳转到第一个菜单（首页概览）</span>
            </div>
            <div className="info-item">
              <span className="info-key">Ctrl/Cmd + ↓</span>
              <span className="info-desc">跳转到最后一个菜单（系统设置）</span>
            </div>
          </div>
        </div>

        <div className="shortcuts-actions">
          <button className="reset-btn" onClick={handleReset}>
            🔄 恢复默认设置
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shortcuts;
