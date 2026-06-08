import React, { useState, useRef } from 'react';
import useSnackStore from '../stores/snackStore';
import useSettingsStore from '../stores/settingsStore';
import { analyzeSnackImageWithAI } from '../services/aiService';
import { searchSnackPrice } from '../services/priceSearchService';
import './BatchAddSnacks.css';

function BatchAddSnacks({ categories, onClose, onSuccess }) {
  const { addSnack } = useSnackStore();
  const { aiConfig, priceConfig } = useSettingsStore();
  const fileInputRef = useRef(null);
  
  const [images, setImages] = useState([]); // [{ file, preview, result, status }]
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalyzing, setCurrentAnalyzing] = useState(-1);

  // 处理多图上传
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newImages = files.map(file => ({
      file,
      preview: null,
      result: null,
      status: 'pending', // pending, analyzing, done, error
    }));
    
    // 读取预览
    newImages.forEach((img, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => prev.map((item, i) => 
          i === prev.length - newImages.length + index 
            ? { ...item, preview: event.target.result }
            : item
        ));
      };
      reader.readAsDataURL(img.file);
    });
    
    setImages(prev => [...prev, ...newImages]);
  };

  // 根据分类名称匹配分类ID
  const matchCategory = (categoryName) => {
    if (!categoryName) return null;
    const matched = categories.find(c => 
      c.name === categoryName || 
      categoryName.includes(c.name) || 
      c.name.includes(categoryName)
    );
    return matched?.id || null;
  };

  // 批量AI识别
  const handleBatchAnalyze = async () => {
    if (!aiConfig?.enabled || !aiConfig?.apiKey) {
      alert('请先在系统设置中配置AI模型和API Key');
      return;
    }
    
    if (images.length === 0) {
      alert('请先上传图片');
      return;
    }
    
    setAnalyzing(true);
    
    for (let i = 0; i < images.length; i++) {
      setCurrentAnalyzing(i);
      
      try {
        setImages(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'analyzing' } : item
        ));
        
        const result = await analyzeSnackImageWithAI(images[i].file, aiConfig.model, aiConfig.apiKey);

        // 匹配分类
        const categoryId = result.category ? matchCategory(result.category) : null;

        // 如果AI没有识别出价格，自动搜索价格
        let finalPrice = result.price;
        if ((!finalPrice || finalPrice === 0) && result.name) {
          try {
            const priceResult = await searchSnackPrice(result.name);
            finalPrice = priceResult.averagePrice;
          } catch (err) {
            console.error(`搜索 ${result.name} 价格失败:`, err);
          }
        }

        setImages(prev => prev.map((item, idx) =>
          idx === i ? {
            ...item,
            result: {
              ...result,
              category_id: categoryId,
              price: finalPrice,
            },
            status: 'done',
          } : item
        ));
      } catch (err) {
        console.error(`图片 ${i + 1} 识别失败:`, err);
        setImages(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            result: { error: err.message },
            status: 'error',
          } : item
        ));
      }
    }
    
    setAnalyzing(false);
    setCurrentAnalyzing(-1);
  };

  // 修改单个结果
  const updateResult = (index, field, value) => {
    setImages(prev => prev.map((item, idx) =>
      idx === index ? {
        ...item,
        result: { ...item.result, [field]: value },
      } : item
    ));
  };

  // 批量保存
  const handleBatchSave = async () => {
    const validImages = images.filter(img => img.status === 'done' && img.result?.name);

    if (validImages.length === 0) {
      alert('没有可保存的零食数据，请确保AI识别成功且名称已填写');
      return;
    }

    // 验证每个零食的必填字段（剩余天数可选，默认30天）
    const requiredFields = [
      { key: 'sizeLevel', label: '规格' },
      { key: 'price', label: '价格' },
      { key: 'stockCount', label: '库存' },
    ];

    const invalidImages = [];
    for (let i = 0; i < validImages.length; i++) {
      const img = validImages[i];
      const missing = [];
      for (const field of requiredFields) {
        const val = img.result[field.key];
        if (!val || val === '' || val === 0) {
          missing.push(field.label);
        }
      }
      if (missing.length > 0) {
        invalidImages.push(`第${i + 1}个「${img.result.name}」: ${missing.join('、')}未填写`);
      }
    }

    if (invalidImages.length > 0) {
      alert(`以下零食必填字段未填写，请补充后再保存：\n\n${invalidImages.join('\n')}`);
      return;
    }

    for (const img of validImages) {
      await addSnack({
        name: img.result.name,
        category_id: img.result.category_id || '',
        health_score: img.result.healthScore || 5,
        stock: img.result.stockCount || 1,
        price: img.result.price || '',
        size_level: img.result.sizeLevel || '中',
        expiry_days: img.result.expiryDays || 30, // 默认30天
        purchase_link: '',
        platform_name: '',
        notes: '',
        image_url: img.preview,
      });
    }

    onSuccess();
  };

  // 删除单个图片
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // 添加更多图片
  const addMoreImages = () => {
    fileInputRef.current?.click();
  };

  // 获取需要手动填写的字段
  const getMissingFields = (result) => {
    if (!result) return ['等待识别'];
    const missing = [];
    if (!result.name) missing.push('名称');
    if (!result.category_id) missing.push('分类');
    if (!result.sizeLevel) missing.push('规格');
    if (!result.expiryDays) missing.push('剩余天数');
    if (!result.price) missing.push('价格');
    if (!result.stockCount) missing.push('库存');
    return missing.length > 0 ? missing : ['已完整'];
  };

  return (
    <div className="modal-overlay batch-add-overlay">
      <div className="modal-content batch-add-modal">
        <div className="modal-header">
          <h2>📦 批量添加零食</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="batch-add-content">
          {/* 上传区域 */}
          <div className="upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <span className="upload-icon">📷</span>
              <span className="upload-text">点击上传多张零食图片</span>
              <span className="upload-hint">支持批量上传，AI自动识别</span>
            </div>
            
            {images.length > 0 && (
              <button className="add-more-btn" onClick={addMoreImages}>
                + 添加更多图片
              </button>
            )}
          </div>
          
          {/* AI识别按钮 */}
          {images.length > 0 && aiConfig?.enabled && (
            <div className="analyze-section">
              <button 
                className="analyze-btn"
                onClick={handleBatchAnalyze}
                disabled={analyzing}
              >
                {analyzing ? `🔄 正在识别第 ${currentAnalyzing + 1}/${images.length} 张...` : '🤖 AI批量识别'}
              </button>
              
              {!aiConfig?.apiKey && (
                <div className="warning-text">
                  ⚠️ 请先在系统设置中配置API Key
                </div>
              )}
            </div>
          )}
          
          {/* 图片表格 */}
          {images.length > 0 && (
            <div className="images-table-section">
              <h3>识别结果列表</h3>
              <div className="images-table">
                <table>
                  <thead>
                    <tr>
                      <th>图片</th>
                      <th>名称 *</th>
                      <th>分类</th>
                      <th>规格</th>
                      <th>库存</th>
                      <th>价格</th>
                      <th>剩余天数</th>
                      <th>需手动填写</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {images.map((img, index) => (
                      <tr key={index} className={img.status === 'analyzing' ? 'analyzing-row' : ''}>
                        <td>
                          {img.preview && (
                            <img src={img.preview} alt={`图片${index + 1}`} className="table-preview" />
                          )}
                        </td>
                        <td>
                          {img.status === 'done' ? (
                            <input
                              type="text"
                              value={img.result?.name || ''}
                              onChange={(e) => updateResult(index, 'name', e.target.value)}
                              className="table-input name-input"
                              placeholder="必填"
                              title={img.result?.name || ''}
                            />
                          ) : img.status === 'analyzing' ? (
                            <span className="analyzing-text">识别中...</span>
                          ) : (
                            <span className="pending-text">等待识别</span>
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <select
                              value={img.result?.category_id || ''}
                              onChange={(e) => updateResult(index, 'category_id', e.target.value)}
                              className="table-select"
                            >
                              <option value="">选择</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <select
                              value={img.result?.sizeLevel || '中'}
                              onChange={(e) => updateResult(index, 'sizeLevel', e.target.value)}
                              className="table-select small"
                            >
                              <option value="小">小</option>
                              <option value="中">中</option>
                              <option value="大">大</option>
                              <option value="特大">特大</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <input
                              type="number"
                              value={img.result?.stockCount || ''}
                              onChange={(e) => updateResult(index, 'stockCount', parseInt(e.target.value) || 0)}
                              className="table-input small"
                              min="0"
                            />
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <input
                              type="number"
                              value={img.result?.price || ''}
                              onChange={(e) => updateResult(index, 'price', e.target.value)}
                              className="table-input small"
                              step="0.01"
                            />
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <input
                              type="number"
                              value={img.result?.expiryDays || ''}
                              onChange={(e) => updateResult(index, 'expiryDays', parseInt(e.target.value) || '')}
                              className="table-input small"
                            />
                          )}
                        </td>
                        <td>
                          {img.status === 'done' && (
                            <span className={`missing-fields ${getMissingFields(img.result).includes('已完整') ? 'complete' : 'incomplete'}`}>
                              {getMissingFields(img.result).join('、')}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${img.status}`}>
                            {img.status === 'pending' && '⏳ 待识别'}
                            {img.status === 'analyzing' && '🔄 识别中'}
                            {img.status === 'done' && '✅ 完成'}
                            {img.status === 'error' && '❌ 失败'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="remove-btn"
                            onClick={() => removeImage(index)}
                            disabled={analyzing}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="batch-actions">
            <button className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button 
              className="save-btn"
              onClick={handleBatchSave}
              disabled={analyzing || images.filter(i => i.status === 'done' && i.result?.name).length === 0}
            >
              保存全部 ({images.filter(i => i.status === 'done' && i.result?.name).length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchAddSnacks;