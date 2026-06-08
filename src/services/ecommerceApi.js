const CACHE_KEY = 'ecommerce_data';
const CACHE_DURATION = 30 * 60 * 1000;

const MOCK_ECOMMERCE_DATA = [
  {
    id: 'tb_001',
    platform: 'taobao',
    name: '奥利奥原味夹心饼干 97g×6包',
    price: 12.9,
    originalPrice: 18.9,
    sales: 5000000,
    rating: 4.9,
    image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Ygik8t285YJ1KOTfX_!!725677994.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 奥利奥夹心饼干',
    category: '饼干糕点',
    tags: ['经典', '夹心'],
    healthScore: 5,
    compositeScore: 8.5,
    childFavorite: true
  },
  {
    id: 'tb_002',
    platform: 'taobao',
    name: '三只松鼠每日坚果 750g 30天装',
    price: 68.9,
    originalPrice: 89.9,
    sales: 3200000,
    rating: 4.8,
    image: 'https://img.alicdn.com/imgextra/i1/2616970884/O1CN01QZvD8J1VnbpXrQ1bF_!!2616970884.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 三只松鼠每日坚果',
    category: '坚果炒货',
    tags: ['坚果', '健康'],
    healthScore: 8,
    compositeScore: 9.2,
    childFavorite: true
  },
  {
    id: 'tb_003',
    platform: 'taobao',
    name: '良品铺子手撕面包 1000g 整箱',
    price: 29.9,
    originalPrice: 45.9,
    sales: 2800000,
    rating: 4.7,
    image: 'https://img.alicdn.com/imgextra/i3/849451984/O1CN01xK8QzR1VnbqM0cFpJ_!!849451984.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 良品铺子手撕面包',
    category: '饼干糕点',
    tags: ['面包', '早餐'],
    healthScore: 6,
    compositeScore: 8.0,
    childFavorite: true
  },
  {
    id: 'tb_004',
    platform: 'taobao',
    name: '百草味芒果干 500g 零食大礼包',
    price: 19.9,
    originalPrice: 29.9,
    sales: 4500000,
    rating: 4.8,
    image: 'https://img.alicdn.com/imgextra/i2/734440298/O1CN01aR5X0R1VnbrEJyKxL_!!734440298.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 百草味芒果干',
    category: '果干蜜饯',
    tags: ['果干', '酸甜'],
    healthScore: 7,
    compositeScore: 8.8,
    childFavorite: true
  },
  {
    id: 'tb_005',
    platform: 'taobao',
    name: '旺旺雪饼 540g 家庭装',
    price: 15.9,
    originalPrice: 22.9,
    sales: 6800000,
    rating: 4.9,
    image: 'https://img.alicdn.com/imgextra/i4/2200684535/O1CN01pKzY8J1VnbsG0L5xK_!!2200684535.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 旺旺雪饼',
    category: '膨化食品',
    tags: ['经典', '酥脆'],
    healthScore: 4,
    compositeScore: 7.5,
    childFavorite: true
  },
  {
    id: 'tb_006',
    platform: 'taobao',
    name: '卫龙辣条大面筋 106g×5袋',
    price: 9.9,
    originalPrice: 15.9,
    sales: 8900000,
    rating: 4.7,
    image: 'https://img.alicdn.com/imgextra/i3/886667741/O1CN01lM8z0R1Vnbt5XkQzR_!!886667741.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 卫龙辣条',
    category: '肉类零食',
    tags: ['辣味', '经典'],
    healthScore: 3,
    compositeScore: 7.0,
    childFavorite: false
  },
  {
    id: 'tb_007',
    platform: 'taobao',
    name: '盼盼法式小面包 1000g 整箱',
    price: 22.9,
    originalPrice: 32.9,
    sales: 3500000,
    rating: 4.6,
    image: 'https://img.alicdn.com/imgextra/i2/1658843579/O1CN01dW5rVJ1VnbuL3kP8K_!!1658843579.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 盼盼法式小面包',
    category: '饼干糕点',
    tags: ['面包', '早餐'],
    healthScore: 5,
    compositeScore: 7.8,
    childFavorite: true
  },
  {
    id: 'tb_008',
    platform: 'taobao',
    name: '喜之郎果冻爽 150g×10杯',
    price: 16.9,
    originalPrice: 24.9,
    sales: 4200000,
    rating: 4.8,
    image: 'https://img.alicdn.com/imgextra/i1/33182358/O1CN01jR5X0R1VnbvK0L5xK_!!33182358.jpg_300x300.jpg',
    purchaseUrl: 'https://s.taobao.com/search?q= 喜之郎果冻',
    category: '糖果果冻',
    tags: ['果冻', '儿童'],
    healthScore: 4,
    compositeScore: 7.2,
    childFavorite: true
  },
  {
    id: 'jd_001',
    platform: 'jd',
    name: '乐事薯片原味 104g×5袋',
    price: 25.9,
    originalPrice: 35.9,
    sales: 7200000,
    rating: 4.8,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/19431/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 乐事薯片',
    category: '膨化食品',
    tags: ['薯片', '经典'],
    healthScore: 3,
    compositeScore: 7.5,
    childFavorite: true
  },
  {
    id: 'jd_002',
    platform: 'jd',
    name: '德芙丝滑牛奶巧克力 252g',
    price: 39.9,
    originalPrice: 49.9,
    sales: 2800000,
    rating: 4.9,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/123456/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 德芙巧克力',
    category: '糖果巧克力',
    tags: ['巧克力', '丝滑'],
    healthScore: 4,
    compositeScore: 8.0,
    childFavorite: true
  },
  {
    id: 'jd_003',
    platform: 'jd',
    name: '百草味混合坚果仁 500g',
    price: 35.9,
    originalPrice: 49.9,
    sales: 2100000,
    rating: 4.8,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/65432/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 百草味混合坚果',
    category: '坚果炒货',
    tags: ['坚果', '混合'],
    healthScore: 8,
    compositeScore: 9.0,
    childFavorite: false
  },
  {
    id: 'jd_004',
    platform: 'jd',
    name: '好丽友派 660g 12枚装',
    price: 28.9,
    originalPrice: 38.9,
    sales: 3900000,
    rating: 4.7,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/98765/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 好丽友派',
    category: '饼干糕点',
    tags: ['蛋糕', '夹心'],
    healthScore: 4,
    compositeScore: 7.6,
    childFavorite: true
  },
  {
    id: 'jd_005',
    platform: 'jd',
    name: '费列罗榛果巧克力 200g 15粒',
    price: 49.9,
    originalPrice: 62.9,
    sales: 1800000,
    rating: 4.9,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/11111/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 费列罗巧克力',
    category: '糖果巧克力',
    tags: ['巧克力', '榛果'],
    healthScore: 4,
    compositeScore: 8.2,
    childFavorite: false
  },
  {
    id: 'jd_006',
    platform: 'jd',
    name: '恰恰香瓜子 308g×3袋',
    price: 18.9,
    originalPrice: 26.9,
    sales: 5600000,
    rating: 4.7,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/22222/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 恰恰香瓜子',
    category: '坚果炒货',
    tags: ['瓜子', '经典'],
    healthScore: 5,
    compositeScore: 7.8,
    childFavorite: false
  },
  {
    id: 'jd_007',
    platform: 'jd',
    name: '旺仔牛奶 245ml×16罐 整箱',
    price: 39.9,
    originalPrice: 52.9,
    sales: 6100000,
    rating: 4.9,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/33333/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 旺仔牛奶',
    category: '乳饮冲调',
    tags: ['牛奶', '儿童'],
    healthScore: 7,
    compositeScore: 8.8,
    childFavorite: true
  },
  {
    id: 'jd_008',
    platform: 'jd',
    name: '波力海苔 36g×8袋 芝士味',
    price: 32.9,
    originalPrice: 45.9,
    sales: 1500000,
    rating: 4.6,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/44444/24/23610/179634/64b8e0c8F5c3f6e0b/efb4a3e5e5a7d5d0.jpg',
    purchaseUrl: 'https://search.jd.com/Search?keyword= 波力海苔',
    category: '海味零食',
    tags: ['海苔', '芝士'],
    healthScore: 7,
    compositeScore: 8.0,
    childFavorite: false
  }
];

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {}
  return null;
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
}

export function clearEcommerceCache() {
  localStorage.removeItem(CACHE_KEY);
}

export async function getEcommerceRanking(options = {}) {
  const cached = getCache();
  if (cached) return cached;

  const limit = options.limit || 20;
  let data = [...MOCK_ECOMMERCE_DATA];

  if (options.platform) {
    data = data.filter(item => item.platform === options.platform);
  }

  if (options.category) {
    data = data.filter(item => item.category === options.category);
  }

  data.sort((a, b) => b.compositeScore - a.compositeScore);

  const result = data.slice(0, limit);
  setCache(result);
  return result;
}

export async function getTopSalesSnacks(limit = 5) {
  const cached = getCache();
  if (cached) return [...cached].sort((a, b) => b.sales - a.sales).slice(0, limit);

  return [...MOCK_ECOMMERCE_DATA]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export async function getHealthySnacks(limit = 5) {
  const cached = getCache();
  if (cached) return [...cached].filter(item => item.healthScore >= 7).sort((a, b) => b.healthScore - a.healthScore).slice(0, limit);

  return [...MOCK_ECOMMERCE_DATA]
    .filter(item => item.healthScore >= 7)
    .sort((a, b) => b.healthScore - a.healthScore)
    .slice(0, limit);
}

export async function getBestValueSnacks(limit = 5) {
  const cached = getCache();
  if (cached) return [...cached].filter(item => item.price <= 30 && item.rating >= 4.5).sort((a, b) => b.rating - a.rating).slice(0, limit);

  return [...MOCK_ECOMMERCE_DATA]
    .filter(item => item.price <= 30 && item.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getChildFavoriteSnacks(limit = 5) {
  const cached = getCache();
  if (cached) return [...cached].filter(item => item.childFavorite).sort((a, b) => b.compositeScore - a.compositeScore).slice(0, limit);

  return [...MOCK_ECOMMERCE_DATA]
    .filter(item => item.childFavorite)
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, limit);
}

export async function getCategories() {
  const categories = {};
  MOCK_ECOMMERCE_DATA.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = { name: item.category, count: 0 };
    }
    categories[item.category].count++;
  });
  return Object.values(categories).sort((a, b) => b.count - a.count);
}
