import { describe, it, expect } from 'vitest';

// 默认快捷键配置
const DEFAULT_SHORTCUTS = {
  navFirst: { key: 'ArrowUp', ctrl: true, meta: true, alt: false, shift: false },
  navLast: { key: 'ArrowDown', ctrl: true, meta: true, alt: false, shift: false },
};

// 快捷键匹配函数
function matchShortcut(event, shortcutConfig) {
  return (
    event.key === shortcutConfig.key &&
    event.ctrlKey === shortcutConfig.ctrl &&
    event.metaKey === shortcutConfig.meta &&
    event.altKey === shortcutConfig.alt &&
    event.shiftKey === shortcutConfig.shift
  );
}

// 获取第一个菜单索引
function getFirstMenuIndex() {
  return 0;
}

// 获取最后一个菜单索引
function getLastMenuIndex(totalItems) {
  return totalItems - 1;
}

describe('快捷键工具函数', () => {
  describe('matchShortcut', () => {
    it('正确匹配 Command/Ctrl + 上箭头', () => {
      const event = {
        key: 'ArrowUp',
        ctrlKey: true,
        metaKey: true,
        altKey: false,
        shiftKey: false,
      };
      expect(matchShortcut(event, DEFAULT_SHORTCUTS.navFirst)).toBe(true);
    });

    it('正确匹配 Command/Ctrl + 下箭头', () => {
      const event = {
        key: 'ArrowDown',
        ctrlKey: true,
        metaKey: true,
        altKey: false,
        shiftKey: false,
      };
      expect(matchShortcut(event, DEFAULT_SHORTCUTS.navLast)).toBe(true);
    });

    it('不匹配普通上箭头', () => {
      const event = {
        key: 'ArrowUp',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      };
      expect(matchShortcut(event, DEFAULT_SHORTCUTS.navFirst)).toBe(false);
    });

    it('不匹配只有 Ctrl 的上箭头', () => {
      const event = {
        key: 'ArrowUp',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      };
      expect(matchShortcut(event, DEFAULT_SHORTCUTS.navFirst)).toBe(false);
    });

    it('不匹配 Shift + 上箭头', () => {
      const event = {
        key: 'ArrowUp',
        ctrlKey: true,
        metaKey: true,
        altKey: false,
        shiftKey: true,
      };
      expect(matchShortcut(event, DEFAULT_SHORTCUTS.navFirst)).toBe(false);
    });
  });

  describe('getFirstMenuIndex', () => {
    it('返回第一个菜单索引 0', () => {
      expect(getFirstMenuIndex()).toBe(0);
    });
  });

  describe('getLastMenuIndex', () => {
    it('8个菜单时返回最后一个索引 7', () => {
      expect(getLastMenuIndex(8)).toBe(7);
    });

    it('5个菜单时返回最后一个索引 4', () => {
      expect(getLastMenuIndex(5)).toBe(4);
    });
  });
});

describe('快捷键配置序列化', () => {
  it('正确序列化和反序列化快捷键配置', () => {
    const serialized = JSON.stringify(DEFAULT_SHORTCUTS);
    const parsed = JSON.parse(serialized);
    expect(parsed).toEqual(DEFAULT_SHORTCUTS);
  });

  it('自定义快捷键配置可以正确保存', () => {
    const customShortcuts = {
      navFirst: { key: 'Home', ctrl: false, meta: true, alt: false, shift: false },
      navLast: { key: 'End', ctrl: false, meta: true, alt: false, shift: false },
    };
    const serialized = JSON.stringify(customShortcuts);
    const parsed = JSON.parse(serialized);
    expect(parsed.navFirst.key).toBe('Home');
    expect(parsed.navLast.key).toBe('End');
  });
});
