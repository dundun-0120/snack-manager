import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSnackStore from '../stores/snackStore';
import SnackCard from '../components/SnackCard';
import SnackForm from '../components/SnackForm';
import BatchAddSnacks from '../components/BatchAddSnacks';
import './SnackLibrary.css';

function SnackLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { snacks, categories, fetchSnacks, fetchCategories, deleteSnack } = useSnackStore();
  const [showForm, setShowForm] = useState(false);
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [editingSnack, setEditingSnack] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState(''); // 'lowstock' | 'expiring' | ''
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 从 URL 参数获取筛选状态
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('filter');
    if (type === 'lowstock' || type === 'expiring') {
      setFilterType(type);
    } else {
      setFilterType('');
    }
  }, [location.search]);

  useEffect(() => {
    fetchSnacks();
    fetchCategories();
  }, []);

  const filteredSnacks = snacks.filter(snack => {
    const matchSearch = snack.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || snack.category_id === parseInt(filterCategory);

    // 库存预警筛选：库存 <= 3
    const matchLowStock = filterType !== 'lowstock' || snack.stock <= 3;

    // 临期零食筛选：7天内过期（支持批次）
    const matchExpiring = filterType !== 'expiring' || (() => {
      if (snack.expiry_batches && snack.expiry_batches.length > 0) {
        return snack.expiry_batches.some(batch => batch.expiry_days > 0 && batch.expiry_days <= 7);
      }
      return snack.expiry_days > 0 && snack.expiry_days <= 7;
    })();

    // 已过期筛选：expiry_days <= 0
    const matchExpired = filterType !== 'expired' || (() => {
      if (snack.expiry_batches && snack.expiry_batches.length > 0) {
        return snack.expiry_batches.some(batch => batch.expiry_days <= 0);
      }
      return snack.expiry_days <= 0;
    })();

    return matchSearch && matchCategory && matchLowStock && matchExpiring && matchExpired;
  });
  
  const handleEdit = (snack) => {
    setEditingSnack(snack);
    setShowForm(true);
  };
  
  const handleDelete = (id) => {
    if (confirm('确定删除此零食？')) {
      deleteSnack(id);
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的零食');
      return;
    }
    if (confirm(`确定删除选中的 ${selectedIds.size} 个零食？此操作不可恢复！`)) {
      selectedIds.forEach(id => deleteSnack(id));
      setSelectedIds(new Set());
      setIsBatchMode(false);
    }
  };

  // 切换选择
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSnacks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSnacks.map(s => s.id)));
    }
  };
  
  const handleRestock = (snack) => {
    if (snack.purchase_link) {
      // 有购买链接，直接打开
      window.open(snack.purchase_link, '_blank');
    } else {
      // 没有购买链接，跳转到淘宝搜索
      const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(snack.name)}`;
      window.open(searchUrl, '_blank');
    }
  };

  // 添加保质期批次
  const handleAddBatch = (snack) => {
    const stock = prompt(`为「${snack.name}」添加保质期批次\n请输入数量：`, '1');
    if (!stock || isNaN(stock) || parseInt(stock) <= 0) return;

    const expiryDays = prompt(`请输入剩余天数：`, '30');
    if (!expiryDays || isNaN(expiryDays) || parseInt(expiryDays) <= 0) return;

    const updatedSnack = { ...snack };
    updatedSnack.stock = snack.stock + parseInt(stock);

    if (!updatedSnack.expiry_batches) {
      updatedSnack.expiry_batches = [];
    }
    if (snack.expiry_days && !updatedSnack.expiry_batches.find(b => b.expiry_days === snack.expiry_days)) {
      updatedSnack.expiry_batches.push({
        expiry_days: snack.expiry_days,
        stock: snack.stock,
      });
    }
    updatedSnack.expiry_batches.push({
      expiry_days: parseInt(expiryDays),
      stock: parseInt(stock),
    });

    updatedSnack.expiry_days = Math.min(...updatedSnack.expiry_batches.map(b => b.expiry_days));
    useSnackStore.getState().updateSnack(updatedSnack);
  };

  // 删除批次
  const handleDeleteBatch = (snack, batchIndex) => {
    if (!snack.expiry_batches || snack.expiry_batches.length <= batchIndex) return;
    const batch = snack.expiry_batches[batchIndex];
    if (!confirm(`确定删除「${snack.name}」的批次（${batch.stock}份，剩余${batch.expiry_days}天）？`)) return;

    const updatedSnack = { ...snack };
    updatedSnack.stock = Math.max(0, snack.stock - batch.stock);
    updatedSnack.expiry_batches = snack.expiry_batches.filter((_, i) => i !== batchIndex);

    if (updatedSnack.expiry_batches.length > 0) {
      updatedSnack.expiry_days = Math.min(...updatedSnack.expiry_batches.map(b => b.expiry_days));
    } else {
      updatedSnack.expiry_days = null;
    }

    useSnackStore.getState().updateSnack(updatedSnack);
  };

  // 设为优先消耗（将批次移到数组最前面）
  const handlePriorityBatch = (snack, batchIndex) => {
    if (!snack.expiry_batches || snack.expiry_batches.length <= batchIndex) return;
    const batch = snack.expiry_batches[batchIndex];

    const updatedSnack = { ...snack };
    updatedSnack.expiry_batches = [batch, ...snack.expiry_batches.filter((_, i) => i !== batchIndex)];
    useSnackStore.getState().updateSnack(updatedSnack);
    alert(`✅ 已将「${snack.name}」的批次（${batch.stock}份，剩余${batch.expiry_days}天）设为优先消耗`);
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditingSnack(null);
  };
  
  return (
    <div className="snack-library">
      <div className="library-header">
        <h1>📦 零食库</h1>
        <div className="header-actions">
          {!isBatchMode ? (
            <>
              <button className="batch-btn" onClick={() => setIsBatchMode(true)}>
                ☑️ 批量操作
              </button>
              <button className="add-btn" onClick={() => setShowForm(true)}>
                + 添加零食
              </button>
              <button className="batch-add-btn" onClick={() => setShowBatchAdd(true)}>
                📦 批量添加
              </button>
            </>
          ) : (
            <>
              <span className="selected-count">已选 {selectedIds.size} 个</span>
              <button className="delete-btn" onClick={handleBatchDelete} disabled={selectedIds.size === 0}>
                🗑️ 批量删除
              </button>
              <button className="cancel-btn" onClick={() => { setIsBatchMode(false); setSelectedIds(new Set()); }}>
                取消
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* 筛选状态提示 */}
      {filterType && (
        <div className="filter-banner">
          <span className="filter-info">
            {filterType === 'lowstock' && '🔔 显示库存预警零食（库存 ≤ 3）'}
            {filterType === 'expiring' && '⏰ 显示临期零食（7天内过期）'}
            {filterType === 'expired' && '🗑️ 显示已过期零食'}
          </span>
          <button
            className="clear-filter-btn"
            onClick={() => {
              setFilterType('');
              navigate('/snacks');
            }}
          >
            ✕ 清除筛选
          </button>
        </div>
      )}

      <div className="library-controls">
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
        {isBatchMode && (
          <label className="select-all-label">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredSnacks.length && filteredSnacks.length > 0}
              onChange={toggleSelectAll}
            />
            全选
          </label>
        )}
      </div>
      
      <div className="snack-list">
        {filteredSnacks.map(snack => (
          <div key={snack.id} className="snack-item-wrapper">
            {isBatchMode && (
              <input
                type="checkbox"
                className="batch-checkbox"
                checked={selectedIds.has(snack.id)}
                onChange={() => toggleSelect(snack.id)}
              />
            )}
            <SnackCard
              snack={snack}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestock={handleRestock}
              onAddBatch={handleAddBatch}
              onDeleteBatch={handleDeleteBatch}
              onPriorityBatch={handlePriorityBatch}
              showExpiringBatchOnly={filterType === 'expiring'}
              showExpiredBatchOnly={filterType === 'expired'}
            />
          </div>
        ))}
      </div>
      
      {showForm && (
        <SnackForm
          snack={editingSnack}
          categories={categories}
          onClose={handleFormClose}
        />
      )}
      
      {showBatchAdd && (
        <BatchAddSnacks
          categories={categories}
          onClose={() => setShowBatchAdd(false)}
          onSuccess={() => {
            setShowBatchAdd(false);
            fetchSnacks();
          }}
        />
      )}
    </div>
  );
}

export default SnackLibrary;
