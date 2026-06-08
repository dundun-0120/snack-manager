import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSnackStore from '../../stores/snackStore';
import useClaimStore from '../../stores/claimStore';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();
  const { snacks } = useSnackStore();
  const { queue, fetchQueue } = useClaimStore();

  // 获取待处理申请数量
  useEffect(() => {
    fetchQueue();
  }, []);

  // 计算统计数据
  const pendingCount = queue.length;
  
  // 库存预警：总库存 <= 3
  const lowStockCount = snacks.filter(s => s.stock <= 3).length;
  
  // 临期零食：有批次在7天内过期，或没有批次时 expiry_days <= 7
  const expiringCount = snacks.filter(s => {
    if (s.expiry_batches && s.expiry_batches.length > 0) {
      return s.expiry_batches.some(batch => batch.expiry_days > 0 && batch.expiry_days <= 7);
    }
    return s.expiry_days > 0 && s.expiry_days <= 7;
  }).length;
  
  // 已过期：有批次已过期（expiry_days <= 0）
  const expiredCount = snacks.filter(s => {
    if (s.expiry_batches && s.expiry_batches.length > 0) {
      return s.expiry_batches.some(batch => batch.expiry_days <= 0);
    }
    return s.expiry_days <= 0;
  }).length;
  
  // 点击处理
  const handlePendingClick = () => {
    navigate('/claims#pending');
  };
  
  const handleLowStockClick = () => {
    navigate('/snacks?filter=lowstock');
  };
  
  const handleExpiringClick = () => {
    navigate('/snacks?filter=expiring');
  };
  
  const handleExpiredClick = () => {
    navigate('/snacks?filter=expired');
  };
  
  return (
    <footer className="app-footer">
      <div className="footer-stats">
        <button className="stat-item clickable" onClick={handlePendingClick}>
          <span className="stat-label">待处理</span>
          <span className="stat-value">{pendingCount}</span>
        </button>
        <button className="stat-item clickable" onClick={handleLowStockClick}>
          <span className="stat-label">库存预警</span>
          <span className="stat-value">{lowStockCount}</span>
        </button>
        <button className="stat-item clickable" onClick={handleExpiringClick}>
          <span className="stat-label">临期零食</span>
          <span className="stat-value">{expiringCount}</span>
        </button>
        <button className="stat-item clickable expired-stat" onClick={handleExpiredClick}>
          <span className="stat-label">已过期</span>
          <span className="stat-value">{expiredCount}</span>
        </button>
      </div>
    </footer>
  );
}

export default Footer;
