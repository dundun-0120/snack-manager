import React, { useEffect } from 'react';
import useSnackStore from '../stores/snackStore';
import useClaimStore from '../stores/claimStore';
import useMemberStore from '../stores/memberStore';
import './Home.css';

function Home() {
  const { snacks, fetchSnacks } = useSnackStore();
  const { records, fetchRecords } = useClaimStore();
  const { members, fetchMembers } = useMemberStore();

  useEffect(() => {
    fetchSnacks();
    fetchRecords();
    fetchMembers();
  }, []);

  // 获取临期批次预警（只显示快要过期的批次）
  const getExpiringBatches = () => {
    const expiringBatches = [];
    snacks.forEach(snack => {
      if (snack.expiry_batches && snack.expiry_batches.length > 0) {
        snack.expiry_batches.forEach((batch, idx) => {
          if (batch.expiry_days > 0 && batch.expiry_days <= 7) {
            expiringBatches.push({
              snackName: snack.name,
              snackId: snack.id,
              batchIndex: idx,
              stock: batch.stock,
              expiry_days: batch.expiry_days,
            });
          }
        });
      } else if (snack.expiry_days > 0 && snack.expiry_days <= 7) {
        expiringBatches.push({
          snackName: snack.name,
          snackId: snack.id,
          batchIndex: -1,
          stock: snack.stock,
          expiry_days: snack.expiry_days,
        });
      }
    });
    return expiringBatches;
  };

  const expiringBatches = getExpiringBatches();
  const lowStockSnacks = snacks.filter(s => s.stock < 5);
  const recentRecords = records.slice(0, 5);

  return (
    <div className="home-page">
      <h1>🏠 首页概览</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{snacks.length}</div>
            <div className="stat-label">零食总数</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{members.length}</div>
            <div className="stat-label">家庭成员</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{records.length}</div>
            <div className="stat-label">领取记录</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{expiringBatches.length}</div>
            <div className="stat-label">临期批次</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>🔴 临期批次提醒</h2>
          {expiringBatches.length === 0 ? (
            <p className="empty-message">暂无临期批次</p>
          ) : (
            <div className="expiring-batches-grid">
              {expiringBatches.map((batch, idx) => (
                <div key={`${batch.snackId}-${batch.batchIndex}`} className="expiring-batch-card">
                  <div className="batch-card-header">
                    <span className="batch-snack-name">{batch.snackName}</span>
                    <span className="batch-label">批次 #{batch.batchIndex + 1}</span>
                  </div>
                  <div className="batch-card-body">
                    <div className="batch-info">
                      <span className="batch-stock-large">{batch.stock}份</span>
                      <span className={`expiry-status ${batch.expiry_days <= 3 ? 'critical' : 'warning'}`}>
                        {batch.expiry_days <= 0 ? '已过期' : `还有 ${batch.expiry_days} 天`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h2>⚠️ 库存预警</h2>
          {lowStockSnacks.length === 0 ? (
            <p className="empty-message">库存充足</p>
          ) : (
            <ul className="alert-list">
              {lowStockSnacks.map(snack => (
                <li key={snack.id} className="alert-item">
                  <span className="snack-name">{snack.name}</span>
                  <span className="stock-tag">仅剩 {snack.stock} 份</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="section">
          <h2>📋 最近领取</h2>
          {recentRecords.length === 0 ? (
            <p className="empty-message">暂无领取记录</p>
          ) : (
            <ul className="record-list">
              {recentRecords.map(record => (
                <li key={record.id} className="record-item">
                  <span className="member-name">{record.member_name}</span>
                  <span className="snack-name">{record.snack_name}</span>
                  <span className="record-time">{new Date(record.taken_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
