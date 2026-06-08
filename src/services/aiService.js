import { verifySnackName, isInvalidName } from './aiRecommendService';
import { searchLocalPrice } from './snackPriceDB';

// 使用千问API联网搜索零食真实价格
const searchSnackPriceWithAI = async (snackName, modelKey, apiKey) => {
  if (!apiKey) return null;

  const PRICE_SEARCH_PROMPT = `请使用互联网搜索"${snackName}"的单包零售价格，并只返回一个数字（单位：元），不要有任何其他文字。

要求：
1. 在淘宝、京东等电商平台搜索该零食的单包价格
2. 返回单包/单袋的价格（不是整箱价格，不是整盒价格）
3. 如果价格有区间，返回平均价格
4. 只返回数字，例如：3.5
5. 如果无法找到价格，返回0`;

  try {
    const modelConfig = AI_MODELS[modelKey] || AI_MODELS.qwen;

    const requestBody = {
      model: modelKey === 'qwen' ? 'qwen-max' : modelConfig.visionModel,
      messages: [
        {
          role: 'user',
          content: PRICE_SEARCH_PROMPT,
        },
      ],
      temperature: 0.1,
    };

    // 千问模型添加联网搜索参数
    if (modelKey === 'qwen') {
      requestBody.enable_search = true;
    }

    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log(`联网搜索结果: ${snackName} => ${content}`);

    // 提取数字
    const match = content.match(/(\d+\.?\d*)/);
    if (match) {
      const price = parseFloat(match[1]);
      // 价格合理性检查：单包零食价格应该在0.5-20元之间
      if (price >= 0.5 && price <= 20) {
        return price;
      }
      // 如果价格异常，可能是整箱价格，尝试修正
      if (price > 20) {
        const possibleCounts = [2, 4, 6, 8, 10, 12, 16, 20, 24];
        for (const count of possibleCounts) {
          const singlePrice = price / count;
          if (singlePrice >= 0.5 && singlePrice <= 20) {
            console.log(`价格修正: ¥${price} ÷ ${count} = ¥${singlePrice.toFixed(2)}`);
            return parseFloat(singlePrice.toFixed(2));
          }
        }
      }
      return price > 0 ? price : null;
    }
    return null;
  } catch (err) {
    console.error('AI联网搜索价格失败:', err);
    return null;
  }
};

// AI 模型服务
// 支持通义千问、ChatGPT、豆包、谷歌AI
// 通义千问使用 OpenAI 兼容接口

const AI_MODELS = {
  qwen: {
    name: '通义千问',
    icon: '🔴',
    // 使用 OpenAI 兼容接口
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    visionModel: 'qwen-vl-max',
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: '🟢',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    visionModel: 'gpt-4o',
  },
  doubao: {
    name: '豆包',
    icon: '🔵',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    visionModel: 'doubao-vision',
  },
  gemini: {
    name: 'Google AI',
    icon: '🟣',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    visionModel: 'gemini-2.0-flash',
  },
};

// 零食分类关键词映射
const CATEGORY_KEYWORDS = {
  '饼干': ['饼干', '曲奇', '奥利奥', '苏打', '夹心饼', '威化'],
  '薯片': ['薯片', '薯条', '脆片', '乐事', '可比克'],
  '糖果': ['糖果', '软糖', '硬糖', '棒棒糖', '口香糖'],
  '巧克力': ['巧克力', '可可', '德芙', '费列罗', '健达', '士力架'],
  '坚果': ['坚果', '瓜子', '花生', '核桃', '杏仁', '腰果', '开心果'],
  '糕点': ['糕点', '蛋糕', '面包', '派', '好丽友', '蛋黄派'],
  '肉干': ['肉干', '牛肉干', '猪肉脯', '肉松', '火腿'],
  '果干': ['果干', '果脯', '蜜饯', '芒果干', '葡萄干', '话梅'],
  '饮料': ['饮料', '果汁', '牛奶', '酸奶', '奶茶', '汽水'],
  '膨化': ['膨化', '虾条', '仙贝', '雪饼', '旺旺', '妙脆角'],
  '其他': [],
};

// 根据名称推断分类
const inferCategory = (name) => {
  if (!name) return null;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return category;
      }
    }
  }
  return '其他';
};

// 零食规格关键词映射（从名称或包装推断）
const SIZE_KEYWORDS = {
  '小': ['小', '迷你', 'mini', '小包装', '小份', '小袋'],
  '中': ['中', '普通', '标准', '常规', '中包装', '中袋'],
  '大': ['大', '大包装', '大袋', '家庭装', '分享装', '超值装'],
  '特大': ['特大', '巨无霸', '超大', '豪装', '礼盒装', '整箱'],
};

// 根据名称推断规格
const inferSize = (name) => {
  if (!name) return null;
  for (const [size, keywords] of Object.entries(SIZE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return size;
      }
    }
  }
  return '中'; // 默认中
};

// 获取所有可用的AI模型
export const getAvailableModels = () => AI_MODELS;

// AI识别零食图片的Prompt
const SNACK_ANALYSIS_PROMPT = `请仔细分析这张零食图片，提取以下信息，并严格以JSON格式返回，不要输出任何其他内容：
{
  "name": "零食的完整名称（从包装正面大字或背面配料表上方提取）",
  "category": "分类（只能选：糖果/巧克力/饼干/薯片/坚果/糕点/肉干/果干/饮料/膨化/其他）",
  "sizeLevel": "规格（只能选：小/中/大/特大）",
  "expiryDays": 保质期天数（数字，从背面保质期至或生产日期推算，如果看不到就返回null）,
  "price": 单包零售价格（数字，单位：元，如果图片中没有价格标签则返回null）,
  "stockCount": 图片中这种零食的个数（数字）
}
重要规则：
1. 如果某个字段无法从图片中识别，请返回null，不要猜测
2. stockCount请仔细数图片中有多少个该零食

【包装类型判断 - 关键步骤】
请仔细观察图片，判断以下包装类型：
1. 单包/单袋：只有一个独立小包装（如一小袋薯片、一颗糖果、一包旺旺雪饼）
2. 桶装/盒装：圆柱形桶或方盒（如桶装薯片、饼干盒）
3. 袋装：扁平的塑料袋（如袋装糖果、袋装坚果）
4. 整盒/整箱：多个包装在一起，有外包装

【价格识别规则 - 非常重要】
- 常见单包零食价格参考：
  * 小包装（≤50g）：1-5元（如旺旺雪饼、小袋薯片）
  * 中包装（50-150g）：3-10元（如普通袋装零食）
  * 大包装（150-300g）：8-20元（如家庭装）
- 如果图片中有价格标签：
  * 仔细阅读价格标签上的数字
  * 判断这是单包价格还是整盒/整包价格
  * 如果看到"整箱""整包""促销装"等字样，这是整包价格
  * 单包零食价格超过10元非常罕见，如果超过请重新确认
- 如果图片中没有价格标签：
  * 返回null，系统会自动搜索网络价格
- 【重要】不要编造价格，如果看不到价格标签就返回null

【规格判断规则】
- 小：净含量≤50g，或迷你/小袋/试吃装
- 中：净含量50g-150g，或普通独立包装
- 大：净含量150g-300g，或家庭装/分享装
- 特大：净含量>300g，或礼盒/整箱

只返回JSON，不要有任何其他文字`;

// 调用通义千问 VL API（OpenAI兼容接口）
const callQwenAPI = async (imageBase64, apiKey) => {
  const modelConfig = AI_MODELS.qwen;
  
  const response = await fetch(modelConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
            {
              type: 'text',
              text: SNACK_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  
  return parseAIResponse(text);
};

// 调用 ChatGPT Vision API
const callChatGPTAPI = async (imageBase64, apiKey) => {
  const modelConfig = AI_MODELS.chatgpt;
  
  const response = await fetch(modelConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SNACK_ANALYSIS_PROMPT },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  
  return parseAIResponse(text);
};

// 解析AI返回的JSON
const parseAIResponse = (text) => {
  // 尝试从返回文本中提取JSON
  try {
    // 尝试直接解析
    return JSON.parse(text);
  } catch {
    // 尝试提取JSON块
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error('JSON解析失败:', jsonMatch[0]);
      }
    }
  }
  return null;
};

// 真实AI识别（接入API）
export const analyzeSnackImageWithAI = async (file, modelKey = 'qwen', apiKey = '') => {
  // 读取图片为base64（带data前缀）
  const imageBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 如果没有API Key，抛出明确错误
  if (!apiKey) {
    throw new Error('未配置API Key，请在系统设置中填写API密钥');
  }

  // 根据模型选择调用方式
  let result;
  
  if (modelKey === 'qwen') {
    result = await callQwenAPI(imageBase64, apiKey);
  } else if (modelKey === 'chatgpt') {
    result = await callChatGPTAPI(imageBase64, apiKey);
  } else {
    throw new Error(`暂不支持 ${AI_MODELS[modelKey]?.name || modelKey} 模型的图片识别，请选择通义千问或ChatGPT`);
  }

  if (!result) {
    throw new Error('AI未能从图片中提取有效信息，请确保图片清晰且包含零食包装');
  }

  // 名称校验：如果是英文或乱码，通过AI联网搜索真实中文名称
  let finalName = result.name || null;
  let nameVerified = false;
  if (finalName && isInvalidName(finalName)) {
    try {
      const verified = await verifySnackName(finalName, modelKey, apiKey);
      if (verified.verified && verified.name !== finalName) {
        finalName = verified.name;
        nameVerified = true;
      }
    } catch (err) {
      console.error('名称校验失败:', err);
      // 校验失败时保留原始名称
    }
  }

  // 三层价格识别保障
  let finalPrice = result.price || null;
  let priceSource = 'AI识别';

  // 【第一层】千问API联网搜索
  if (finalName && apiKey) {
    try {
      const searchedPrice = await searchSnackPriceWithAI(finalName, modelKey, apiKey);
      if (searchedPrice && searchedPrice > 0) {
        console.log(`[第一层] 千问联网搜索价格：${finalName} = ¥${searchedPrice}`);
        finalPrice = searchedPrice;
        priceSource = '联网搜索';
      }
    } catch (err) {
      console.error('[第一层] 千问联网搜索失败:', err);
    }
  }

  // 【第二层】本地价格数据库（如果第一层失败）
  if (!finalPrice || finalPrice <= 0) {
    const localPrice = searchLocalPrice(finalName);
    if (localPrice && localPrice > 0) {
      console.log(`[第二层] 本地数据库价格：${finalName} = ¥${localPrice}`);
      finalPrice = localPrice;
      priceSource = '本地数据库';
    }
  }

  // 【第三层】原有逻辑修正（如果前两层都失败）
  if (!finalPrice || finalPrice <= 0) {
    finalPrice = result.price || null;
    if (finalPrice != null && finalPrice !== 0 && result.stockCount === 1) {
      // 价格合理性校验
      if (finalPrice < 0.5 || finalPrice > 20) {
        const possibleCounts = [2, 4, 6, 8, 10, 12, 16, 20, 24];
        for (const count of possibleCounts) {
          const singlePrice = finalPrice / count;
          if (singlePrice >= 0.5 && singlePrice <= 20) {
            console.log(`[第三层] 价格修正：¥${finalPrice} ÷ ${count} = ¥${singlePrice.toFixed(2)}`);
            finalPrice = parseFloat(singlePrice.toFixed(2));
            priceSource = '价格修正';
            break;
          }
        }
      }
    }
  }

  // 如果三层都失败，标记价格需要用户手动输入
  if (!finalPrice || finalPrice <= 0) {
    console.log(`价格识别失败，需要用户手动输入`);
    finalPrice = null;
    priceSource = '待确认';
  }

  // 标准化返回
  const category = result.category || inferCategory(finalName);
  const sizeLevel = result.sizeLevel || inferSize(finalName);

  const extractedFields = [];
  const failedFields = [];

  if (result.name) extractedFields.push('名称');
  else failedFields.push('名称');

  if (category) extractedFields.push('分类');
  else failedFields.push('分类');

  if (sizeLevel) extractedFields.push('规格');
  else failedFields.push('规格');

  if (result.expiryDays != null && result.expiryDays !== 0) extractedFields.push('剩余天数');
  else failedFields.push('剩余天数');

  if (finalPrice != null && finalPrice !== 0) extractedFields.push('价格');
  else failedFields.push('价格');

  if (result.stockCount != null && result.stockCount !== 0) extractedFields.push('库存');
  else failedFields.push('库存');

  return {
    name: finalName,
    originalName: nameVerified ? result.name : null,
    nameVerified,
    category: category,
    sizeLevel: sizeLevel,
    expiryDays: result.expiryDays || null,
    price: finalPrice,
    priceSource: priceSource,
    stockCount: result.stockCount || null,
    healthScore: 5,
    extractedFields,
    failedFields,
  };
};

// 单张图片识别（兼容旧接口）
export const uploadAndAnalyzeImage = async (file, modelKey = 'qwen', apiKey = '') => {
  const result = await analyzeSnackImageWithAI(file, modelKey, apiKey);
  
  // 读取图片base64用于预览
  const imageBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    ...result,
    imageBase64,
  };
};

export default {
  getAvailableModels,
  analyzeSnackImageWithAI,
  uploadAndAnalyzeImage,
  inferCategory,
};
