import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../stores/settingsStore';
import dataService from '../services/dataService';
import { getAvailableModels } from '../services/aiService';
import packageJson from '../../package.json';
import './Settings.css';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

function ApiKeyInput() {
  const { aiConfig, setAiConfig } = useSettingsStore();
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const hasKey = !!aiConfig?.apiKey;

  const handleFocus = () => {
    setIsEditing(true);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (inputRef.current) {
      const val = inputRef.current.value.trim();
      if (val) {
        setAiConfig('apiKey', val);
      }
      inputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="api-key-wrap">
      <input
        ref={inputRef}
        type="password"
        defaultValue=""
        placeholder={hasKey ? '••••••••••••••••' : '输入API密钥（可选）'}
        className="api-key-input"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <span className="api-key-encrypted">🔒 已加密存储</span>
      {hasKey && (
        <button
          className="api-key-clear"
          onClick={() => {
            if (confirm('确定清除已保存的 API Key？')) {
              setAiConfig('apiKey', '');
            }
          }}
          title="清除 API Key"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

function Settings() {
  const navigate = useNavigate();
  const { settings, theme, autoUpdate, cuteColors, quotaDisplayMode, cuteEffects, aiConfig, priceConfig, alertConfig, fetchSettings, setTheme, setAutoUpdate, setCuteColor, resetCuteColors, setDefaultCuteColors, setQuotaDisplayMode, setCuteEffect, resetCuteEffects, setAiConfig, resetAiConfig, setPriceConfig, resetPriceConfig, setAlertConfig, resetAlertConfig, backupData } = useSettingsStore();
  const [updateState, setUpdateState] = useState({
    status: 'idle',
    message: '',
    latestVersion: null,
    progress: 0,
    releaseNotes: '',
  });
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCheckUpdate = async () => {
    setUpdateState({ status: 'checking', message: '正在检查更新...', progress: 0 });
    try {
      if (isElectron && window.electronAPI?.checkUpdate) {
        const result = await window.electronAPI.checkUpdate();
        if (result.error) throw new Error(result.error);

        const currentVersion = result.currentVersion;
        const latestVersion = result.latestVersion;

        if (result.versionHistory) {
          setVersionHistory(result.versionHistory);
        }

        const latestParts = latestVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        let isNewer = false;
        for (let i = 0; i < 3; i++) {
          if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
            isNewer = true;
            break;
          }
        }

        if (isNewer) {
          setUpdateState({
            status: 'available',
            message: `发现新版本 v${latestVersion}！`,
            latestVersion,
            progress: 0,
            releaseNotes: result.releaseNotes || '暂无更新说明',
            downloadUrl: result.downloadUrl || '',
          });
        } else {
          setUpdateState({
            status: 'latest',
            message: `已是最新版本 v${currentVersion}`,
            latestVersion: null,
            progress: 100,
            releaseNotes: '',
          });
        }
        return;
      }

      setUpdateState({
        status: 'latest',
        message: `已是最新版本 v${packageJson.version}`,
        latestVersion: null,
        progress: 100,
        releaseNotes: '',
      });
    } catch (err) {
      setUpdateState({
        status: 'error',
        message: '检查更新失败：' + (err.message || '请检查网络连接'),
        latestVersion: null,
        progress: 0,
        releaseNotes: '',
      });
    }
  };

  const handleDownloadUpdate = () => {
    setUpdateState(prev => ({ ...prev, status: 'downloading', message: '正在下载更新...', progress: 0 }));
    if (isElectron && updateState.downloadUrl) {
      window.electronAPI.openExternal(updateState.downloadUrl);
      setUpdateState(prev => ({
        ...prev,
        status: 'latest',
        message: '已打开下载页面，请下载新版安装包覆盖安装。',
        progress: 100,
      }));
      return;
    }
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUpdateState(prev => ({
          ...prev,
          status: 'installing',
          message: '下载完成！正在安装更新...',
          progress: 100,
        }));
        setTimeout(() => {
          setUpdateState({
            status: 'latest',
            message: `更新完成！已升级到 v${updateState.latestVersion}，请刷新页面生效。`,
            latestVersion: null,
            progress: 100,
            releaseNotes: '',
          });
        }, 2000);
      } else {
        setUpdateState(prev => ({ ...prev, progress: Math.round(progress) }));
      }
    }, 300);
  };

  const handleSkipUpdate = () => {
    setUpdateState({ status: 'idle', message: '', latestVersion: null, progress: 0, releaseNotes: '' });
  };

  const handleOpenVersionHistory = () => {
    if (isElectron && window.electronAPI?.openVersionHistory) {
      window.electronAPI.openVersionHistory();
    } else {
      window.open('https://github.com/dundun-0120/snack-manager/releases', '_blank');
    }
  };

  const handleRollback = async (version) => {
    if (!confirm(`确定要回退到 v${version} 版本吗？\n\n这将打开该版本的下载页面，你需要手动下载并覆盖安装。`)) return;
    if (isElectron && window.electronAPI?.rollbackVersion) {
      const result = await window.electronAPI.rollbackVersion(version);
      if (result.success) {
        alert(result.message);
      }
    } else {
      window.open(`https://github.com/dundun-0120/snack-manager/releases/tag/v${version}`, '_blank');
    }
  };

  const handleBackup = async () => {
    const success = await backupData();
    if (success) {
      alert('备份成功！文件已下载。');
    } else {
      alert('备份失败，请重试。');
    }
  };

  const handleShare = async () => {
    const url = dataService.share.generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      alert('分享链接已复制到剪贴板！\n\n将链接发送给家人，他们在浏览器中打开即可同步数据。');
    } catch {
      prompt('请复制以下分享链接：', url);
    }
  };

  return (
    <div className="settings-page">
      <h1>⚙️ 系统设置</h1>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>🎨 外观设置</h2>
          <div className="setting-item">
            <label>主题</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="professional">简洁专业</option>
              <option value="cute">活泼可爱</option>
              <option value="dark">深色模式</option>
            </select>
          </div>
        </div>

        {theme === 'cute' && (
          <div className="settings-section">
            <h2>🌈 可爱主题配色</h2>
            <div className="cute-color-settings">
              <div className="color-picker-grid">
                <div className="color-picker-item">
                  <label>主色调</label>
                  <div className="color-input-wrap">
                    <input type="color" value={cuteColors.primary} onChange={(e) => setCuteColor('primary', e.target.value)} />
                    <span className="color-hex">{cuteColors.primary}</span>
                  </div>
                </div>
                <div className="color-picker-item">
                  <label>强调色</label>
                  <div className="color-input-wrap">
                    <input type="color" value={cuteColors.secondary} onChange={(e) => setCuteColor('secondary', e.target.value)} />
                    <span className="color-hex">{cuteColors.secondary}</span>
                  </div>
                </div>
                <div className="color-picker-item">
                  <label>边框色</label>
                  <div className="color-input-wrap">
                    <input type="color" value={cuteColors.border} onChange={(e) => setCuteColor('border', e.target.value)} />
                    <span className="color-hex">{cuteColors.border}</span>
                  </div>
                </div>
                <div className="color-picker-item">
                  <label>背景色</label>
                  <div className="color-input-wrap">
                    <input type="color" value={cuteColors.bg} onChange={(e) => setCuteColor('bg', e.target.value)} />
                    <span className="color-hex">{cuteColors.bg}</span>
                  </div>
                </div>
              </div>
              <div className="color-presets">
                <span className="presets-label">快速预设：</span>
                {[
                  { name: '原始默认', primary: '#FF6B6B', secondary: '#FFE66D', border: '#FFD93D', bg: '#FFF9F0', isOriginal: true },
                  { name: '珊瑚粉', primary: '#FF6B6B', secondary: '#FFE66D', border: '#FFD93D', bg: '#FFF9F0' },
                  { name: '薄荷绿', primary: '#00B894', secondary: '#81ECEC', border: '#55EFC4', bg: '#F0FFF4' },
                  { name: '天空蓝', primary: '#74B9FF', secondary: '#A29BFE', border: '#DFE6E9', bg: '#EBF5FB' },
                  { name: '薰衣草', primary: '#A29BFE', secondary: '#FD79A8', border: '#E8DAEF', bg: '#F5EEF8' },
                  { name: '蜜桃橙', primary: '#E17055', secondary: '#FAB1A0', border: '#FAD7A0', bg: '#FFF5EE' },
                ].map(preset => (
                  <button key={preset.name} className={`preset-btn ${preset.isOriginal ? 'original-preset' : ''}`} title={preset.name}
                    onClick={() => { setCuteColor('primary', preset.primary); setCuteColor('secondary', preset.secondary); setCuteColor('border', preset.border); setCuteColor('bg', preset.bg); }}>
                    <span className="preset-dot" style={{ background: preset.primary }} />
                    <span className="preset-dot" style={{ background: preset.secondary }} />
                    <span className="preset-name">{preset.name}</span>
                  </button>
                ))}
              </div>
              <div className="color-actions">
                <button className="action-btn reset-colors-btn" onClick={resetCuteColors}>🔄 恢复默认配色</button>
                <button className="action-btn primary set-default-btn" onClick={setDefaultCuteColors}>⭐ 设为默认配色</button>
              </div>
            </div>
          </div>
        )}

        {theme === 'cute' && (
          <div className="settings-section">
            <h2>✨ 灵动效果</h2>
            <div className="effects-grid">
              {[
                { key: 'bounce', icon: '🎀', label: '菜单弹跳', desc: '菜单项悬停时微微弹跳' },
                { key: 'gradient', icon: '🌈', label: '渐变流动', desc: '侧边栏背景渐变缓慢流动' },
                { key: 'sparkle', icon: '✨', label: '按钮闪烁', desc: '按钮悬停时星光闪烁' },
                { key: 'float', icon: '💫', label: '卡片悬浮', desc: '卡片悬停时轻微上浮' },
                { key: 'wiggle', icon: '🎵', label: '图标摇摆', desc: '侧边栏图标轻微摇摆' },
                { key: 'breathe', icon: '🍬', label: '配额呼吸', desc: '配额进度条呼吸效果' },
                { key: 'fade', icon: '🎪', label: '页面淡入', desc: '页面内容淡入上浮' },
                { key: 'wave', icon: '🌟', label: '按钮波浪', desc: '底部按钮波浪效果' },
              ].map(effect => (
                <div key={effect.key} className="effect-item">
                  <div className="effect-info">
                    <span className="effect-icon">{effect.icon}</span>
                    <div>
                      <span className="effect-label">{effect.label}</span>
                      <span className="effect-desc">{effect.desc}</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={cuteEffects?.[effect.key] ?? true} onChange={(e) => setCuteEffect(effect.key, e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
            <div className="effect-actions">
              <button className="action-btn" onClick={resetCuteEffects}>🔄 恢复默认效果</button>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h2>⚙️ 功能设置</h2>
          <div className="setting-item">
            <label>成员配额显示方式</label>
            <select value={quotaDisplayMode} onChange={(e) => setQuotaDisplayMode(e.target.value)}>
              <option value="remaining">剩余 / 总配额</option>
              <option value="used">已用 / 总配额</option>
            </select>
          </div>
          <div className="setting-item">
            <label>自动更新推荐</label>
            <select value={autoUpdate ? 'true' : 'false'} onChange={(e) => setAutoUpdate(e.target.value === 'true')}>
              <option value="true">开启</option>
              <option value="false">关闭</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>🔔 预警阈值设置</h2>
          <div className="setting-item">
            <label>临期预警天数</label>
            <input type="number" min="1" max="90" value={alertConfig?.expiringDays ?? 7} onChange={(e) => setAlertConfig('expiringDays', parseInt(e.target.value) || 7)} className="threshold-input" />
            <span className="setting-hint">天内过期的零食会显示预警</span>
          </div>
          <div className="setting-item">
            <label>库存预警阈值</label>
            <input type="number" min="1" max="100" value={alertConfig?.lowStockThreshold ?? 3} onChange={(e) => setAlertConfig('lowStockThreshold', parseInt(e.target.value) || 3)} className="threshold-input" />
            <span className="setting-hint">库存低于此数量会显示预警</span>
          </div>
          <div className="effect-actions">
            <button className="action-btn" onClick={resetAlertConfig}>🔄 恢复默认</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>📊 图表显示偏好</h2>
          <div className="setting-item">
            <label>零食排名默认图表</label>
            <select value={alertConfig?.defaultChartType ?? 'table'} onChange={(e) => setAlertConfig('defaultChartType', e.target.value)}>
              <option value="table">表格</option>
              <option value="bar">柱式图</option>
              <option value="funnel">锥形图</option>
              <option value="donut">圆圈图</option>
            </select>
          </div>
          <p className="setting-desc">在零食排名页面切换图表类型：表格、柱式图、锥形图、圆圈图</p>
        </div>

        <div className="settings-section">
          <h2>🔄 自动更新</h2>
          <div className="update-info">
            <div className="current-version">当前版本：<strong>v{packageJson.version}</strong></div>
          </div>
          <div className="setting-item">
            <label>自动检测更新</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={alertConfig?.autoUpdateCheck ?? true} onChange={(e) => setAlertConfig('autoUpdateCheck', e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="update-actions">
            {updateState.status === 'idle' && (
              <button className="action-btn check-update-btn" onClick={handleCheckUpdate}>🔍 检查更新</button>
            )}
            {updateState.status === 'checking' && (
              <button className="action-btn check-update-btn" disabled>⏳ 检查中...</button>
            )}
            {updateState.status === 'available' && (
              <div className="update-available-actions">
                <button className="action-btn primary download-btn" onClick={handleDownloadUpdate}>⬇️ 立即更新 v{updateState.latestVersion}</button>
                <button className="action-btn" onClick={handleSkipUpdate}>忽略本次</button>
              </div>
            )}
            {(updateState.status === 'downloading' || updateState.status === 'installing') && (
              <div className="update-progress-wrap">
                <div className="update-progress-bar">
                  <div className="update-progress-fill" style={{ width: `${updateState.progress}%` }} />
                </div>
                <span className="update-progress-text">{updateState.progress}%</span>
              </div>
            )}
            {updateState.status === 'latest' && (
              <button className="action-btn check-update-btn" onClick={handleCheckUpdate}>✅ 重新检查</button>
            )}
            {updateState.status === 'error' && (
              <button className="action-btn check-update-btn" onClick={handleCheckUpdate}>🔄 重试</button>
            )}
          </div>
          {updateState.status !== 'idle' && (
            <div className={`update-status ${updateState.status}`}>
              {updateState.message}
              {updateState.status === 'available' && updateState.releaseNotes && (
                <div className="update-release-notes"><strong>更新说明：</strong>{updateState.releaseNotes}</div>
              )}
            </div>
          )}
          <div className="version-history-entry">
            <button className="version-history-btn" onClick={() => setShowVersionHistory(true)}>📚 版本库（回退到旧版本）</button>
          </div>
        </div>

        {showVersionHistory && (
          <div className="version-history-modal" onClick={() => setShowVersionHistory(false)}>
            <div className="version-history-content" onClick={e => e.stopPropagation()}>
              <div className="version-history-header">
                <h3>📚 版本库</h3>
                <button className="close-btn" onClick={() => setShowVersionHistory(false)}>✕</button>
              </div>
              <p className="version-history-desc">点击版本号可回退到该版本（将打开下载页面）</p>
              <div className="version-history-list">
                {versionHistory.length === 0 && <p className="version-history-empty">暂无版本历史记录</p>}
                {versionHistory.map((v, idx) => (
                  <div key={v.version} className={`version-item ${v.version === packageJson.version ? 'current' : ''}`}>
                    <div className="version-info">
                      <span className="version-tag">v{v.version}</span>
                      {v.version === packageJson.version && <span className="current-badge">当前</span>}
                      {idx === 0 && v.version !== packageJson.version && <span className="latest-badge">最新</span>}
                      <span className="version-date\">{v.date}</span>
                    </div>
                    <p className="version-notes">{v.notes}</p>
                    {v.version !== packageJson.version && (
                      <button className="rollback-btn" onClick={() => handleRollback(v.version)}>⬇️ 回退到此版本</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="version-history-footer">
                <button className="action-btn" onClick={handleOpenVersionHistory}>🔗 在 GitHub 上查看全部版本</button>
              </div>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h2>🤖 AI 智能识别</h2>
          <div className="setting-item">
            <label>启用AI识图</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={aiConfig?.enabled ?? true} onChange={(e) => setAiConfig('enabled', e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>选择AI模型</label>
            <select value={aiConfig?.model || 'qwen'} onChange={(e) => setAiConfig('model', e.target.value)}>
              {Object.entries(getAvailableModels()).map(([key, model]) => (
                <option key={key} value={key}>{model.icon} {model.name}</option>
              ))}
            </select>
          </div>
          <div className="setting-item">
            <label>API Key</label>
            <ApiKeyInput />
          </div>
          <div className="effect-actions">
            <button className="action-btn" onClick={resetAiConfig}>🔄 恢复默认</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>💰 价格自动获取</h2>
          <div className="setting-item">
            <label>自动联网搜索价格</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={priceConfig?.autoSearch ?? true} onChange={(e) => setPriceConfig('autoSearch', e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-desc">开启后，添加零食时会自动搜索淘宝、京东等平台的平均价格并填入</div>
          <div className="effect-actions">
            <button className="action-btn" onClick={resetPriceConfig}>🔄 恢复默认</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>💾 数据管理</h2>
          <div className="setting-item">
            <label>数据备份</label>
            <button className="action-btn" onClick={handleBackup}>立即备份</button>
          </div>
          <div className="setting-item">
            <label>跨浏览器同步</label>
            <button className="action-btn" onClick={handleShare}>🔗 生成分享链接</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>⌨️ 快捷键设置</h2>
          <div className="setting-item">
            <label>所有快捷键</label>
            <button className="action-btn" onClick={() => navigate('/shortcuts')}>配置快捷键</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>📱 关于</h2>
          <div className="about-info">
            <p><strong>家庭零食管理系统</strong></p>
            <p>版本: v{packageJson.version}</p>
            <p>运行环境: {isElectron ? '桌面应用 (Electron)' : '浏览器'}</p>
            <p>一个帮助家庭管理零食分配和领取的应用</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
