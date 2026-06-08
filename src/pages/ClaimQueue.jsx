import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useClaimStore from '../stores/claimStore';
import useSnackStore from '../stores/snackStore';
import useMemberStore from '../stores/memberStore';
import useSettingsStore from '../stores/settingsStore';
import dataService from '../services/dataService';
import './ClaimQueue.css';

function ClaimQueue() {
  const location = useLocation();
  const queueRef = useRef(null);
  const cartButtonRef = useRef(null);
  const { queue, records, fetchQueue, fetchRecords, confirmClaim, cancelClaim } = useClaimStore();
  const { snacks, fetchSnacks } = useSnackStore();
  const { members, fetchMembers } = useMemberStore();
  const { theme } = useSettingsStore();

  const [cart, setCart] = useState([]); // [{ snackId, name, quantity, sizeLevel, maxStock }]
  const [showCart, setShowCart] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [quotaError, setQuotaError] = useState('');

  useEffect(() => {
    fetchQueue();
    fetchRecords();
    fetchSnacks();
    fetchMembers();
    setCategories(dataService.categories.getAll());
  }, []);

  // 处理 hash 锚点滚动
  useEffect(() => {
    if (location.hash === '#pending' && queueRef.current) {
      setTimeout(() => {
        queueRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash, queue]);

  // 加入购物车
  const addToCart = (snack, event) => {
    if (snack.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.snackId === snack.id);
      if (existing) {
        if (existing.quantity >= snack.stock) return prev;
        return prev.map(item =>
          item.snackId === snack.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        snackId: snack.id,
        name: snack.name,
        quantity: 1,
        sizeLevel: snack.size_level,
        maxStock: snack.stock,
        price: snack.price,
      }];
    });
  };

  // 修改购物车数量
  const updateCartQuantity = (snackId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.snackId !== snackId) return item;
      const newQty = Math.max(1, Math.min(item.maxStock, item.quantity + delta));
      return { ...item, quantity: newQty };
    }));
  };

  // 从购物车移除
  const removeFromCart = (snackId) => {
    setCart(prev => prev.filter(item => item.snackId !== snackId));
  };

  // 计算总配额消耗
  const totalQuotaCost = cart.reduce((sum, item) => {
    return sum + dataService.calculateQuotaCost(item.sizeLevel, item.quantity);
  }, 0);

  // 购物车总数量
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 提交订购
  const handleSubmitOrder = async () => {
    setQuotaError('');
    if (!selectedMember) {
      alert('请选择领取成员');
      return;
    }
    if (cart.length === 0) {
      alert('购物车为空');
      return;
    }

    // 检查配额是否足够
    const quotaStatus = dataService.quota.getStatus(parseInt(selectedMember));
    if (quotaStatus) {
      const dayStatus = quotaStatus.periodStatus?.day;
      const dailyRemaining = dayStatus ? dayStatus.remaining : quotaStatus.dailyQuota;
      const dailyUsed = dayStatus ? dayStatus.used : 0;
      if (totalQuotaCost > dailyRemaining) {
        setQuotaError(`配额不足！今日已使用 ${dailyUsed}，剩余 ${dailyRemaining}，本次需要 ${totalQuotaCost}`);
        return;
      }
    }

    for (const item of cart) {
      await useClaimStore.getState().addClaim({
        member_id: parseInt(selectedMember),
        snack_id: item.snackId,
        quantity: item.quantity,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    setCart([]);
    setSelectedMember('');
    setShowCart(false);
    fetchQueue();
    fetchSnacks(); // 刷新库存
    fetchRecords(); // 刷新记录
  };

  // 快速确认所有待处理申请
  const handleConfirmAll = async () => {
    for (const item of queue) {
      await confirmClaim(item.id);
    }
  };

  const filteredSnacks = snacks.filter(snack => {
    const matchSearch = snack.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || snack.category_id === parseInt(filterCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="claim-queue-page">
      <div className="page-header">
        <h1>📋 零食订购</h1>
        <div className="cart-toggle">
          <button ref={cartButtonRef} className={`cart-btn ${showCart ? 'active' : ''}`} onClick={() => setShowCart(!showCart)}>
            🛒 购物车{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="order-layout">
        {/* 零食选择区 */}
        <div className="snack-select-area">
          <div className="order-controls">
            <input
              type="text"
              placeholder="搜索零食..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="snack-grid">
            {filteredSnacks.map(snack => (
              <div key={snack.id} className={`order-snack-card ${snack.stock <= 0 ? 'sold-out' : ''}`}>
                <div className="order-snack-info">
                  <h3>{snack.name}</h3>
                  <div className="order-snack-meta">
                    <span className="order-price">¥{snack.price}</span>
                    <span className={`order-stock ${snack.stock <= 0 ? 'out' : snack.stock < 5 ? 'low' : ''}`}>
                      库存: {snack.stock}
                    </span>
                    <span className="order-size">{snack.size_level}</span>
                  </div>
                </div>
                <div className="order-snack-action">
                  {snack.stock <= 0 ? (
                    <span className="sold-out-tag">已售罄</span>
                  ) : (
                    <button className="add-to-cart-btn" onClick={(e) => addToCart(snack, e)}>
                      + 加入
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 购物车侧栏 */}
        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>🛒 我的购物车</h2>
              <button className="close-cart-btn" onClick={() => setShowCart(false)}>×</button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-message">购物车是空的</p>
              ) : (
                cart.map(item => (
                  <div key={item.snackId} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">¥{item.price}</span>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateCartQuantity(item.snackId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.snackId, 1)}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.snackId)}>×</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <span>合计配额消耗: <strong>{totalQuotaCost}</strong></span>
                  {selectedMember && (() => {
                    const quotaStatus = dataService.quota.getStatus(parseInt(selectedMember));
                    if (quotaStatus) {
                      const dayStatus = quotaStatus.periodStatus?.day;
                      const dailyRemaining = dayStatus ? dayStatus.remaining : quotaStatus.dailyQuota;
                      return (
                        <span className={`quota-remaining ${dailyRemaining < totalQuotaCost ? 'over-limit' : ''}`}>
                          （今日剩余: {dailyRemaining}）
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                {quotaError && (
                  <div className="quota-error">{quotaError}</div>
                )}
                <div className="cart-member-select">
                  <select value={selectedMember} onChange={(e) => { setSelectedMember(e.target.value); setQuotaError(''); }}>
                    <option value="">选择成员</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
                <button className="submit-order-btn" onClick={handleSubmitOrder}>
                  📋 提交订购
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 待处理申请 */}
      <div className="queue-section" ref={queueRef} id="pending">
        <div className="queue-header">
          <h2>待处理申请</h2>
          {queue.length > 0 && (
            <button className="confirm-all-btn" onClick={handleConfirmAll}>
              ✓ 全部确认
            </button>
          )}
        </div>
        {queue.length === 0 ? (
          <p className="empty-message">暂无待处理申请</p>
        ) : (
          <div className="queue-list">
            {queue.map(item => (
              <div key={item.id} className="queue-item">
                <div className="queue-info">
                  <span className="member-name">{item.member_name}</span>
                  <span className="snack-name">{item.snack_name}</span>
                  <span className="quantity">x{item.quantity}</span>
                </div>
                <div className="queue-actions">
                  <button className="confirm-btn" onClick={() => confirmClaim(item.id)}>✓ 确认</button>
                  <button className="cancel-btn" onClick={() => cancelClaim(item.id, '取消')}>✗ 取消</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 领取记录 */}
      <div className="records-section">
        <h2>领取记录</h2>
        {records.length === 0 ? (
          <p className="empty-message">暂无领取记录</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>成员</th>
                <th>零食</th>
                <th>数量</th>
                <th>配额消耗</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.member_name}</td>
                  <td>{record.snack_name}</td>
                  <td>{record.quantity}</td>
                  <td>{record.quota_cost}</td>
                  <td>{new Date(record.taken_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClaimQueue;
