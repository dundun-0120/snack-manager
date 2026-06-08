import React, { useState, useEffect, useRef } from 'react';
import useSnackStore from '../stores/snackStore';
import useSettingsStore from '../stores/settingsStore';
import { uploadAndAnalyzeImage } from '../services/aiService';
import { searchSnackPrice } from '../services/priceSearchService';
import dataService from '../services/dataService';
import './SnackForm.css';

function SnackForm({ snack, categories, onClose }) {
  const { addSnack, updateSnack } = useSnackStore();
  const { aiConfig, priceConfig } = useSettingsStore();
  const frontFileRef = useRef(null);
  const backFileRef = useRef(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingPrice, setAnalyzingPrice] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);

  // 批次相关状态
  const [tempBatches, setTempBatches] = useState([]);
  const [newBatchStock, setNewBatchStock] = useState('');
  const [newBatchDays, setNewBatchDays] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    health_score: 5,
    stock: 0,
    price: '',
    size_level: '中',
    expiry_days: '',
    purchase_link: '',
    platform_name: '',
    notes: '',
    image_url: '',
  });

  useEffect(() => {
    if (snack) {
      setFormData({
        name: snack.name || '',
        category_id: snack.category_id || '',
        health_score: snack.health_score || 5,
        stock: snack.stock || 0,
        price: snack.price || '',
        size_level: snack.size_level || '中',
        expiry_days: snack.expiry_days || '',
        purchase_link: snack.purchase_link || '',
        platform_name: snack.platform_name || '',
        notes: snack.notes || '',
        image_url: snack.image_url || '',
      });
      setFrontImage(snack.image_url || null);
    }
  }, [snack]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'health_score' || name === 'stock' || name === 'expiry_days'
        ? parseInt(value) || 0
        : value
    }));
  };

  // 批次处理函数
  const handleAddNewBatch = () => {
    if (!newBatchStock || !newBatchDays || parseInt(newBatchStock) <= 0 || parseInt(newBatchDays) <= 0) {
      alert('请输入有效的数量和剩余天数');
      return;
    }
    setTempBatches(prev => [...prev, {
      stock: parseInt(newBatchStock),
      expiry_days: parseInt(newBatchDays),
    }]);
    setNewBatchStock('');
    setNewBatchDays('');
  };

  const removeTempBatch = (idx) => {
    setTempBatches(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddBatchInline = () => {
    const stock = prompt('请输入数量：', '1');
    if (!stock || isNaN(stock) || parseInt(stock) <= 0) return;
    const days = prompt('请输入剩余天数：', '30');
    if (!days || isNaN(days) || parseInt(days) <= 0) return;

    // 更新零食的批次
    const updatedSnack = { ...snack };
    updatedSnack.stock = snack.stock + parseInt(stock);
    if (!updatedSnack.expiry_batches) {
      updatedSnack.expiry_batches = [];
    }
    updatedSnack.expiry_batches.push({
      stock: parseInt(stock),
      expiry_days: parseInt(days),
    });
    updatedSnack.expiry_days = Math.min(...updatedSnack.expiry_batches.map(b => b.expiry_days));

    // 直接更新 store
    useSnackStore.getState().updateSnack(updatedSnack);
    alert(`✅ 已添加批次：${stock}份，剩余${days}天`);
  };

  // 获取过期状态
  const getExpiryStatus = (days) => {
    if (days == null || days === undefined) return { level: 'normal', className: '', label: null };
    if (days <= 0) return { level: 'expired', className: 'expired', label: `已过期 ${Math.abs(days)} 天` };
    if (days <= 3) return { level: 'critical', className: 'critical', label: `还有 ${days} 天` };
    if (days <= 7) return { level: 'warning', className: 'warning', label: `还有 ${days} 天` };
    return { level: 'normal', className: '', label: null };
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

  // 搜索价格
  const [searchingPrice, setSearchingPrice] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);

  // 当名称变化且开启了自动搜索时，搜索价格
  const handleNameChange = async (e) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
    
    // 如果开启了自动价格搜索且名称长度大于2
    if (priceConfig?.autoSearch && name.length > 2) {
      setSearchingPrice(true);
      try {
        const result = await searchSnackPrice(name);
        setPriceInfo(result);
        setFormData(prev => ({ 
          ...prev, 
          price: result.averagePrice,
          purchase_link: result.searchUrls?.taobao || '',
        }));
      } catch (err) {
        console.error('价格搜索失败:', err);
        setPriceInfo(null);
      } finally {
        setSearchingPrice(false);
      }
    }
  };

  // 处理单张图片识别并自动填充
  const processImageResult = (result) => {
    const updates = {};
    const extracted = [];
    const failed = [];
    
    // 名称
    if (result.name) {
      updates.name = result.name;
      extracted.push('名称');
    } else {
      failed.push('名称');
    }
    
    // 分类（无法识别时自动归为"其他"）
    if (result.category) {
      const categoryId = matchCategory(result.category);
      if (categoryId) {
        updates.category_id = categoryId;
        extracted.push('分类');
      } else {
        // 无法匹配到具体分类，自动归为"其他"
        const otherCategory = categories.find(c => c.name === '其他');
        if (otherCategory) {
          updates.category_id = otherCategory.id;
          extracted.push('分类(其他)');
        } else {
          failed.push('分类');
        }
      }
    } else {
      // AI未识别出分类，自动归为"其他"
      const otherCategory = categories.find(c => c.name === '其他');
      if (otherCategory) {
        updates.category_id = otherCategory.id;
        extracted.push('分类(其他)');
      } else {
        failed.push('分类');
      }
    }
    
    // 规格（智能识别）
    if (result.sizeLevel) {
      updates.size_level = result.sizeLevel;
      extracted.push('规格');
    } else {
      failed.push('规格');
    }
    
    // 剩余天数
    if (result.expiryDays) {
      updates.expiry_days = result.expiryDays;
      extracted.push('剩余天数');
    } else {
      failed.push('剩余天数');
    }
    
    // 价格（确保正确识别单包价格）
    if (result.price != null && result.price !== 0) {
      updates.price = result.price;
      extracted.push('价格');
    } else {
      failed.push('价格');
    }
    
    // 库存（通过识别图片中零食个数）
    if (result.stockCount) {
      updates.stock = result.stockCount;
      extracted.push('库存');
    } else {
      failed.push('库存');
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
    
    return { extracted, failed };
  };

  // 处理正面图片上传
  const handleFrontUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFrontImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // 如果启用了AI，进行识别
    if (aiConfig?.enabled) {
      setAnalyzing(true);
      setExtractionResult(null);
      try {
        const result = await uploadAndAnalyzeImage(file, aiConfig.model, aiConfig.apiKey);
        const { extracted, failed } = processImageResult(result);
        
        setExtractionResult({
          extracted,
          failed,
          message: failed.length > 0 
            ? `⚠️ 以下字段未能从图片中提取：${failed.join('、')}` 
            : '✅ 所有字段已成功识别！',
        });
      } catch (err) {
        console.error('正面识别失败:', err);
        setExtractionResult({
          extracted: [],
          failed: ['全部'],
          message: `❌ AI识别失败: ${err.message || '请检查API Key配置'}`,
        });
        alert(`AI识别失败: ${err.message || '请检查API Key配置'}`);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // 处理背面图片上传（单张背面也可识别）
  const handleBackUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // 如果启用了AI，进行识别（背面也可提取所有信息）
    if (aiConfig?.enabled) {
      setAnalyzing(true);
      setExtractionResult(null);
      try {
        const result = await uploadAndAnalyzeImage(file, aiConfig.model, aiConfig.apiKey);
        const { extracted, failed } = processImageResult(result);
        
        setExtractionResult({
          extracted,
          failed,
          message: failed.length > 0 
            ? `⚠️ 以下字段未能从图片中提取：${failed.join('、')}` 
            : '✅ 所有字段已成功识别！',
        });
      } catch (err) {
        console.error('背面识别失败:', err);
        setExtractionResult({
          extracted: [],
          failed: ['全部'],
          message: `❌ AI识别失败: ${err.message || '请检查API Key配置'}`,
        });
        alert(`AI识别失败: ${err.message || '请检查API Key配置'}`);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // AI单独识别价格（与批量添加使用相同算法）
  const handleAIPriceRecognize = async () => {
    const frontFile = frontFileRef.current?.files[0];
    const backFile = backFileRef.current?.files[0];

    if (!frontFile && !backFile) {
      alert('请先上传图片');
      return;
    }

    setAnalyzingPrice(true);
    try {
      let result;
      let recognizedName = null;

      // 优先使用背面图片识别价格（价格标签通常在背面）
      if (backFile) {
        result = await uploadAndAnalyzeImage(backFile, aiConfig.model, aiConfig.apiKey);
      } else {
        result = await uploadAndAnalyzeImage(frontFile, aiConfig.model, aiConfig.apiKey);
      }

      // 记录识别到的名称
      if (result.name) {
        recognizedName = result.name;
      }

      if (result.price != null && result.price !== 0) {
        // AI 从图片识别出价格
        setFormData(prev => ({ ...prev, price: result.price }));
        alert(`✅ AI识别价格成功：¥${result.price}`);
      } else {
        // AI 无法从图片识别价格，尝试用名称搜索平均价格
        const nameToSearch = formData.name || recognizedName;
        if (nameToSearch && nameToSearch.length > 2) {
          try {
            const priceResult = await searchSnackPrice(nameToSearch);
            setPriceInfo(priceResult);
            setFormData(prev => ({
              ...prev,
              price: priceResult.averagePrice,
              purchase_link: priceResult.searchUrls?.taobao || '',
            }));
            alert(`✅ AI搜索价格成功：淘宝¥${priceResult.prices.taobao} / 京东¥${priceResult.prices.jd}，平均¥${priceResult.averagePrice}`);
          } catch (searchErr) {
            console.error('价格搜索失败:', searchErr);
            alert('⚠️ 未能从图片识别价格，也无法搜索到参考价格，请手动输入');
          }
        } else {
          alert('⚠️ 未能从图片识别价格，请先识别零食名称或手动输入价格');
        }
      }
    } catch (err) {
      console.error('AI价格识别失败:', err);
      alert(`❌ AI价格识别失败: ${err.message || '请检查API Key配置'}`);
    } finally {
      setAnalyzingPrice(false);
    }
  };

  // 同时上传两张图片进行综合识别
  const handleBothUpload = async () => {
    const frontFile = frontFileRef.current?.files[0];
    const backFile = backFileRef.current?.files[0];
    
    if (!frontFile && !backFile) {
      alert('请至少上传一张图片');
      return;
    }

    setAnalyzing(true);
    setExtractionResult(null);
    
    try {
      let result;
      if (frontFile && backFile) {
        // 两张图片都上传，分别识别后合并
        const frontResult = await uploadAndAnalyzeImage(frontFile, aiConfig.model, aiConfig.apiKey);
        const backResult = await uploadAndAnalyzeImage(backFile, aiConfig.model, aiConfig.apiKey);
        
        // 合并结果，优先使用置信度高的
        result = {
          name: frontResult.name || backResult.name,
          category: frontResult.category || backResult.category,
          expiryDays: backResult.expiryDays || frontResult.expiryDays,
          price: backResult.price || frontResult.price,
          stockCount: backResult.stockCount || frontResult.stockCount,
        };
      } else if (frontFile) {
        result = await uploadAndAnalyzeImage(frontFile, aiConfig.model, aiConfig.apiKey);
      } else {
        result = await uploadAndAnalyzeImage(backFile, aiConfig.model, aiConfig.apiKey);
      }
      
      const { extracted, failed } = processImageResult(result);
      
      setExtractionResult({
        extracted,
        failed,
        message: failed.length > 0 
          ? `⚠️ 以下字段未能从图片中提取，请手动填写：${failed.join('、')}` 
          : '✅ 所有字段已成功识别！',
      });
    } catch (err) {
      console.error('AI识别失败:', err);
      setExtractionResult({
        extracted: [],
        failed: ['全部'],
        message: `❌ AI识别失败: ${err.message || '请检查API Key配置'}`,
      });
      alert(`AI识别失败: ${err.message || '请检查API Key配置'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证：批次或保质期任填一个即可
    const requiredFields = [
      { key: 'name', label: '名称' },
      { key: 'category_id', label: '分类' },
      { key: 'stock', label: '库存数量' },
      { key: 'price', label: '价格' },
      { key: 'size_level', label: '规格' },
    ];

    const missing = [];
    for (const field of requiredFields) {
      const val = formData[field.key];
      if (val === '' || val === null || val === undefined || val === 0) {
        missing.push(field.label);
      }
    }

    // 检查保质期：如果有批次则不需要单独的保质期
    const hasBatches = tempBatches.length > 0 || (snack?.expiry_batches && snack.expiry_batches.length > 0);
    const hasExpiryDays = formData.expiry_days && formData.expiry_days > 0;
    if (!hasBatches && !hasExpiryDays) {
      missing.push('剩余天数（或添加保质期批次）');
    }

    if (missing.length > 0) {
      alert(`请填写以下必填字段：\n${missing.join('、')}`);
      return;
    }

    const submitData = {
      ...formData,
      image_url: frontImage || backImage || formData.image_url,
      // 首次添加时包含批次数据
      expiry_batches: tempBatches.length > 0 ? tempBatches : (snack?.expiry_batches || []),
    };
    if (snack) {
      await updateSnack({ ...submitData, id: snack.id });
    } else {
      // 检查同名零食
      const existingSnack = dataService.snacks.getAll().find(s => s.name === formData.name);
      if (existingSnack) {
        const priceDiff = existingSnack.price != formData.price;
        let msg = `已存在同名零食「${formData.name}」(库存${existingSnack.stock})。\n将合并库存并添加新的保质期批次。`;
        if (priceDiff) {
          msg += `\n\n价格不同（现有¥${existingSnack.price}，新¥${formData.price}），将取平均价格¥${((parseFloat(existingSnack.price) + parseFloat(formData.price)) / 2).toFixed(2)}。`;
        }
        const confirmed = window.confirm(msg + '\n\n确认合并？');
        if (!confirmed) return;
      }
      await addSnack(submitData);
    }
    onClose();
  };

  // 是否有至少一张图片
  const hasImage = frontImage || backImage;

  return (
    <div className="modal-overlay">
      <div className="modal-content snack-form-modal">
        <div className="modal-header">
          <h2>{snack ? '编辑零食' : '添加零食'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* 双图上传区域 */}
          <div className="form-group dual-image-group">
            <label>零食图片（至少上传一张）</label>
            <div className="dual-image-upload">
              {/* 正面图片 - 可选 */}
              <div className="image-upload-box">
                <input
                  type="file"
                  ref={frontFileRef}
                  onChange={handleFrontUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div className="image-upload-area" onClick={() => frontFileRef.current?.click()}>
                  {frontImage ? (
                    <img src={frontImage} alt="正面" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">正面图片</span>
                      <span className="upload-hint">（可选）</span>
                    </div>
                  )}
                </div>
                <span className="image-label">正面（可选）</span>
              </div>
              
              {/* 背面图片 - 也可识别所有信息 */}
              <div className="image-upload-box">
                <input
                  type="file"
                  ref={backFileRef}
                  onChange={handleBackUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div className="image-upload-area" onClick={() => backFileRef.current?.click()}>
                  {backImage ? (
                    <img src={backImage} alt="背面" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">背面图片</span>
                      <span className="upload-hint">（也可识别所有信息）</span>
                    </div>
                  )}
                </div>
                <span className="image-label">背面（推荐）</span>
              </div>
            </div>
            
            {/* AI识别按钮 */}
            {aiConfig?.enabled && hasImage && (
              <button 
                type="button" 
                className="ai-analyze-btn"
                onClick={handleBothUpload}
                disabled={analyzing}
              >
                {analyzing ? '🔄 AI识别中...' : '🤖 AI智能识别'}
              </button>
            )}
            
            {/* 识别结果说明 */}
            {extractionResult && (
              <div className={`extraction-result ${extractionResult.failed?.length > 0 ? 'has-failed' : 'all-success'}`}>
                <div className="extracted-fields">
                  ✅ 已提取：{extractionResult.extracted.join('、')}
                </div>
                {extractionResult.message && (
                  <div className="failed-fields">{extractionResult.message}</div>
                )}
              </div>
            )}
            
            {analyzing && (
              <div className="analyzing-overlay-inline">
                <div className="analyzing-spinner"></div>
                <span>AI正在识别图片信息...</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>名称 *</label>
            <div className="name-input-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="AI自动识别或手动输入"
              />
              {searchingPrice && <span className="searching-indicator">🔍 搜索价格中...</span>}
            </div>
            {priceInfo && (
              <div className="price-info">
                💰 参考价格: 淘宝¥{priceInfo.prices.taobao} / 京东¥{priceInfo.prices.jd} 
                <span className="avg-price">平均¥{priceInfo.averagePrice}</span>
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>分类</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange}>
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>健康评分 (1-10)</label>
              <input
                type="number"
                name="health_score"
                min="1"
                max="10"
                value={formData.health_score}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>库存</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="AI自动识别图片中零食个数"
              />
            </div>
            
            <div className="form-group">
              <label>价格 (¥)</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="AI自动识别或手动输入"
                />
                {aiConfig?.enabled && (frontImage || backImage) && (
                  <button
                    type="button"
                    className="ai-price-btn"
                    onClick={handleAIPriceRecognize}
                    disabled={analyzingPrice}
                  >
                    {analyzingPrice ? '识别中...' : '🤖 AI识别价格'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>大小</label>
              <select name="size_level" value={formData.size_level} onChange={handleChange}>
                <option value="小">小</option>
                <option value="中">中</option>
                <option value="大">大</option>
                <option value="特大">特大</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>剩余天数</label>
              <input
                type="number"
                name="expiry_days"
                value={formData.expiry_days}
                onChange={handleChange}
                placeholder="AI自动识别或手动输入"
              />
            </div>
          </div>

          {/* 批次显示和添加功能 */}
          {snack && snack.expiry_batches && snack.expiry_batches.length > 0 && (
            <div className="form-group">
              <label>保质期批次</label>
              <div className="batches-display">
                {snack.expiry_batches.map((batch, idx) => {
                  const status = getExpiryStatus(batch.expiry_days);
                  return (
                    <div key={idx} className={`batch-item ${status.className}`}>
                      <span className="batch-stock">{batch.stock}份</span>
                      <span className={`batch-expiry ${status.level}`}>
                        {status.label || `剩余${batch.expiry_days}天`}
                      </span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="add-batch-inline-btn"
                  onClick={handleAddBatchInline}
                >
                  + 添加新批次
                </button>
              </div>
            </div>
          )}

          {/* 首次添加时的批次功能 */}
          {!snack && (
            <div className="form-group">
              <label>保质期批次（可选）</label>
              <div className="batch-add-section">
                <div className="batch-input-row">
                  <input
                    type="number"
                    placeholder="数量"
                    value={newBatchStock}
                    onChange={(e) => setNewBatchStock(e.target.value)}
                    className="batch-stock-input"
                  />
                  <input
                    type="number"
                    placeholder="剩余天数"
                    value={newBatchDays}
                    onChange={(e) => setNewBatchDays(e.target.value)}
                    className="batch-days-input"
                  />
                  <button
                    type="button"
                    className="add-batch-btn"
                    onClick={handleAddNewBatch}
                  >
                    + 添加批次
                  </button>
                </div>
                {tempBatches.length > 0 && (
                  <div className="temp-batches-list">
                    {tempBatches.map((batch, idx) => (
                      <div key={idx} className="temp-batch-item">
                        <span>{batch.stock}份，剩余{batch.expiry_days}天</span>
                        <button
                          type="button"
                          className="remove-batch-btn"
                          onClick={() => removeTempBatch(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>购买链接</label>
            <input
              type="url"
              name="purchase_link"
              value={formData.purchase_link}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          
          <div className="form-group">
            <label>购买平台</label>
            <input
              type="text"
              name="platform_name"
              value={formData.platform_name}
              onChange={handleChange}
              placeholder="淘宝、京东等"
            />
          </div>
          
          <div className="form-group">
            <label>备注</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SnackForm;
