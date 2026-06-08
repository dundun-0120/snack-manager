import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyService } from '../services/familyService';
import { useAuthStore } from '../stores/authStore';
import './FamilySelect.css';

function FamilySelect() {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const [families, setFamilies] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadFamilies(); }, []);

  const loadFamilies = async () => {
    try { const data = await familyService.getMyFamilies(); setFamilies(data); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const password = Math.floor(100000 + Math.random() * 900000).toString();
      const family = await familyService.createFamily(familyName, password);
      alert(`家庭创建成功！\n家庭密码：${password}\n请告诉家庭成员此密码来加入。`);
      // 自动选择并跳转到主页面
      selectFamily({ ...family, role: 'parent' });
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const family = await familyService.joinFamily(joinPassword);
      alert('加入家庭成功！');
      // 自动选择并跳转到主页面
      selectFamily({ ...family, role: 'child' });
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const selectFamily = (family) => {
    localStorage.setItem('current_family_id', family.id);
    localStorage.setItem('current_family_role', family.role);
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="family-select-page">
      <div className="family-header">
        <h1>🏠 选择家庭</h1>
        {profile && <p className="user-info">欢迎，{profile.nickname || '用户'}</p>}
        <button className="logout-btn" onClick={handleLogout}>退出登录</button>
      </div>

      {families.length > 0 ? (
        <div className="family-list">
          {families.map(family => (
            <div key={family.id} className="family-card" onClick={() => selectFamily(family)}>
              <h3>{family.name}</h3>
              <span className={`role-badge ${family.role}`}>
                {family.role === 'parent' ? '👑 家长' : '👶 孩子'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-families">
          <p>你还没有加入任何家庭</p>
          <p>创建一个家庭或输入密码加入已有家庭</p>
        </div>
      )}

      <div className="family-actions">
        <button className="action-btn primary" onClick={() => setShowCreate(true)}>➕ 创建新家庭</button>
        <button className="action-btn" onClick={() => setShowJoin(true)}>🔑 加入家庭</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>创建家庭</h2>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="家庭名称（如：小明家）" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
              <p className="hint">系统将自动生成6位家庭密码</p>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreate(false)}>取消</button>
                <button type="submit" className="btn-confirm" disabled={loading}>{loading ? '创建中...' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>加入家庭</h2>
            <form onSubmit={handleJoin}>
              <input type="text" placeholder="输入6位家庭密码" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} maxLength={6} required />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowJoin(false)}>取消</button>
                <button type="submit" className="btn-confirm" disabled={loading}>{loading ? '加入中...' : '加入'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilySelect;
