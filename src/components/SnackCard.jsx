import React, { useState } from 'react';
import './SnackCard.css';

function SnackCard({ snack, onEdit, onDelete, onRestock, onAddBatch, onDeleteBatch, onPriorityBatch, showExpiringBatchOnly = false, showExpiredBatchOnly = false }) {
  const expiryStatus = getExpiryStatus(snack.expiry_days);
  const [showBatches, setShowBatches] = useState(false);
  const batches = snack.expiry_batches || [];

  // 获取最紧急的批次（用于临期筛选模式）
  const getMostUrgentBatch = () => {
    if (!batches.length) return null;
    return batches.reduce((min, batch) => 
      batch.expiry_days < min.expiry_days ? batch : min
    );
  };

  // 获取已过期的批次（用于已过期筛选模式）
  const getExpiredBatches = () => {
    if (!batches.length) return [];
    return batches.filter(batch => batch.expiry_days <= 0);
  };

  const urgentBatch = showExpiringBatchOnly ? getMostUrgentBatch() : null;
  const urgentStatus = urgentBatch ? getExpiryStatus(urgentBatch.expiry_days) : null;
  const expiredBatches = showExpiredBatchOnly ? getExpiredBatches() : [];

  return (
    <div className={`snack-card ${expiryStatus.className}`}>
      <div className="snack-photo">
        {snack.photo_path ? (
          <img src={snack.photo_path} alt={snack.name} />
        ) : (
          <div className="no-photo">📦</div>
        )}
      </div>
      <div className="snack-info">
        <h3>{snack.name}</h3>
        <div className="snack-meta">
          <span className="health-score">健康: {snack.health_score}/10</span>
          <span className="price">¥{snack.price}</span>
          <span className="size">{snack.size_level}</span>
        </div>
        <div className="snack-stock">
          库存: {snack.stock} 份
          {expiryStatus.label && (
            <span className={`expiry-badge ${expiryStatus.level}`}>
              {expiryStatus.label}
            </span>
          )}
        </div>

        {/* 临期筛选模式：显示最紧急的批次 */}
        {showExpiringBatchOnly && urgentBatch && (
          <div className={`urgent-batch-info ${urgentStatus?.className}`}>
            <span className="urgent-batch-stock">{urgentBatch.stock}份</span>
            <span className={`urgent-batch-expiry ${urgentStatus?.level}`}>
              {urgentStatus?.label}
            </span>
          </div>
        )}

        {/* 已过期筛选模式：显示已过期的批次 */}
        {showExpiredBatchOnly && expiredBatches.length > 0 && (
          <div className="expired-batches-section">
            <div className="expired-batches-title">🗑️ 已过期批次</div>
            {expiredBatches.map((batch, idx) => (
              <div key={idx} className="expired-batch-item">
                <span className="expired-batch-stock">{batch.stock}份</span>
                <span className="expired-batch-days">
                  已过期 {Math.abs(batch.expiry_days)} 天
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 多批次保质期显示 */}
        {batches.length > 0 && (
          <div className="expiry-batches">
            <div
              className="batches-toggle"
              onClick={() => setShowBatches(!showBatches)}
            >
              📦 保质期批次 ({batches.length})
              <span className={`toggle-arrow ${showBatches ? 'open' : ''}`}>▼</span>
            </div>
            {showBatches && (
              <div className="batches-list">
                {batches.map((batch, idx) => {
                  const status = getExpiryStatus(batch.expiry_days);
                  return (
                    <div key={idx} className={`batch-item ${status.className}`}>
                      <span className="batch-stock">{batch.stock}份</span>
                      <span className={`batch-expiry ${status.level}`}>
                        {status.label || `剩余${batch.expiry_days}天`}
                      </span>
                      {/* 临期/过期图标 */}
                      {(status.level === 'expired' || status.level === 'critical' || status.level === 'warning') && (
                        <span className="batch-alert-icon">
                          {status.level === 'expired' ? '🗑️' : '⚠️'}
                        </span>
                      )}
                      {/* 批次操作按钮 */}
                      <div className="batch-actions">
                        {onPriorityBatch && (
                          <button
                            className="batch-action-btn priority-btn"
                            title="设为优先消耗"
                            onClick={() => onPriorityBatch(snack, idx)}
                          >
                            ⭐
                          </button>
                        )}
                        {onDeleteBatch && (
                          <button
                            className="batch-action-btn delete-batch-btn"
                            title="删除此批次"
                            onClick={() => onDeleteBatch(snack, idx)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 添加保质期批次按钮 */}
        <button
          className="add-batch-btn"
          onClick={() => onAddBatch && onAddBatch(snack)}
          title="添加新的保质期批次"
        >
          + 添加批次
        </button>
      </div>
      <div className="snack-actions">
        <button onClick={() => onEdit(snack)}>编辑</button>
        <button onClick={() => onDelete(snack.id)}>删除</button>
        {/* 进货按钮 - 库存预警时显示 */}
        {(expiryStatus.level === 'expired' || expiryStatus.level === 'critical' || snack.stock <= 3) && (
          <button className="purchase-btn" onClick={() => onRestock(snack)}>
            🛒 进货
          </button>
        )}
      </div>
    </div>
  );
}

function getExpiryStatus(days) {
  if (days == null || days === undefined) return { level: 'normal', className: '', label: null };
  if (days <= 0) return { level: 'expired', className: 'expired', label: `已过期 ${Math.abs(days)} 天` };
  if (days <= 3) return { level: 'critical', className: 'critical', label: `还有 ${days} 天` };
  if (days <= 7) return { level: 'warning', className: 'warning', label: `还有 ${days} 天` };
  return { level: 'normal', className: '', label: null };
}

export default SnackCard;
