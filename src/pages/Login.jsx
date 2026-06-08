import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await register(email, password, nickname);
        alert('注册成功！请登录');
        setIsSignUp(false);
      } else {
        await login(email, password);
        navigate('/family');
      }
    } catch (err) {
      setError(err.message || '操作失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>🍿 家庭零食管理系统</h1>
        <h2>{isSignUp ? '注册账号' : '登录'}</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input type="text" placeholder="昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
          )}
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <button type="submit" disabled={loading}>
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>
        <p className="login-switch">
          {isSignUp ? '已有账号？' : '还没有账号？'}
          <button className="link-btn" onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
            {isSignUp ? '立即登录' : '立即注册'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
