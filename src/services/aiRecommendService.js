// AI 推荐服务
// 基于用户零食库数据，通过 AI 模型生成个性化推荐

// AI 推荐的 Prompt
const RECOMMEND_PROMPT = `你是一个专业的零食推荐助手。根据用户当前零食库的数据，给出个性化的零食购买推荐。

用户当前零食库数据：
{snackData}

请分析以上数据，从以下维度给出推荐建议，严格以JSON格式返回，不要输出任何其他内容：
{
  "summary": "对用户零食库的简要分析（一句话）",
  "recommendations": [
    {
      "name": "推荐零食名称（中文）",
      "category": "分类（糖果/巧克力/饼干/薯片/坚果/糕点/肉干/果干/饮料/膨化）",
      "reason": "推荐理由（结合用户现有零食分析，如补充缺失品类、库存不足等）",
      "price": "参考价格（数字）",
      "priority": "优先级（高/中/低）"
    }
  ]
}

推荐规则：
1. 优先推荐用户零食库中缺少的品类
2. 库存不足的品类优先推荐补货
3. 考虑健康均衡，不要只推荐某一类
4. 推荐数量控制在5-8个
5. 只返回JSON`;

// 调用 AI 文本接口（非视觉）
const callAITextAPI = async (prompt, modelKey, apiKey) => {
  let apiUrl, model;

  if (modelKey === 'qwen') {
    apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    model = 'qwen-turbo';
  } else if (modelKey === 'chatgpt') {
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    model = 'gpt-4o-mini';
  } else {
    // 默认使用通义千问
    apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    model = 'qwen-turbo';
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

// 解析 AI 返回的 JSON
const parseAIJSONResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
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

// AI 智能推荐
export const getAIRecommendations = async (snacks, modelKey = 'qwen', apiKey = '') => {
  if (!apiKey) {
    throw new Error('未配置API Key，请在系统设置中填写API密钥');
  }

  if (!snacks || snacks.length === 0) {
    throw new Error('零食库为空，请先添加一些零食');
  }

  // 构建零食数据摘要
  const snackSummary = snacks.map(s => {
    const batches = s.expiry_batches || [];
    const batchInfo = batches.length > 0
      ? batches.map(b => `  批次: ${b.stock}份, 剩余${b.expiry_days}天`).join('\n')
      : `  库存: ${s.stock}份, 剩余${s.expiry_days || '未知'}天`;
    return `- ${s.name} | 分类:${s.category_id || '未分类'} | 价格:¥${s.price} | 规格:${s.size_level} | 健康:${s.health_score}/10\n${batchInfo}`;
  }).join('\n');

  // 统计分类分布
  const categoryCount = {};
  snacks.forEach(s => {
    const cat = s.category_id || '未分类';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categorySummary = Object.entries(categoryCount)
    .map(([cat, count]) => `${cat}: ${count}种`)
    .join(', ');

  const fullPrompt = RECOMMEND_PROMPT.replace(
    '{snackData}',
    `共${snacks.length}种零食\n分类分布: ${categorySummary}\n\n详细列表:\n${snackSummary}`
  );

  const responseText = await callAITextAPI(fullPrompt, modelKey, apiKey);
  const result = parseAIJSONResponse(responseText);

  if (!result || !result.recommendations) {
    throw new Error('AI推荐解析失败，请重试');
  }

  return {
    summary: result.summary || '',
    recommendations: result.recommendations.map(r => ({
      name: r.name || '未知零食',
      category: r.category || '其他',
      reason: r.reason || '',
      price: r.price || null,
      priority: r.priority || '中',
    })),
  };
};

// ============ 名称校验服务 ============

// 检测名称是否为英文或乱码
export const isInvalidName = (name) => {
  if (!name) return true;
  // 纯英文字母（允许少量英文但至少要有中文）
  const chineseChars = (name.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = name.replace(/\s/g, '').length;
  // 中文字符占比少于20%视为无效
  return chineseChars / totalChars < 0.2;
};

// 名称校验 Prompt
const NAME_VERIFY_PROMPT = `请识别以下零食名称的真实中文名称。

待识别名称: "{snackName}"

如果这个名称已经是正确的中文零食名称，直接返回原名称。
如果是英文、乱码或不准确的名称，请返回正确的中文零食名称。

严格以JSON格式返回：
{"verifiedName": "正确的中文名称", "confidence": "high/medium/low"}

只返回JSON，不要有任何其他文字。`;

// 校验并修正零食名称
export const verifySnackName = async (name, modelKey = 'qwen', apiKey = '') => {
  if (!name) return { name: '', verified: false };

  // 如果名称看起来正常（包含足够中文），直接返回
  if (!isInvalidName(name)) {
    return { name, verified: true, confidence: 'high' };
  }

  if (!apiKey) {
    // 没有 API Key 时返回原名称
    return { name, verified: false, confidence: 'low' };
  }

  try {
    const prompt = NAME_VERIFY_PROMPT.replace('{snackName}', name);
    const responseText = await callAITextAPI(prompt, modelKey, apiKey);
    const result = parseAIJSONResponse(responseText);

    if (result && result.verifiedName) {
      return {
        name: result.verifiedName,
        originalName: name,
        verified: true,
        confidence: result.confidence || 'medium',
      };
    }
  } catch (err) {
    console.error('名称校验失败:', err);
  }

  // 校验失败时返回原名称
  return { name, verified: false, confidence: 'low' };
};

export default {
  getAIRecommendations,
  verifySnackName,
  isInvalidName,
};
