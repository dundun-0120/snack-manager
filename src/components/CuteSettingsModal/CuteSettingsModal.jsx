import React, { useState } from 'react';
import useSettingsStore from '../../stores/settingsStore';
import './CuteSettingsModal.css';

const PRESETS = [
  { name: '原始默认', primary: '#FF6B6B', secondary: '#FFE66D', border: '#FFD93D', bg: '#FFF9F0', isOriginal: true },
  { name: '珊瑚粉', primary: '#FF6B6B', secondary: '#FFE66D', border: '#FFD93D', bg: '#FFF9F0' },
  { name: '薄荷绿', primary: '#00B894', secondary: '#81ECEC', border: '#55EFC4', bg: '#F0FFF4' },
  { name: '天空蓝', primary: '#74B9FF', secondary: '#A29BFE', border: '#DFE6E9', bg: '#EBF5FB' },
  { name: '薰衣草', primary: '#A29BFE', secondary: '#FD79A8', border: '#E8DAEF', bg: '#F5EEF8' },
  { name: '蜜桃橙', primary: '#E17055', secondary: '#FAB1A0', border: '#FAD7A0', bg: '#FFF5EE' },
];

const EFFECT_LABELS = {
  bounce: '🎀 菜单弹跳',
  gradient: '🌈 渐变流动',
  sparkle: '✨ 按钮闪烁',
  float: '💫 卡片悬浮',
  wiggle: '🎵 图标摇摆',
  breathe: '🍬 配额呼吸',
  fade: '🎪 页面淡入',
  wave: '🌟 按钮波浪',
};

function CuteSettingsModal({ isOpen, onClose }) {
  const {
    theme, cuteColors, cuteEffects,
    setCuteColor, resetCuteColors, setDefaultCuteColors,
    setCuteEffect, setTheme,
  } = useSettingsStore();

  const [tab, setTab] = useState('colors'); // colors | effects

  if (!isOpen) return null;

  const isCute = theme === 'cute';

  const handleApplyPreset = (preset) => {
    setCuteColor('primary', preset.primary);
    setCuteColor('secondary', preset.secondary);
    setCuteColor('border', preset.border);
    setCuteColor('bg', preset.bg);
  };

  const handleSwitchToCute = () => {
    if (confirm('切换到活泼可爱主题？')) {
      setTheme('cute');
    }
  };

  const handleToggleEffect = (key) => {
    if (!isCute && cuteEffects[key]) {
      // 非可爱主题时关闭效果直接关
      setCuteEffect(key, false);
      return;
    }
    if (!isCute && !cuteEffects[key]) {
      // 非可爱主题时开启效果，提示切换主题
      if (confirm(`开启「${EFFECT_LABELS[key]}」需要切换到活泼可爱主题，是否切换？`)) {
        setTheme('cute');
        setCuteEffect(key, true);
      }
      return;
    }
    setCuteEffect(key, !cuteEffects[key]);
  };

  return (
    <div className="cute-modal-overlay" onClick={onClose}>
      <div className="cute-modal" onClick={e => e.stopPropagation()}>
        <div className="cute-modal-header">
          <h2>🎨 可爱主题设置</h2>
          <button className="cute-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* 主题状态提示 */}
        {!isCute && (
          <div className="cute-modal-notice">
            <span>当前不在活泼可爱主题，配色和灵动效果可能不生效</span>
            <button className="switch-cute-btn" onClick={handleSwitchToCute}>
              🌈 切换到活泼可爱
            </button>
          </div>
        )}

        {/* 标签切换 */}
        <div className="cute-modal-tabs">
          <button className={`cute-tab ${tab === 'colors' ? 'active' : ''}`} onClick={() => setTab('colors')}>
            🎨 配色
          </button>
          <button className={`cute-tab ${tab === 'effects' ? 'active' : ''}`} onClick={() => setTab('effects')}>
            ✨ 灵动效果
          </button>
        </div>

        {/* 配色面板 */}
        {tab === 'colors' && (
          <div className="cute-modal-body">
            <div className="color-picker-grid">
              {[
                { key: 'primary', label: '主色调' },
                { key: 'secondary', label: '强调色' },
                { key: 'border', label: '边框色' },
                { key: 'bg', label: '背景色' },
              ].map(({ key, label }) => (
                <div key={key} className="color-picker-item">
                  <label>{label}</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={cuteColors[key] || '#FF6B6B'}
                      onChange={(e) => setCuteColor(key, e.target.value)}
                    />
                    <span className="color-hex">{cuteColors[key] || '#FF6B6B'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="color-presets">
              <span className="presets-label">快速预设：</span>
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  className={`preset-btn ${preset.isOriginal ? 'original-preset' : ''}`}
                  title={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <span className="preset-dot" style={{ background: preset.primary }} />
                  <span className="preset-dot" style={{ background: preset.secondary }} />
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="color-actions">
              <button className="action-btn reset-colors-btn" onClick={resetCuteColors}>
                🔄 恢复默认
              </button>
              <button className="action-btn primary set-default-btn" onClick={setDefaultCuteColors}>
                ⭐ 设为默认
              </button>
            </div>
          </div>
        )}

        {/* 灵动效果面板 */}
        {tab === 'effects' && (
          <div className="cute-modal-body">
            <div className="effects-grid">
              {Object.entries(EFFECT_LABELS).map(([key, label]) => (
                <div key={key} className="effect-item">
                  <span className="effect-label">{label}</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={!!cuteEffects[key]}
                      onChange={() => handleToggleEffect(key)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CuteSettingsModal;
