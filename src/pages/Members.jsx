import React, { useEffect, useState, useCallback } from 'react';
import useMemberStore from '../stores/memberStore';
import useSettingsStore from '../stores/settingsStore';
import dataService from '../services/dataService';
import './Members.css';

// 所有可选的时间规格
const ALL_PERIODS = [
  { key: 'day', label: '日', multiplier: 1 },
  { key: 'week', label: '周', multiplier: 7 },
  { key: 'month', label: '月', multiplier: 30 },
  { key: 'year', label: '年', multiplier: 365 },
];

function Members() {
  const { members, fetchMembers, addMember, updateMember, deleteMember } = useMemberStore();
  const { quotaDisplayMode } = useSettingsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [quotaStatuses, setQuotaStatuses] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    role: '孩子',
    daily_quota: 4,
    quota_periods: ['day', 'week'],
  });

  // 加载成员和配额状态
  useEffect(() => {
    fetchMembers();
  }, []);

  // 刷新所有成员的配额状态
  const refreshQuotaStatuses = useCallback(() => {
    const statuses = {};
    members.forEach(member => {
      statuses[member.id] = dataService.quota.getStatus(member.id);
    });
    setQuotaStatuses(statuses);
  }, [members]);

  useEffect(() => {
    refreshQuotaStatuses();
  }, [refreshQuotaStatuses]);

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      daily_quota: member.daily_quota,
      quota_periods: member.quota_periods || ['day', 'week'],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (editingMember) {
      await updateMember({ ...submitData, id: editingMember.id });
    } else {
      await addMember(submitData);
    }
    setShowForm(false);
    setEditingMember(null);
    setFormData({ name: '', role: '孩子', daily_quota: 4, quota_periods: ['day', 'week'] });
  };

  const handleDelete = (id) => {
    if (confirm('确定删除此成员？')) {
      deleteMember(id);
    }
  };

  // 添加时间规格
  const addPeriod = (periodKey) => {
    if (!formData.quota_periods.includes(periodKey)) {
      setFormData({ ...formData, quota_periods: [...formData.quota_periods, periodKey] });
    }
  };

  // 删除时间规格
  const removePeriod = (periodKey) => {
    if (formData.quota_periods.length <= 1) {
      alert('至少保留一个时间规格');
      return;
    }
    setFormData({ ...formData, quota_periods: formData.quota_periods.filter(p => p !== periodKey) });
  };

  // 获取当前未选中的时间规格
  const getAvailablePeriods = () => {
    return ALL_PERIODS.filter(p => !formData.quota_periods.includes(p.key));
  };

  // 获取时间规格信息
  const getPeriodInfo = (key) => {
    return ALL_PERIODS.find(p => p.key === key) || { key, label: key, multiplier: 1 };
  };

  return (
    <div className="members-page">
      <div className="page-header">
        <h1>👥 成员管理</h1>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + 添加成员
        </button>
      </div>

      <div className="members-list">
        {members.length === 0 ? (
          <p className="empty-message">暂无成员</p>
        ) : (
          members.map(member => {
            const status = quotaStatuses[member.id];
            const periods = member.quota_periods || ['day', 'week'];

            return (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">{member.avatar || member.name.charAt(0)}</div>
                  <div className="member-details">
                    <h3>{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <div className="member-quotas">
                      {periods.map(periodKey => {
                        const pInfo = getPeriodInfo(periodKey);
                        const pStatus = status?.periodStatus?.[periodKey];
                        const total = member.daily_quota * pInfo.multiplier;
                        const used = pStatus?.used || 0;
                        const remaining = Math.max(0, total - used);
                        const isOver = used > total;

                        const showRemaining = quotaDisplayMode === 'remaining';
                        const primaryValue = showRemaining ? remaining : used;
                        const percentage = total > 0 ? Math.min(100, (primaryValue / total) * 100) : 0;
                        const isWarning = showRemaining ? percentage < 20 : percentage > 80;

                        return (
                          <div key={periodKey} className={`quota-item ${isOver ? 'quota-over' : ''}`}>
                            <span className="quota-label">{pInfo.label}配额:</span>
                            <span className="quota-values">
                              <span className={isOver ? 'quota-inline-over' : ''}>{primaryValue}</span>
                              <span className="quota-separator">/</span>
                              <span className="quota-total">{total}</span>
                            </span>
                            <div className="quota-bar-container">
                              <div
                                className={`quota-bar ${isOver ? 'quota-bar-over' : isWarning ? 'quota-bar-warning' : ''}`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                            <span className="quota-used-info">{showRemaining ? `已用 ${used}` : `剩余 ${remaining}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="member-actions">
                  <button onClick={() => handleEdit(member)}>编辑</button>
                  <button className="delete-btn" onClick={() => handleDelete(member.id)}>删除</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMember ? '编辑成员' : '添加成员'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="孩子">孩子</option>
                  <option value="家长">家长</option>
                  <option value="管理员">管理员</option>
                  <option value="查看者">查看者</option>
                </select>
              </div>
              <div className="form-group">
                <label>日配额 *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.daily_quota}
                  onChange={(e) => setFormData({ ...formData, daily_quota: parseInt(e.target.value) || 1 })}
                />
                <div className="quota-preview">
                  {formData.quota_periods.map(periodKey => {
                    const pInfo = getPeriodInfo(periodKey);
                    return (
                      <span key={periodKey} className="quota-preview-item">
                        {pInfo.label}配额: <strong>{formData.daily_quota * pInfo.multiplier}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>时间规格</label>
                <div className="period-tags">
                  {formData.quota_periods.map(periodKey => {
                    const pInfo = getPeriodInfo(periodKey);
                    return (
                      <span key={periodKey} className="period-tag">
                        {pInfo.label}（×{pInfo.multiplier} = {formData.daily_quota * pInfo.multiplier}）
                        <button type="button" className="period-remove" onClick={() => removePeriod(periodKey)}>×</button>
                      </span>
                    );
                  })}
                </div>
                {getAvailablePeriods().length > 0 && (
                  <div className="period-add">
                    <span className="period-add-label">添加：</span>
                    {getAvailablePeriods().map(p => (
                      <button
                        key={p.key}
                        type="button"
                        className="period-add-btn"
                        onClick={() => addPeriod(p.key)}
                      >
                        + {p.label}（×{p.multiplier}）
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  取消
                </button>
                <button type="submit" className="submit-btn">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
