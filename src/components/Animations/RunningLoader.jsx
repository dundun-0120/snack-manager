import React from 'react';
import './RunningLoader.css';

/**
 * 奔跑加载动画组件
 * 物品从左侧奔跑到右侧终点线
 * @param {string} item - 显示的物品emoji或字符
 * @param {boolean} isRunning - 是否正在奔跑
 */
function RunningLoader({ item = '🦫', isRunning = true }) {
  if (!isRunning) return null;

  return (
    <div className="running-loader">
      <div className="running-track">
        {/* 起点线 */}
        <div className="start-line">|</div>
        
        {/* 奔跑的物品 */}
        <div className="running-item">{item}</div>
        
        {/* 终点线 */}
        <div className="finish-line">
          <div className="finish-line-post"></div>
          <div className="finish-line-banner">🏁</div>
          <div className="finish-line-post"></div>
        </div>
      </div>
      
      {/* 地面效果 */}
      <div className="ground-effect">
        <span className="dust">💨</span>
        <span className="dust">💨</span>
        <span className="dust">💨</span>
      </div>
      
      <div className="loading-text">正在加载推荐...</div>
    </div>
  );
}

export default RunningLoader;
