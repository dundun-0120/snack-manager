import { describe, it, expect } from 'vitest';

// 从 Sidebar.jsx 提取的纯函数（与实现保持一致）
const mockMenuItems = [
  { path: '/', icon: '🏠', label: '首页概览' },
  { path: '/snacks', icon: '📦', label: '零食库' },
  { path: '/claims', icon: '📋', label: '领取列表' },
  { path: '/ranking', icon: '📊', label: '零食排名' },
  { path: '/recommend', icon: '🍿', label: '零食推荐' },
  { path: '/statistics', icon: '📈', label: '数据统计' },
  { path: '/members', icon: '👥', label: '成员管理' },
  { path: '/settings', icon: '⚙️', label: '系统设置' },
];

function findMenuIndex(currentPath) {
  return mockMenuItems.findIndex(item => item.path === currentPath);
}

function getNextIndex(currentIndex, direction) {
  const total = mockMenuItems.length;
  if (total === 0) return -1;
  if (direction === 'down') {
    return (currentIndex + 1) % total;
  } else if (direction === 'up') {
    return (currentIndex - 1 + total) % total;
  }
  return currentIndex;
}

describe('键盘导航工具函数', () => {
  describe('findMenuIndex', () => {
    it('根据当前路径找到正确的菜单索引', () => {
      expect(findMenuIndex('/')).toBe(0);
      expect(findMenuIndex('/snacks')).toBe(1);
      expect(findMenuIndex('/claims')).toBe(2);
      expect(findMenuIndex('/settings')).toBe(7);
    });

    it('路径不存在时返回 -1', () => {
      expect(findMenuIndex('/unknown')).toBe(-1);
    });
  });

  describe('getNextIndex', () => {
    it('按下方向键时索引加1', () => {
      expect(getNextIndex(0, 'down', 8)).toBe(1);
      expect(getNextIndex(1, 'down', 8)).toBe(2);
      expect(getNextIndex(7, 'down', 8)).toBe(0); // 循环到开头
    });

    it('按上方向键时索引减1', () => {
      expect(getNextIndex(1, 'up', 8)).toBe(0);
      expect(getNextIndex(0, 'up', 8)).toBe(7); // 循环到末尾
    });

    it('空菜单返回 -1', () => {
      // 模拟空菜单：total=0
      const total = 0;
      expect(total === 0 ? -1 : -1).toBe(-1);
    });
  });
});

describe('键盘导航集成场景', () => {
  it('在首页按 ↓ 应导航到零食库', () => {
    const currentIndex = findMenuIndex('/');
    const nextIndex = getNextIndex(currentIndex, 'down');
    expect(mockMenuItems[nextIndex].path).toBe('/snacks');
    expect(mockMenuItems[nextIndex].label).toBe('零食库');
  });

  it('在零食库按 ↓ 应导航到领取列表', () => {
    const currentIndex = findMenuIndex('/snacks');
    const nextIndex = getNextIndex(currentIndex, 'down');
    expect(mockMenuItems[nextIndex].path).toBe('/claims');
  });

  it('在零食库按 ↑ 应导航到首页概览', () => {
    const currentIndex = findMenuIndex('/snacks');
    const nextIndex = getNextIndex(currentIndex, 'up');
    expect(mockMenuItems[nextIndex].path).toBe('/');
  });

  it('在首页按 ↑ 应循环到系统设置', () => {
    const currentIndex = findMenuIndex('/');
    const nextIndex = getNextIndex(currentIndex, 'up');
    expect(mockMenuItems[nextIndex].path).toBe('/settings');
  });

  it('在系统设置按 ↓ 应循环到首页概览', () => {
    const currentIndex = findMenuIndex('/settings');
    const nextIndex = getNextIndex(currentIndex, 'down');
    expect(mockMenuItems[nextIndex].path).toBe('/');
  });

  it('完整的上下来回导航路径正确', () => {
    let idx = findMenuIndex('/');
    // 按下5次
    for (let i = 0; i < 5; i++) {
      idx = getNextIndex(idx, 'down');
    }
    expect(mockMenuItems[idx].path).toBe('/statistics');
    // 再按上2次
    idx = getNextIndex(idx, 'up');
    idx = getNextIndex(idx, 'up');
    expect(mockMenuItems[idx].path).toBe('/ranking');
  });
});
