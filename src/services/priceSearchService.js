// 电商价格搜索服务
// 支持淘宝、京东等平台的价格查询

// 模拟价格数据库（实际使用时应该调用真实API）
const MOCK_PRICE_DATABASE = {
  '奥利奥': { taobao: 12.9, jd: 13.5, avg: 13.2 },
  '乐事薯片': { taobao: 8.5, jd: 9.0, avg: 8.75 },
  '旺旺仙贝': { taobao: 15.0, jd: 14.8, avg: 14.9 },
  '好丽友': { taobao: 18.9, jd: 19.5, avg: 19.2 },
  '卫龙': { taobao: 3.5, jd: 3.8, avg: 3.65 },
  '三只松鼠': { taobao: 25.9, jd: 26.5, avg: 26.2 },
  '薯片': { taobao: 10.0, jd: 10.5, avg: 10.25 },
  '饼干': { taobao: 8.0, jd: 8.5, avg: 8.25 },
  '糖果': { taobao: 5.0, jd: 5.5, avg: 5.25 },
  '巧克力': { taobao: 15.0, jd: 16.0, avg: 15.5 },
  '坚果': { taobao: 20.0, jd: 21.5, avg: 20.75 },
  '果干': { taobao: 12.0, jd: 13.0, avg: 12.5 },
  '肉干': { taobao: 25.0, jd: 26.0, avg: 25.5 },
  '饮料': { taobao: 3.0, jd: 3.5, avg: 3.25 },
  '糕点': { taobao: 10.0, jd: 11.0, avg: 10.5 },
  '膨化': { taobao: 7.0, jd: 7.5, avg: 7.25 },
};

// 基于名称生成固定价格（不使用随机数，确保同一名称每次结果相同）
const generateStablePrice = (snackName) => {
  let hash = 0;
  for (let i = 0; i < snackName.length; i++) {
    const char = snackName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转为32位整数
  }
  // 使用哈希值生成 5~25 之间的固定价格
  const basePrice = 5 + (Math.abs(hash) % 200) / 10;
  return basePrice.toFixed(2);
};

// 从名称中提取关键词匹配价格
const matchPriceFromDatabase = (snackName) => {
  if (!snackName) return null;
  
  // 直接匹配
  if (MOCK_PRICE_DATABASE[snackName]) {
    return MOCK_PRICE_DATABASE[snackName];
  }
  
  // 关键词匹配
  for (const [keyword, prices] of Object.entries(MOCK_PRICE_DATABASE)) {
    if (snackName.includes(keyword)) {
      return prices;
    }
  }
  
  return null;
};

// 模拟淘宝搜索API
const searchTaobao = async (snackName) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const price = matchPriceFromDatabase(snackName);
  if (price) {
    return {
      platform: '淘宝',
      price: price.taobao,
      url: `https://s.taobao.com/search?q=${encodeURIComponent(snackName)}`,
    };
  }
  
  // 未找到时使用基于名称的固定价格
  const stablePrice = generateStablePrice(snackName);
  return {
    platform: '淘宝',
    price: stablePrice,
    url: `https://s.taobao.com/search?q=${encodeURIComponent(snackName)}`,
  };
};

// 模拟京东搜索API
const searchJD = async (snackName) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const price = matchPriceFromDatabase(snackName);
  if (price) {
    return {
      platform: '京东',
      price: price.jd,
      url: `https://search.jd.com/Search?keyword=${encodeURIComponent(snackName)}`,
    };
  }
  
  // 未找到时使用基于名称的固定价格（比淘宝略高）
  const stablePrice = generateStablePrice(snackName);
  return {
    platform: '京东',
    price: (parseFloat(stablePrice) + 0.5).toFixed(2),
    url: `https://search.jd.com/Search?keyword=${encodeURIComponent(snackName)}`,
  };
};

// 搜索多个平台获取平均价格
export const searchSnackPrice = async (snackName) => {
  if (!snackName || snackName.trim() === '') {
    throw new Error('零食名称不能为空');
  }
  
  try {
    // 并行搜索多个平台
    const [taobaoResult, jdResult] = await Promise.all([
      searchTaobao(snackName),
      searchJD(snackName),
    ]);
    
    const prices = [
      parseFloat(taobaoResult.price),
      parseFloat(jdResult.price),
    ].filter(p => !isNaN(p) && p > 0);
    
    if (prices.length === 0) {
      throw new Error('未能获取到有效价格');
    }
    
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    
    return {
      name: snackName,
      averagePrice: avgPrice,
      prices: {
        taobao: taobaoResult.price,
        jd: jdResult.price,
      },
      searchUrls: {
        taobao: taobaoResult.url,
        jd: jdResult.url,
      },
      source: '联网搜索',
    };
  } catch (err) {
    console.error('价格搜索失败:', err);
    throw new Error(`价格搜索失败: ${err.message}`);
  }
};

// 批量搜索价格
export const searchBatchPrices = async (snackNames) => {
  const results = [];
  
  for (const name of snackNames) {
    try {
      const result = await searchSnackPrice(name);
      results.push(result);
    } catch (err) {
      results.push({
        name,
        error: err.message,
        averagePrice: null,
      });
    }
  }
  
  return results;
};

export default {
  searchSnackPrice,
  searchBatchPrices,
};
