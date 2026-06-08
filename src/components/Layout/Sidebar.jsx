import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../stores/settingsStore';
import './Sidebar.css';

const menuItems = [
  { path: '/', icon: '🏠', label: '首页概览' },
  { path: '/snacks', icon: '📦', label: '零食库' },
  { path: '/claims', icon: '📋', label: '领取列表' },
  { path: '/recommend', icon: '🍿', label: '零食推荐' },
  { path: '/statistics', icon: '📈', label: '数据统计' },
  { path: '/members', icon: '👥', label: '成员管理' },
  { path: '/settings', icon: '⚙️', label: '系统设置' },
];

function findMenuIndex(currentPath) {
  return menuItems.findIndex(item => item.path === currentPath);
}

function getNextIndex(currentIndex, direction) {
  const total = menuItems.length;
  if (total === 0) return -1;
  if (direction === 'down') {
    return (currentIndex + 1) % total;
  } else if (direction === 'up') {
    return (currentIndex - 1 + total) % total;
  }
  return currentIndex;
}

// 匹配快捷键配置（支持 Ctrl 或 Meta 之一）
function matchShortcut(event, shortcutConfig) {
  if (!shortcutConfig) return false;
  
  // 检查修饰键：配置要求 ctrl 或 meta 时，只要满足其一即可
  const ctrlMatch = shortcutConfig.ctrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
  const metaMatch = shortcutConfig.meta ? (event.ctrlKey || event.metaKey) : true; // meta 和 ctrl 视为等价
  const altMatch = event.altKey === shortcutConfig.alt;
  const shiftMatch = event.shiftKey === shortcutConfig.shift;
  const keyMatch = event.key === shortcutConfig.key;
  
  return keyMatch && ctrlMatch && altMatch && shiftMatch;
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shortcuts } = useSettingsStore();

  React.useEffect(() => {
    function handleKeyDown(e) {
      // 忽略在输入框中的按键
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        return;
      }

      // 检查是否匹配跳转到第一个菜单的快捷键 (Command/Ctrl + 上)
      if (matchShortcut(e, shortcuts.navFirst)) {
        e.preventDefault();
        navigate(menuItems[0].path);
        return;
      }

      // 检查是否匹配跳转到最后一个菜单的快捷键 (Command/Ctrl + 下)
      if (matchShortcut(e, shortcuts.navLast)) {
        e.preventDefault();
        navigate(menuItems[menuItems.length - 1].path);
        return;
      }

      // 普通上下箭头导航
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentPath = location.pathname;
        const currentIndex = findMenuIndex(currentPath);
        if (currentIndex === -1) return;

        const direction = e.key === 'ArrowDown' ? 'down' : 'up';
        const nextIndex = getNextIndex(currentIndex, direction);
        if (nextIndex !== -1 && nextIndex !== currentIndex) {
          navigate(menuItems[nextIndex].path);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate, shortcuts]);

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        🍪 家庭零食管理系统
      </div>
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li key={item.path}>
            <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
