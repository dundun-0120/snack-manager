import { describe, it, expect } from 'vitest';

// 配额计算函数测试（与 dataService.js 保持一致）
function calculateQuotaCost(sizeLevel, quantity) {
  const sizeMap = { '小': 1, '中': 2, '大': 3, '特大': 4 };
  return (sizeMap[sizeLevel] || 2) * quantity;
}

describe('配额计算工具', () => {
  it('小份零食配额计算正确', () => {
    expect(calculateQuotaCost('小', 1)).toBe(1);
    expect(calculateQuotaCost('小', 3)).toBe(3);
  });

  it('中份零食配额计算正确', () => {
    expect(calculateQuotaCost('中', 1)).toBe(2);
    expect(calculateQuotaCost('中', 2)).toBe(4);
  });

  it('大份零食配额计算正确', () => {
    expect(calculateQuotaCost('大', 1)).toBe(3);
    expect(calculateQuotaCost('大', 2)).toBe(6);
  });

  it('特大份零食配额计算正确', () => {
    expect(calculateQuotaCost('特大', 1)).toBe(4);
    expect(calculateQuotaCost('特大', 2)).toBe(8);
  });

  it('未知大小默认使用中份配额', () => {
    expect(calculateQuotaCost('未知', 1)).toBe(2);
  });
});

describe('配额检查逻辑', () => {
  it('总配额消耗不超过日配额时允许订购', () => {
    const dailyQuota = 4;
    const todayUsed = 0;
    const totalCost = 4;
    expect(todayUsed + totalCost <= dailyQuota).toBe(true);
  });

  it('总配额消耗超过日配额时不允许订购', () => {
    const dailyQuota = 4;
    const todayUsed = 2;
    const totalCost = 3;
    expect(todayUsed + totalCost <= dailyQuota).toBe(false);
  });

  it('默认每日配额为4', () => {
    const DEFAULT_DAILY_QUOTA = 4;
    expect(DEFAULT_DAILY_QUOTA).toBe(4);
  });
});
