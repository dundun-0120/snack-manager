import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEcommerceRanking,
  getHealthySnacks,
  getBestValueSnacks,
  getTopSalesSnacks,
  getChildFavoriteSnacks,
  getCategories,
  clearEcommerceCache
} from '../services/ecommerceApi';
import { getAIRecommendations } from '../services/aiRecommendService';
import useSnackStore from '../stores/snackStore';
import useSettingsStore from '../stores/settingsStore';
import './Recommend.css';

function Recommend() {
  const navigate = useNavigate();
  const { snacks, fetchSnacks } = useSnackStore();
  const { aiConfig } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankings, setRankings] = useState({
    topSales: [],
    healthy: [],
    bestValue: [],
    childFavorite: [],
    all: []
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('composite');

  const [aiRecommend, setAiRecommend] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [topSales, healthy, bestValue, childFavorite, all, cats] = await Promise.all([
        getTopSalesSnacks(5),
        getHealthySnacks(5),
        getBestValueSnacks(5),
        getChildFavoriteSnacks(5),
        getEcommerceRanking({ limit: 15 }),
        getCategories()
      ]);
      setRankings({ topSales, healthy, bestValue, childFavorite, all });
      setCategories(cats);
    } catch (err) {
      setError('获取电商数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchSnacks();
  }, []);

  const loadAIRecommend = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await getAIRecommendations(
        snacks,
        aiConfig?.model || 'qwen',
        aiConfig?.apiKey || ''
      );
      setAiRecommend(result);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const hasFilter = selectedCategory !== 'all' || selectedPlatform !== 'all';

  const applyFilters = (data) => {
    let result = [...data];
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (selectedPlatform !== 'all') {
      result = result.filter(item => item.platform === selectedPlatform);
    }
    const sortMap = {
      composite: (a, b) => b.compositeScore - a.compositeScore,
      health: (a, b) => b.healthScore - a.healthScore,
      price: (a, b) => a.price - b.price,
      sales: (a, b) => b.sales - a.sales
    };
    return result.sort(sortMap[sortBy] || sortMap.composite);
  };

  const filteredChildFavorite = useMemo(() => {
    if (hasFilter) return applyFilters(rankings.all).filter(item => item.childFavorite).slice(0, 5);
    return rankings.childFavorite.slice(0, 5);
  }, [rankings.childFavorite, rankings.all, selectedCategory, selectedPlatform, sortBy]);

  const filteredTopSales = useMemo(() => {
    if (hasFilter) return applyFilters(rankings.all).slice(0, 5);
    return rankings.topSales.slice(0, 5);
  }, [rankings.topSales, rankings.all, selectedCategory, selectedPlatform, sortBy]);

  const filteredHealthy = useMemo(() => {
    if (hasFilter) return applyFilters(rankings.all).filter(item => item.healthScore >= 7).slice(0, 5);
    return rankings.healthy.slice(0, 5);
  }, [rankings.healthy, rankings.all, selectedCategory, selectedPlatform, sortBy]);

  const filteredBestValue = useMemo(() => {
    if (hasFilter) return applyFilters(rankings.all).filter(item => item.price <= 30 && item.rating >= 4.5).slice(0, 5);
    return rankings.bestValue.slice(0, 5);
  }, [rankings.bestValue, rankings.all, selectedCategory, selectedPlatform, sortBy]);

  const formatSales = (sales) => {
    if (sales >= 1000000) return (sales / 1000000).toFixed(1) + '万';
    if (sales >= 10000) return (sales / 10000).toFixed(1) + '万';
    return sales.toString();
  };

  const getPlatformIcon = (platform) => {
    return platform === 'taobao' ? '🍑' : '🐕';
  };

  const getPlatformName = (platform) => {
    return platform === 'taobao' ? '淘宝' : '京东';
  };

  const renderProductCard = (product, rank = null) => {
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);

    return (
      <div key={product.id} className={`ecommerce-card${product.image ? '' : ' no-image'}`}>
        {rank && <div className={`rank-badge rank-${rank}`}>TOP {rank}</div>}
        <div className="platform-badge">
          {getPlatformIcon(product.platform)} {getPlatformName(product.platform)}
        </div>
        {product.childFavorite && (
          <div className="child-favorite-badge">👶 儿童喜爱</div>
        )}
        {product.image && (
          <div className="product-image">
            <img src={product.image} alt={product.name} loading="lazy" />
          </div>
        )}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-tags">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
          <div className="product-meta">
            <div className="price-row">
              <span className="price">¥{product.price}</span>
              <span className="original-price">¥{product.originalPrice}</span>
              {discount > 0 && <span className="discount">-{discount}%</span>}
            </div>
            <div className="stats-row">
              <span className="sales">已售 {formatSales(product.sales)}</span>
              <span className="rating">⭐ {product.rating}</span>
            </div>
          </div>
          <div className="product-scores">
            <div className="score-item">
              <span className="score-label">健康</span>
              <div className="score-bar">
                <div 
                  className="score-fill health" 
                  style={{ width: `${product.healthScore * 10}%` }}
                />
              </div>
              <span className="score-value">{product.healthScore}</span>
            </div>
            <div className="score-item">
              <span className="score-label">综合</span>
              <div className="score-bar">
                <div 
                  className="score-fill composite" 
                  style={{ width: `${product.compositeScore * 10}%` }}
                />
              </div>
              <span className="score-value">{product.compositeScore}</span>
            </div>
          </div>
          <button
            className="buy-btn"
            onClick={() => {
              if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(product.purchaseUrl);
              } else {
                window.open(product.purchaseUrl, '_blank');
              }
            }}
          >
            🛒 去购买
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="recommend-page">
        <h1>🍿 零食推荐</h1>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>正在从 🍑淘宝 🐕京东 获取热销数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommend-page">
        <h1>🍿 零食推荐</h1>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h4>数据加载失败</h4>
          <p>{error}</p>
          <div className="error-actions">
            <button className="action-btn" onClick={loadData}>重新加载</button>
            <button className="action-btn secondary" onClick={() => {
              clearEcommerceCache();
              loadData();
            }}>清除缓存重试</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommend-page">
      <h1>🍿 零食推荐</h1>
      <p className="subtitle">实时获取 🍑淘宝 🐕京东 热销零食排行榜</p>

      <div className="filter-bar">
        <div className="filter-group">
          <label>平台:</label>
          <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
            <option value="all">全部平台</option>
            <option value="taobao">🍑 淘宝</option>
            <option value="jd">🐕 京东</option>
          </select>
        </div>
        <div className="filter-group">
          <label>分类:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">全部分类</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>排序:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="composite">综合推荐</option>
            <option value="health">健康优先</option>
            <option value="price">价格最低</option>
            <option value="sales">销量最高</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={() => {
          clearEcommerceCache();
          loadData();
        }} title="刷新数据">
          🔄
        </button>
      </div>

      {aiConfig?.enabled && (
        <div className="recommend-section ai-recommend">
          <h2>🤖 AI 智能推荐</h2>
          <p className="recommend-desc">基于你的零食库数据，AI 为你个性化推荐</p>
          {!aiRecommend && !aiLoading && !aiError && (
            <button className="ai-recommend-btn" onClick={loadAIRecommend}>
              🤖 点击获取 AI 推荐
            </button>
          )}
          {aiLoading && (
            <div className="ai-loading">
              <div className="loading-spinner"></div>
              <p>AI 正在分析你的零食库...</p>
            </div>
          )}
          {aiError && (
            <div className="ai-error">
              <p>❌ {aiError}</p>
              <button className="action-btn" onClick={loadAIRecommend}>重试</button>
            </div>
          )}
          {aiRecommend && (
            <div className="ai-recommend-content">
              <div className="ai-summary">
                <p>💡 {aiRecommend.summary}</p>
              </div>
              <div className="ai-recommend-list">
                {aiRecommend.recommendations.map((item, idx) => (
                  <div key={idx} className={`ai-recommend-item priority-${item.priority === '高' ? 'high' : item.priority === '低' ? 'low' : 'medium'}`}>
                    <div className="ai-item-header">
                      <span className="ai-item-index">#{idx + 1}</span>
                      <span className="ai-item-name">{item.name}</span>
                      <span className="ai-item-category">{item.category}</span>
                      <span className={`ai-item-priority ${item.priority === '高' ? 'high' : item.priority === '低' ? 'low' : 'medium'}`}>
                        {item.priority}优先
                      </span>
                    </div>
                    <div className="ai-item-reason">📝 {item.reason}</div>
                    {item.price && (
                      <div className="ai-item-price">💰 参考价: ¥{item.price}</div>
                    )}
                  </div>
                ))}
              </div>
              <button className="ai-recommend-btn secondary" onClick={loadAIRecommend}>
                🔄 重新推荐
              </button>
            </div>
          )}
        </div>
      )}

      {filteredChildFavorite.length > 0 && (
        <div className="recommend-section child-favorite">
          <h2>👶 儿童喜爱</h2>
          <p className="recommend-desc">小朋友们最爱吃的零食，家长放心选购</p>
          <div className="ecommerce-grid">
            {filteredChildFavorite.map(product => renderProductCard(product))}
          </div>
        </div>
      )}

      {filteredTopSales.length > 0 && (
        <div className="recommend-section">
          <h2>🔥 热销排行榜</h2>
          <p className="recommend-desc">淘宝京东实时热销零食 TOP5</p>
          <div className="ecommerce-grid">
            {filteredTopSales.map((product, idx) => renderProductCard(product, idx + 1))}
          </div>
        </div>
      )}

      {filteredHealthy.length > 0 && (
        <div className="recommend-section">
          <h2>💚 健康优选</h2>
          <p className="recommend-desc">健康评分 7 分以上，吃得放心</p>
          <div className="ecommerce-grid">
            {filteredHealthy.map(product => renderProductCard(product))}
          </div>
        </div>
      )}

      {filteredBestValue.length > 0 && (
        <div className="recommend-section">
          <h2>💰 高性价比</h2>
          <p className="recommend-desc">好评如潮，价格亲民</p>
          <div className="ecommerce-grid">
            {filteredBestValue.map(product => renderProductCard(product))}
          </div>
        </div>
      )}

      {filteredChildFavorite.length === 0 && filteredTopSales.length === 0 && 
       filteredHealthy.length === 0 && filteredBestValue.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h4>暂无符合条件的零食</h4>
          <p>尝试调整筛选条件看看吧</p>
        </div>
      )}

      <div className="data-source-note">
        <p>📊 数据来源：淘宝搜索 · 京东搜索</p>
        <p>💡 综合评分 = 儿童喜爱×25% + 健康度×30% + 性价比×15% + 销量×15% + 评价×15%</p>
        <p>🔗 点击"去购买"跳转到对应平台的商品搜索页</p>
      </div>
    </div>
  );
}

export default Recommend;
