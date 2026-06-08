/**
 * DataService - 数据服务层
 * 使用 localStorage 存储所有数据
 */

// ============ localStorage 工具函数 ============

const STORAGE_KEYS = {
  SNACKS: 'sm_snacks',
  CATEGORIES: 'sm_categories',
  MEMBERS: 'sm_members',
  CLAIMS: 'sm_claims',
  CLAIM_QUEUE: 'sm_claim_queue',
  SETTINGS: 'sm_settings',
  RECOMMENDATIONS: 'sm_recommendations',
};

function getAll(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(list) {
  return list.length > 0 ? Math.max(...list.map(item => item.id)) + 1 : 1;
}

// ============ 默认数据 ============

const DEFAULT_CATEGORIES = [
  { id: 1, name: '糖果', icon: '🍬', sort_order: 1 },
  { id: 9, name: '巧克力', icon: '🍫', sort_order: 1.5 },
  { id: 2, name: '饼干', icon: '🍪', sort_order: 2 },
  { id: 3, name: '坚果', icon: '🥜', sort_order: 3 },
  { id: 4, name: '水果', icon: '🍎', sort_order: 4 },
  { id: 5, name: '饮料', icon: '🥤', sort_order: 5 },
  { id: 6, name: '乳制品', icon: '🧀', sort_order: 6 },
  { id: 7, name: '膨化食品', icon: '🍿', sort_order: 7 },
  { id: 8, name: '其他', icon: '📦', sort_order: 8 },
];

const DEFAULT_MEMBERS = [
  { id: 1, name: '小明', role: '孩子', avatar: '👦', daily_quota: 4, weekly_quota: 20, preferences: '' },
  { id: 2, name: '小红', role: '孩子', avatar: '👧', daily_quota: 4, weekly_quota: 20, preferences: '' },
  { id: 3, name: '爸爸', role: '家长', avatar: '👨', daily_quota: 4, weekly_quota: 20, preferences: '' },
  { id: 4, name: '妈妈', role: '管理员', avatar: '👩', daily_quota: 4, weekly_quota: 20, preferences: '' },
];

const DEFAULT_SNACKS = [
  { id: 1, name: '奥利奥饼干', category_id: 2, health_score: 4, photo_path: '', stock: 12, production_date: '2026-05-01', expiry_date: '2026-11-01', expiry_days: 155, expiry_alert: 7, purchase_link: '', platform_name: '淘宝', price: 15.9, size_level: '中', notes: '经典夹心饼干', created_at: '2026-05-15T10:00:00' },
  { id: 2, name: '每日坚果', category_id: 3, health_score: 8, photo_path: '', stock: 8, production_date: '2026-04-20', expiry_date: '2026-10-20', expiry_days: 143, expiry_alert: 7, purchase_link: '', platform_name: '京东', price: 89.9, size_level: '小', notes: '混合坚果仁', created_at: '2026-05-15T10:00:00' },
  { id: 3, name: '旺仔牛奶', category_id: 6, health_score: 6, photo_path: '', stock: 20, production_date: '2026-05-10', expiry_date: '2026-08-10', expiry_days: 72, expiry_alert: 7, purchase_link: '', platform_name: '淘宝', price: 45.0, size_level: '中', notes: '甜牛奶', created_at: '2026-05-15T10:00:00' },
  { id: 4, name: '薯片', category_id: 7, health_score: 3, photo_path: '', stock: 3, production_date: '2026-05-20', expiry_date: '2026-06-20', expiry_days: 21, expiry_alert: 7, purchase_link: '', platform_name: '拼多多', price: 9.9, size_level: '大', notes: '原味薯片', created_at: '2026-05-15T10:00:00' },
  { id: 5, name: '草莓软糖', category_id: 1, health_score: 3, photo_path: '', stock: 15, production_date: '2026-05-01', expiry_date: '2026-12-01', expiry_days: 185, expiry_alert: 7, purchase_link: '', platform_name: '淘宝', price: 12.5, size_level: '小', notes: '草莓味软糖', created_at: '2026-05-15T10:00:00' },
  { id: 6, name: '酸奶', category_id: 6, health_score: 7, photo_path: '', stock: 6, production_date: '2026-05-25', expiry_date: '2026-06-08', expiry_days: 9, expiry_alert: 7, purchase_link: '', platform_name: '京东', price: 59.9, size_level: '中', notes: '低温酸奶', created_at: '2026-05-15T10:00:00' },
  { id: 7, name: '苹果', category_id: 4, health_score: 9, photo_path: '', stock: 10, production_date: '2026-05-28', expiry_date: '2026-06-10', expiry_days: 11, expiry_alert: 7, purchase_link: '', platform_name: '', price: 8.0, size_level: '中', notes: '新鲜苹果', created_at: '2026-05-15T10:00:00' },
  { id: 8, name: '巧克力棒', category_id: 1, health_score: 4, photo_path: '', stock: 0, production_date: '2026-04-15', expiry_date: '2026-05-25', expiry_days: -5, expiry_alert: 7, purchase_link: '', platform_name: '淘宝', price: 25.0, size_level: '中', notes: '进口巧克力', created_at: '2026-05-15T10:00:00' },
];

const DEFAULT_SETTINGS = [
  { key: 'theme', value: 'professional' },
  { key: 'auto_update', value: 'true' },
  { key: 'recommend_interval', value: 'daily' },
];

// ============ localStorage 初始化 ============

function initDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    saveAll(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    saveAll(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SNACKS)) {
    saveAll(STORAGE_KEYS.SNACKS, DEFAULT_SNACKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    saveAll(STORAGE_KEYS.CLAIMS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIM_QUEUE)) {
    saveAll(STORAGE_KEYS.CLAIM_QUEUE, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveAll(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS)) {
    saveAll(STORAGE_KEYS.RECOMMENDATIONS, []);
  }
}

// ============ localStorage API 实现（同步） ============

// 合并批次工具函数：同一天到期的批次自动合并
function mergeBatches(batches) {
  const merged = {};
  batches.forEach(batch => {
    const key = batch.expiry_days;
    if (merged[key]) {
      merged[key].stock += batch.stock;
    } else {
      merged[key] = { ...batch };
    }
  });
  return Object.values(merged);
}

function calculateQuotaCost(sizeLevel, quantity) {
  const sizeMap = { '小': 1, '中': 2, '大': 3, '特大': 4 };
  return (sizeMap[sizeLevel] || 2) * quantity;
}

const snackApi = {
  getAll: () => getAll(STORAGE_KEYS.SNACKS),
  getById: (id) => getAll(STORAGE_KEYS.SNACKS).find(s => s.id === id) || null,
  getByCategory: (categoryId) => getAll(STORAGE_KEYS.SNACKS).filter(s => s.category_id === categoryId),
  search: (keyword) => {
    const kw = keyword.toLowerCase();
    return getAll(STORAGE_KEYS.SNACKS).filter(s =>
      s.name.toLowerCase().includes(kw) || (s.notes || '').toLowerCase().includes(kw)
    );
  },
  mergeBatches: (batches) => mergeBatches(batches),
  add: (snack) => {
    const list = getAll(STORAGE_KEYS.SNACKS);

    // 检查是否已存在同名零食
    const existing = list.find(s => s.name === snack.name);

    if (existing) {
      // 同名零食合并：累加库存，添加保质期批次
      existing.stock = (existing.stock || 0) + (snack.stock || 0);

      // 多批次保质期：用数组存储
      if (!existing.expiry_batches) {
        existing.expiry_batches = [];
      }
      // 保留原有批次
      if (existing.expiry_days && !existing.expiry_batches.find(b => b.expiry_days === existing.expiry_days)) {
        existing.expiry_batches.push({
          expiry_days: existing.expiry_days,
          stock: existing.stock - (snack.stock || 0), // 原有库存
        });
      }
      // 添加新批次
      existing.expiry_batches.push({
        expiry_days: snack.expiry_days,
        stock: snack.stock || 0,
      });

      // 【关键】合并同一天到期的批次
      existing.expiry_batches = mergeBatches(existing.expiry_batches);

      // 更新过期天数为所有批次中最小的（最紧急的）
      if (existing.expiry_batches.length > 0) {
        existing.expiry_days = Math.min(...existing.expiry_batches.map(b => b.expiry_days));
      }

      // 价格处理：如果新价格与旧价格不同，取平均
      if (snack.price && existing.price && snack.price !== existing.price) {
        existing.price = ((parseFloat(existing.price) + parseFloat(snack.price)) / 2).toFixed(2);
      } else if (snack.price) {
        existing.price = snack.price;
      }

      saveAll(STORAGE_KEYS.SNACKS, list);
      return existing;
    }

    // 新零食
    const newSnack = {
      ...snack,
      id: generateId(list),
      created_at: new Date().toISOString(),
      expiry_batches: snack.expiry_days ? [{
        expiry_days: snack.expiry_days,
        stock: snack.stock || 0,
      }] : [],
    };
    list.push(newSnack);
    saveAll(STORAGE_KEYS.SNACKS, list);
    return newSnack;
  },
  update: (snack) => {
    const list = getAll(STORAGE_KEYS.SNACKS);
    const index = list.findIndex(s => s.id === snack.id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...snack };
    saveAll(STORAGE_KEYS.SNACKS, list);
    return list[index];
  },
  delete: (id) => {
    const list = getAll(STORAGE_KEYS.SNACKS).filter(s => s.id !== id);
    saveAll(STORAGE_KEYS.SNACKS, list);
  },
};

const categoryApi = {
  getAll: () => getAll(STORAGE_KEYS.CATEGORIES),
};

const memberApi = {
  getAll: () => getAll(STORAGE_KEYS.MEMBERS),
  getById: (id) => getAll(STORAGE_KEYS.MEMBERS).find(m => m.id === id) || null,
  add: (member) => {
    const list = getAll(STORAGE_KEYS.MEMBERS);
    const newMember = {
      ...member,
      id: generateId(list),
      avatar: member.avatar || member.name.charAt(0),
      created_at: new Date().toISOString(),
    };
    list.push(newMember);
    saveAll(STORAGE_KEYS.MEMBERS, list);
    return newMember;
  },
  update: (member) => {
    const list = getAll(STORAGE_KEYS.MEMBERS);
    const index = list.findIndex(m => m.id === member.id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...member };
    saveAll(STORAGE_KEYS.MEMBERS, list);
    return list[index];
  },
  delete: (id) => {
    const list = getAll(STORAGE_KEYS.MEMBERS).filter(m => m.id !== id);
    saveAll(STORAGE_KEYS.MEMBERS, list);
  },
};

const claimApi = {
  getQueue: () => getAll(STORAGE_KEYS.CLAIM_QUEUE).filter(q => q.status === 'pending'),
  getRecords: (limit = 100) => {
    const records = getAll(STORAGE_KEYS.CLAIMS);
    const members = getAll(STORAGE_KEYS.MEMBERS);
    const snacks = getAll(STORAGE_KEYS.SNACKS);
    return records.slice(0, limit).map(r => ({
      ...r,
      member_name: members.find(m => m.id === r.member_id)?.name || '未知',
      snack_name: snacks.find(s => s.id === r.snack_id)?.name || '未知',
    }));
  },
  add: (claim) => {
    const list = getAll(STORAGE_KEYS.CLAIM_QUEUE);
    const newClaim = {
      ...claim,
      id: generateId(list),
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: claim.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    list.push(newClaim);
    saveAll(STORAGE_KEYS.CLAIM_QUEUE, list);
    return newClaim;
  },
  update: (claim) => {
    const list = getAll(STORAGE_KEYS.CLAIM_QUEUE);
    const index = list.findIndex(q => q.id === claim.id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...claim };
    saveAll(STORAGE_KEYS.CLAIM_QUEUE, list);
    return list[index];
  },
  confirm: (id) => {
    const queueList = getAll(STORAGE_KEYS.CLAIM_QUEUE);
    const queueItem = queueList.find(q => q.id === id);
    if (!queueItem) return null;

    const snacks = getAll(STORAGE_KEYS.SNACKS);
    const snack = snacks.find(s => s.id === queueItem.snack_id);
    const quotaCost = calculateQuotaCost(snack?.size_level || '中', queueItem.quantity);

    // 添加领取记录
    const records = getAll(STORAGE_KEYS.CLAIMS);
    const record = {
      id: generateId(records),
      snack_id: queueItem.snack_id,
      member_id: queueItem.member_id,
      quantity: queueItem.quantity,
      quota_cost: quotaCost,
      taken_at: new Date().toISOString(),
      notes: '',
    };
    records.unshift(record);
    saveAll(STORAGE_KEYS.CLAIMS, records);

    // 更新库存
    const snackIndex = snacks.findIndex(s => s.id === queueItem.snack_id);
    if (snackIndex !== -1) {
      snacks[snackIndex].stock = Math.max(0, snacks[snackIndex].stock - queueItem.quantity);
      saveAll(STORAGE_KEYS.SNACKS, snacks);
    }

    // 更新队列状态
    queueItem.status = 'completed';
    const updatedQueue = getAll(STORAGE_KEYS.CLAIM_QUEUE).map(q => q.id === id ? queueItem : q);
    saveAll(STORAGE_KEYS.CLAIM_QUEUE, updatedQueue);

    return record;
  },
  cancel: (id, reason) => {
    const list = getAll(STORAGE_KEYS.CLAIM_QUEUE).map(q =>
      q.id === id ? { ...q, status: 'cancelled', notes: reason || '' } : q
    );
    saveAll(STORAGE_KEYS.CLAIM_QUEUE, list);
  },
};

// 预定义时间规格及其乘数（基于日配额）
const QUOTA_PERIODS = {
  day: { label: '日', multiplier: 1 },
  week: { label: '周', multiplier: 7 },
  month: { label: '月', multiplier: 30 },
  year: { label: '年', multiplier: 365 },
};

// 根据日配额和时间规格计算配额
function calculatePeriodQuota(dailyQuota, periodKey) {
  const period = QUOTA_PERIODS[periodKey];
  if (!period) return dailyQuota;
  return dailyQuota * period.multiplier;
}

// 获取时间范围的起始时间
function getPeriodStart(periodKey) {
  const now = new Date();
  switch (periodKey) {
    case 'day': {
      now.setHours(0, 0, 0, 0);
      return now.toISOString();
    }
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      return monday.toISOString();
    }
    case 'month': {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
    case 'year': {
      return new Date(now.getFullYear(), 0, 1).toISOString();
    }
    default:
      return now.toISOString();
  }
}

const quotaApi = {
  getPeriods: () => QUOTA_PERIODS,
  getStatus: (memberId) => {
    const members = getAll(STORAGE_KEYS.MEMBERS);
    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const records = getAll(STORAGE_KEYS.CLAIMS);

    // 获取成员自定义的时间规格，如果没有则使用默认的日和周
    const periods = member.quota_periods || ['day', 'week'];

    const periodStatus = {};
    for (const periodKey of periods) {
      const periodStart = getPeriodStart(periodKey);
      const used = records
        .filter(r => r.member_id === memberId && r.taken_at >= periodStart)
        .reduce((sum, r) => sum + (r.quota_cost || 0), 0);
      const total = calculatePeriodQuota(member.daily_quota, periodKey);
      periodStatus[periodKey] = {
        total,
        used,
        remaining: Math.max(0, total - used),
      };
    }

    return {
      dailyQuota: member.daily_quota,
      periods,
      periodStatus,
    };
  },
  adjust: (memberId, amount) => {
    const members = getAll(STORAGE_KEYS.MEMBERS);
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) return;
    members[index].daily_quota = Math.max(0, members[index].daily_quota + amount);
    saveAll(STORAGE_KEYS.MEMBERS, members);
  },
};

const settingsApi = {
  get: () => getAll(STORAGE_KEYS.SETTINGS),
  getByKey: (key) => {
    const list = getAll(STORAGE_KEYS.SETTINGS);
    return list.find(s => s.key === key)?.value || null;
  },
  update: (key, value) => {
    const list = getAll(STORAGE_KEYS.SETTINGS);
    const index = list.findIndex(s => s.key === key);
    if (index !== -1) {
      list[index].value = value;
    } else {
      list.push({ key, value });
    }
    saveAll(STORAGE_KEYS.SETTINGS, list);
  },
};

const recommendApi = {
  get: () => getAll(STORAGE_KEYS.RECOMMENDATIONS),
  addToLibrary: (rec) => {
    return snackApi.add({
      name: rec.name,
      health_score: rec.health_score || 5,
      purchase_link: rec.purchase_link_jd || rec.purchase_link_taobao || '',
      platform_name: rec.platform || '',
      price: rec.price || 0,
      size_level: '中',
      stock: 0,
      notes: rec.reason || '',
    });
  },
};

const shareApi = {
  exportData: () => {
    const data = {
      snacks: getAll(STORAGE_KEYS.SNACKS),
      members: getAll(STORAGE_KEYS.MEMBERS),
      categories: getAll(STORAGE_KEYS.CATEGORIES),
      records: getAll(STORAGE_KEYS.CLAIMS),
      settings: getAll(STORAGE_KEYS.SETTINGS),
      exported_at: new Date().toISOString(),
      version: '2.0',
    };
    const json = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  },
  importData: (encoded) => {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const data = JSON.parse(json);
      if (!data.version || !data.snacks) {
        throw new Error('无效的分享数据');
      }
      // 合并数据（以分享数据为主，保留本地不冲突的数据）
      if (data.snacks) saveAll(STORAGE_KEYS.SNACKS, data.snacks);
      if (data.members) saveAll(STORAGE_KEYS.MEMBERS, data.members);
      if (data.categories) saveAll(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.records) saveAll(STORAGE_KEYS.CLAIMS, data.records);
      if (data.settings) saveAll(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('导入分享数据失败:', e);
      return false;
    }
  },
  generateShareUrl: () => {
    const encoded = shareApi.exportData();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}#share=${encoded}`;
  },
  parseShareUrl: () => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash.startsWith('#share=')) return null;
    return hash.substring(7);
  },
};

// ============ 导出 ============

const dataService = {
  init: initDefaults,

  snacks: snackApi,
  categories: categoryApi,
  members: memberApi,
  claims: claimApi,
  quota: quotaApi,
  settings: settingsApi,
  recommendations: recommendApi,
  share: shareApi,

  // 工具函数
  calculateQuotaCost,
};

export default dataService;
