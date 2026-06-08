// 本地零食价格数据库
// 用于在没有API搜索结果时提供参考价格

const STORAGE_KEY = 'snack_price_db';

// 默认价格数据库（常见零食）
const DEFAULT_PRICE_DB = {
  // 饼干类
  '旺旺雪饼': { price: 3.5, unit: '单包', category: '饼干' },
  '旺旺仙贝': { price: 3.5, unit: '单包', category: '饼干' },
  '奥利奥': { price: 5.5, unit: '单包', category: '饼干' },
  '好丽友派': { price: 4.5, unit: '单包', category: '饼干' },
  '趣多多': { price: 5.0, unit: '单包', category: '饼干' },
  
  // 薯片类
  '乐事薯片': { price: 5.5, unit: '单包', category: '薯片' },
  '可比克薯片': { price: 4.0, unit: '单包', category: '薯片' },
  '薯片': { price: 5.0, unit: '单包', category: '薯片' },
  
  // 糖果类
  '阿尔卑斯': { price: 2.0, unit: '单包', category: '糖果' },
  '大白兔奶糖': { price: 3.0, unit: '单包', category: '糖果' },
  '徐福记糖果': { price: 3.5, unit: '单包', category: '糖果' },
  
  // 巧克力类
  '德芙巧克力': { price: 8.0, unit: '单包', category: '巧克力' },
  '费列罗': { price: 2.5, unit: '单个', category: '巧克力' },
  '士力架': { price: 3.0, unit: '单包', category: '巧克力' },
  
  // 坚果类
  '洽洽瓜子': { price: 6.0, unit: '单包', category: '坚果' },
  '三只松鼠坚果': { price: 8.0, unit: '单包', category: '坚果' },
  
  // 膨化类
  '旺旺小小酥': { price: 3.0, unit: '单包', category: '膨化' },
  '上好佳': { price: 3.5, unit: '单包', category: '膨化' },
  
  // 糕点类
  '达利园蛋黄派': { price: 4.0, unit: '单包', category: '糕点' },
  
  // 肉干类
  '棒棒娃牛肉干': { price: 8.0, unit: '单包', category: '肉干' },
  
  // 果干类
  '良品铺子果干': { price: 6.0, unit: '单包', category: '果干' },
};

// 获取价格数据库
const getPriceDB = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_PRICE_DB, ...parsed };
    }
  } catch {}
  return DEFAULT_PRICE_DB;
};

// 保存价格数据库
const savePriceDB = (db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
};

// 查询零食价格（支持模糊匹配）
export const searchLocalPrice = (snackName) => {
  if (!snackName) return null;
  
  const db = getPriceDB();
  
  // 1. 精确匹配
  if (db[snackName]) {
    return db[snackName].price;
  }
  
  // 2. 包含匹配（零食名称包含数据库中的关键词）
  for (const [key, value] of Object.entries(db)) {
    if (snackName.includes(key) || key.includes(snackName)) {
      return value.price;
    }
  }
  
  // 3. 分类推断（根据零食名称中的关键词推断价格范围）
  const categoryPrices = {
    '饼干': 4.5,
    '薯片': 5.0,
    '糖果': 2.5,
    '巧克力': 6.0,
    '坚果': 7.0,
    '膨化': 3.5,
    '糕点': 4.0,
    '肉干': 8.0,
    '果干': 6.0,
    '饮料': 3.0,
  };
  
  for (const [category, price] of Object.entries(categoryPrices)) {
    if (snackName.includes(category)) {
      return price;
    }
  }
  
  return null;
};

// 添加/更新零食价格
export const updateLocalPrice = (snackName, price, unit = '单包', category = '') => {
  const db = getPriceDB();
  db[snackName] = { price, unit, category };
  savePriceDB(db);
};

// 删除零食价格
export const deleteLocalPrice = (snackName) => {
  const db = getPriceDB();
  delete db[snackName];
  savePriceDB(db);
};

// 获取所有价格数据
export const getAllPrices = () => {
  return getPriceDB();
};

// 重置价格数据库
export const resetPriceDB = () => {
  savePriceDB(DEFAULT_PRICE_DB);
};

export default {
  searchLocalPrice,
  updateLocalPrice,
  deleteLocalPrice,
  getAllPrices,
  resetPriceDB,
};