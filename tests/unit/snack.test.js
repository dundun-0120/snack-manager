import { describe, it, expect } from 'vitest';

// 零食过期状态判断函数
function getExpiryStatus(days) {
  if (days <= 0) return { level: 'expired', label: `已过期 ${Math.abs(days)} 天` };
  if (days <= 3) return { level: 'critical', label: `还有 ${days} 天` };
  if (days <= 7) return { level: 'warning', label: `还有 ${days} 天` };
  return { level: 'normal', label: null };
}

describe('零食过期状态判断', () => {
  it('已过期零食返回正确状态', () => {
    const result = getExpiryStatus(-1);
    expect(result.level).toBe('expired');
    expect(result.label).toBe('已过期 1 天');
  });

  it('临界期零食返回正确状态', () => {
    const result = getExpiryStatus(2);
    expect(result.level).toBe('critical');
    expect(result.label).toBe('还有 2 天');
  });

  it('临期零食返回正确状态', () => {
    const result = getExpiryStatus(5);
    expect(result.level).toBe('warning');
    expect(result.label).toBe('还有 5 天');
  });

  it('正常零食返回正确状态', () => {
    const result = getExpiryStatus(10);
    expect(result.level).toBe('normal');
    expect(result.label).toBeNull();
  });
});
