/**
 * 各 AI 提供商的错误码配置
 * 根据官方文档整理，为每个厂商提供独立的错误码映射
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */

/**
 * Google Gemini 错误码
 * 文档: https://ai.google.dev/api/generate-content#v1beta.GenerateContentResponse
 */
const GEMINI_ERROR_CODES = {
  // HTTP 状态码
  400: {
    default: "请求参数错误 (400)，请检查 API 配置",
    INVALID_ARGUMENT: "请求参数无效，请检查输入格式",
    FAILED_PRECONDITION:
      "Gemini API 在当前地区不可用，或需要启用 Google Cloud 计费",
  },
  401: {
    default: "API 密钥无效 (401)，请检查密钥是否正确",
    UNAUTHENTICATED: "认证失败，API 密钥无效或丢失",
  },
  403: {
    default: "权限被拒绝 (403)，请检查 API 密钥权限或地区限制",
    PERMISSION_DENIED: "无权访问该模型，请检查 API 密钥权限",
  },
  404: {
    default: "模型不存在 (404)，请选择其他可用模型",
    NOT_FOUND: "请求的资源不存在",
  },
  429: {
    default: "请求过于频繁 (429)，已触发速率限制",
    RESOURCE_EXHAUSTED: "配额已耗尽，请稍后重试或升级账户",
  },
  500: {
    default: "Gemini 服务内部错误 (500)，请稍后重试",
    INTERNAL: "Google 服务器内部错误",
  },
  503: {
    default: "Gemini 服务暂时不可用 (503)，系统可能过载",
    UNAVAILABLE: "服务暂时不可用，请稍后重试",
  },
  // 特殊错误
  SAFETY_BLOCKED: "内容被 Gemini 安全策略拦截，请修改输入",
  NETWORK_ERROR: "无法连接到 Google 服务器，请检查代理设置",
};

/**
 * 硅基流动 SiliconFlow 错误码
 * 文档: https://docs.siliconflow.cn/docs/error-message
 */
const SILICONFLOW_ERROR_CODES = {
  400: {
    default: "请求参数错误 (400)，请检查输入格式",
    invalid_request_error: "请求格式无效或参数错误",
  },
  401: {
    default: "API 密钥无效 (401)，请检查硅基流动 API Key",
    authentication_error: "认证失败，API 密钥无效或已过期",
  },
  403: {
    default: "权限不足 (403)",
    permission_denied: "账户未实名认证或权限不足，请检查账户状态",
    insufficient_balance: "账户余额不足，请前往硅基流动充值",
  },
  404: {
    default: "模型不存在 (404)，请选择其他可用模型",
  },
  429: {
    default: "请求过于频繁 (429)，已触发限流",
    rate_limit_exceeded: "超出速率限制 (RPM/TPM)，请稍后重试",
  },
  500: {
    default: "硅基流动服务内部错误 (500)，请稍后重试",
  },
  503: {
    default: "硅基流动服务暂时不可用 (503)，请稍后重试",
  },
  504: {
    default: "网关超时 (504)，服务响应时间过长",
  },
  NETWORK_ERROR: "无法连接到硅基流动服务器，请检查网络连接",
};

/**
 * Groq 错误码
 * 文档: https://console.groq.com/docs/errors
 */
const GROQ_ERROR_CODES = {
  400: {
    default: "请求参数错误 (400)，请检查输入格式",
    invalid_request_error: "请求无效",
  },
  401: {
    default: "API 密钥无效 (401)，请检查 Groq API Key",
    invalid_api_key: "Groq API 密钥无效或已过期",
  },
  403: {
    default: "权限不足 (403)，请检查 Groq 账户状态",
  },
  404: {
    default: "模型不存在 (404)，请选择其他可用模型",
    model_not_found: "指定的模型不存在或已下线",
  },
  413: {
    default: "请求内容过大 (413)，请减少输入长度",
  },
  422: {
    default: "请求无法处理 (422)，语义错误或模型幻觉",
    unprocessable_entity: "请求格式正确但无法处理",
  },
  429: {
    default: "请求过于频繁 (429)，已触发 Groq 限流",
    rate_limit_exceeded: "超出 RPM/TPM 限制，请稍后重试",
  },
  498: {
    default: "Groq Flex Tier 容量已满 (498)，请稍后重试",
  },
  499: {
    default: "请求已取消 (499)",
  },
  500: {
    default: "Groq 服务内部错误 (500)，请稍后重试",
  },
  502: {
    default: "网关错误 (502)，上游服务无效响应",
  },
  503: {
    default: "Groq 服务暂时不可用 (503)，系统可能过载",
    service_unavailable: "Groq 服务器过载，请稍后重试",
  },
  NETWORK_ERROR: "无法连接到 Groq 服务器，请检查代理设置",
};

/**
 * X.AI (Grok) 错误码
 * 文档: https://docs.x.ai/api
 */
const XAI_ERROR_CODES = {
  400: {
    default: "请求参数错误 (400)，请检查输入格式",
    invalid_request: "请求格式无效或参数缺失",
  },
  401: {
    default: "API 密钥无效 (401)，请检查 X.AI API Key",
    unauthorized: "X.AI 认证失败，API 密钥无效或缺失",
  },
  403: {
    default: "权限不足 (403)，请检查 X.AI 账户权限",
    forbidden: "无权执行此操作",
  },
  404: {
    default: "模型不存在 (404)，请选择其他 Grok 模型",
    not_found: "请求的资源或模型未找到",
  },
  405: {
    default: "请求方法不允许 (405)",
  },
  429: {
    default: "请求过于频繁 (429)，已触发 X.AI 限流",
    rate_limit: "超出速率限制，请稍后重试",
  },
  500: {
    default: "X.AI 服务内部错误 (500)，请稍后重试",
  },
  503: {
    default: "X.AI 服务暂时不可用 (503)，请稍后重试",
  },
  NETWORK_ERROR: "无法连接到 X.AI 服务器，请检查代理设置",
};

/**
 * OpenAI 错误码
 * 文档: https://platform.openai.com/docs/guides/error-codes
 */
const OPENAI_ERROR_CODES = {
  400: {
    default: "请求参数错误 (400)，请检查输入格式",
    invalid_request_error: "请求无效，请检查参数",
    context_length_exceeded: "输入长度超过模型限制 (max_tokens)，请减少内容",
  },
  401: {
    default: "API 密钥无效 (401)，请检查 OpenAI API Key",
    invalid_api_key: "OpenAI API 密钥无效、过期或已被撤销",
    authentication_error: "认证失败",
  },
  403: {
    default: "权限不足 (403)，请检查 OpenAI 账户状态",
    country_unsupported: "OpenAI 在当前地区不可用，请使用代理",
    permission_error: "无权访问该资源",
  },
  404: {
    default: "模型不存在 (404)，请选择其他可用模型",
    model_not_found: "指定的模型不存在或您无权访问",
  },
  429: {
    default: "请求过于频繁 (429)，已触发 OpenAI 限流",
    rate_limit_exceeded: "超出 RPM/TPM 限制，请稍后重试",
    insufficient_quota: "账户配额已耗尽，请检查账户余额或升级计划",
  },
  500: {
    default: "OpenAI 服务内部错误 (500)，请稍后重试",
    server_error: "服务器处理请求时发生错误",
  },
  502: {
    default: "OpenAI 网关错误 (502)，请稍后重试",
  },
  503: {
    default: "OpenAI 服务暂时不可用 (503)，系统可能过载",
    overloaded: "OpenAI 服务器过载，请稍后重试",
  },
  504: {
    default: "网关超时 (504)，请稍后重试",
  },
  CONTENT_FILTER: "内容被 OpenAI 安全策略拦截，请修改输入",
  NETWORK_ERROR: "无法连接到 OpenAI 服务器，请检查代理设置",
};

/**
 * 智谱 AI (Zhipu/BigModel) 错误码
 * 文档: https://open.bigmodel.cn/dev/api/error-codes
 */
const ZHIPU_ERROR_CODES = {
  // 智谱使用自定义错误码
  1000: "智谱AI：系统繁忙，请稍后重试",
  1001: "智谱AI：认证失败，API Key 错误或过期",
  1002: "智谱AI：用户不存在或无效",
  1003: "智谱AI：请求参数格式错误",
  1004: "智谱AI：输入包含敏感信息，请修改",
  1005: "智谱AI：无效的 API 调用",
  1110: "智谱AI：用户被冻结，请联系官方解封",
  1111: "智谱AI：用户未实名认证",
  1112: "智谱AI：API 调用费用不足，请充值",
  1113: "智谱AI：账户未授权",
  1210: "智谱AI：模型不存在或已下线",
  1214: "智谱AI：输入内容为空或格式错误",
  1261: "智谱AI：模型限流，请降低并发数",
  1262: "智谱AI：模型总 Token 数超限",
  1263: "智谱AI：模型超过最大调用次数限制",
  1300: "智谱AI：系统繁忙，请稍后重试",
  1301: "智谱AI：服务暂时不可用，请稍后重试",
  1302: "智谱AI：速率限制，超出并发调用数",
  1303: "智谱AI：模型 QPS 超限",
  1304: "智谱AI：账户并发数超限",
  1305: "智谱AI：请求过于频繁，请降低调用频率",
  // HTTP 状态码备用
  400: {
    default: "智谱AI：请求参数错误 (400)",
  },
  401: {
    default: "智谱AI：API 密钥无效 (401)，请检查 API Key",
  },
  403: {
    default: "智谱AI：权限不足 (403)，请检查账户状态",
  },
  404: {
    default: "智谱AI：模型不存在 (404)",
  },
  429: {
    default: "智谱AI：请求过于频繁 (429)，已触发限流",
  },
  434: {
    default: "智谱AI：无 API 调用权限 (434)",
  },
  435: {
    default: "智谱AI：上传文件大小超过限制 (435)",
  },
  500: {
    default: "智谱AI：服务内部错误 (500)，请稍后重试",
  },
  503: {
    default: "智谱AI：服务暂时不可用 (503)",
  },
  NETWORK_ERROR: "无法连接到智谱AI服务器，请检查网络连接",
};

/**
 * 百度千帆 (Qianfan/文心一言) 错误码
 * 文档: https://cloud.baidu.com/doc/WENXINWORKSHOP/s/tlmyncueh
 */
const BAIDU_ERROR_CODES = {
  // 百度使用自定义错误码
  1: "百度千帆：服务器内部错误，请稍后重试",
  2: "百度千帆：服务暂时不可用，请稍后重试",
  3: "百度千帆：接口不支持该请求方法",
  4: "百度千帆：集群超限额，请稍后重试",
  6: "百度千帆：无权限访问该资源，请检查开通状态",
  13: "百度千帆：查询参数非法",
  14: "百度千帆：认证失败，请检查 API Key",
  15: "百度千帆：签名校验失败",
  17: "百度千帆：QPS 超限，请降低请求频率",
  18: "百度千帆：请求次数超限",
  19: "百度千帆：请求总量超限",
  100: "百度千帆：请求参数无效",
  110: "百度千帆：Access Token 无效",
  111: "百度千帆：Access Token 已过期",
  200: "百度千帆：服务错误",
  336: "百度千帆：服务内部错误",
  336001: "百度千帆：请求内容审核未通过",
  336002: "百度千帆：响应内容审核未通过",
  336003: "百度千帆：输入 Token 数超限",
  336004: "百度千帆：输入+输出 Token 数超限",
  336100: "百度千帆：服务内部错误，请重试",
  336501: "百度千帆：模型不存在",
  336502: "百度千帆：模型限流",
  // HTTP 状态码备用
  400: {
    default: "百度千帆：请求参数错误 (400)",
    malformed_json: "JSON 格式错误",
    invalid_model: "未指定模型或模型无效",
    characters_too_long: "输入内容过长，超过限制",
  },
  401: {
    default: "百度千帆：认证失败 (401)，请检查 API Key",
  },
  403: {
    default: "百度千帆：权限不足 (403)，请检查账户开通状态",
    AccessDenied: "访问被拒绝",
    InvalidAccessKeyId: "Access Key ID 无效",
  },
  404: {
    default: "百度千帆：接口或模型不存在 (404)",
  },
  429: {
    default: "百度千帆：请求过于频繁 (429)，已触发限流",
  },
  500: {
    default: "百度千帆：服务内部错误 (500)，请稍后重试",
    InternalError: "内部服务器错误",
  },
  502: {
    default: "百度千帆：网关错误 (502)，请稍后重试",
  },
  503: {
    default: "百度千帆：服务暂时不可用 (503)",
  },
  504: {
    default: "百度千帆：响应超时 (504)，请减少输入或稍后重试",
  },
  NETWORK_ERROR: "无法连接到百度千帆服务器，请检查网络连接",
};

/**
 * 阿里云 (DashScope/通义千问) 错误码
 * 文档: https://help.aliyun.com/zh/dashscope/developer-reference/error-code
 */
const ALIYUN_ERROR_CODES = {
  400: {
    default: "阿里云：请求参数错误 (400)",
    InvalidParameter: "参数无效或缺失",
  },
  401: {
    default: "阿里云：API Key 无效 (401)",
    InvalidApiKey: "API Key 无效或已过期",
  },
  403: {
    default: "阿里云：无权访问 (403)",
    AccessDenied: "访问被拒绝，请检查权限",
  },
  404: {
    default: "阿里云：资源不存在 (404)",
    ModelNotFound: "模型不存在或拼写错误",
  },
  429: {
    default: "阿里云：请求过于频繁 (429)",
    Throttling: "触发限流，请稍后重试",
  },
  // 自定义错误码字符串
  "InvalidApiKey": "阿里云：API Key 无效或已过期",
  "AccessDenied": "阿里云：访问被拒绝",
  "Throttling.RateQuota": "阿里云：触发速率限流，请稍后重试",
  "Throttling.AllocationQuota": "阿里云：配额已耗尽",
  "DataInspectionFailed": "阿里云：输入或输出内容审核未通过",
  NETWORK_ERROR: "无法连接到阿里云服务器，请检查网络连接",
};

/**
 * Moonshot (Kimi) 错误码
 * 文档: https://platform.moonshot.cn/docs/api/error-handling
 */
const MOONSHOT_ERROR_CODES = {
  400: {
    default: "Moonshot：请求参数错误 (400)",
    invalid_request_error: "请求无效或文件上传错误",
  },
  401: {
    default: "Moonshot：API Key 无效 (401)",
    authentication_error: "身份验证失败，请检查 API Key",
  },
  403: {
    default: "Moonshot：余额不足或无权限 (403)",
    permission_error: "权限错误或余额不足",
  },
  404: {
    default: "Moonshot：模型不存在 (404)",
    model_not_found: "模型不存在或无权访问",
  },
  429: {
    default: "Moonshot：并发或频率超限 (429)",
    rate_limit_error: "速率限制 (RPM/TPM/TPD)，请稍后重试",
  },
  500: {
    default: "Moonshot：服务内部错误 (500)",
  },
  503: {
    default: "Moonshot：服务暂时不可用 (503)",
  },
  504: {
    default: "Moonshot：请求超时 (504)",
  },
  NETWORK_ERROR: "无法连接到 Moonshot 服务器，请检查网络连接",
};

/**
 * 通用/未知提供商的错误码（作为后备方案）
 */
const GENERIC_ERROR_CODES = {
  400: { default: "请求参数错误 (400)，请检查 API 配置" },
  401: { default: "API 密钥无效 (401)，请检查密钥是否正确" },
  402: { default: "账户余额不足 (402)，请充值" },
  403: { default: "权限不足 (403)，请检查账户状态" },
  404: { default: "资源不存在 (404)，请检查配置" },
  405: { default: "请求方法错误 (405)" },
  413: { default: "请求内容过大 (413)，请减少输入" },
  415: { default: "不支持的媒体类型 (415)" },
  422: { default: "请求无法处理 (422)，请检查参数" },
  429: { default: "请求过于频繁 (429)，请稍后重试" },
  500: { default: "服务内部错误 (500)，请稍后重试" },
  502: { default: "网关错误 (502)，请稍后重试" },
  503: { default: "服务暂时不可用 (503)，请稍后重试" },
  504: { default: "响应超时 (504)，请稍后重试" },
  NETWORK_ERROR: "网络连接失败，请检查网络设置",
  TIMEOUT: "请求超时，请检查网络连接",
  PARSE_ERROR: "响应格式错误，请稍后重试",
};

/**
 * 提供商ID到错误码映射的对照表
 */
const PROVIDER_ERROR_CODES = {
  gemini: GEMINI_ERROR_CODES,
  siliconflow: SILICONFLOW_ERROR_CODES,
  groq: GROQ_ERROR_CODES,
  xai: XAI_ERROR_CODES,
  openai: OPENAI_ERROR_CODES,
  zhipu: ZHIPU_ERROR_CODES,
  baidu: BAIDU_ERROR_CODES,
  aliyun: ALIYUN_ERROR_CODES,
  moonshot: MOONSHOT_ERROR_CODES,
};

/**
 * 根据提供商ID和错误信息获取用户友好的错误消息
 * 严格分离模式：优先使用指定厂商配置，未匹配则回退到通用配置
 * @param {string} providerId - 提供商ID
 * @param {string} errorMessage - 原始错误消息
 * @returns {string} 用户友好的错误消息
 */
function getProviderErrorMessage(providerId, errorMessage) {
  const errorCodes = PROVIDER_ERROR_CODES[providerId];
  let resolvedMessage = errorMessage;

  // 1. 尝试使用厂商特定配置解析
  if (errorCodes) {
    resolvedMessage = parseErrorWithConfig(errorMessage, errorCodes, providerId);
  } else {
    // 厂商未知，直接使用通用配置
    resolvedMessage = parseGenericError(errorMessage);
  }

  // 2. 如果未能解析（返回了原消息），且之前是尝试的厂商配置，则尝试通用配置作为补充
  if (resolvedMessage === errorMessage && errorCodes) {
    resolvedMessage = parseGenericError(errorMessage);
  }

  // 3. 如果仍然未能解析，但检测到 HTTP 状态码，返回通用“连接失败”提示
  if (resolvedMessage === errorMessage) {
    const httpCodeMatch = errorMessage.match(/\b(4\d{2}|5\d{2})\b/);
    if (httpCodeMatch) {
      return `连接失败 (${httpCodeMatch[0]})：该状态码暂无官方解释，请检查网络或稍后重试`;
    }
  }

  return resolvedMessage;
}

/**
 * 使用特定配置解析错误
 */
function parseErrorWithConfig(errorMessage, config, providerId) {
  const msg = errorMessage.toLowerCase();
  
  // 1. 检查自定义字符串错误码 (config中的非数字key)
  for (const [code, message] of Object.entries(config)) {
    if (isNaN(parseInt(code)) && msg.includes(code.toLowerCase())) {
      return message;
    }
  }

  // 2. 检查数字错误码 (HTTP状态码或自定义数字码)
  // 提取消息中的所有数字
  const numbers = errorMessage.match(/\b\d{3,6}\b/g);
  if (numbers) {
    for (const numStr of numbers) {
      const code = parseInt(numStr, 10);
      if (config[code]) {
        const codeConfig = config[code];
        if (typeof codeConfig === 'string') return codeConfig;
        if (typeof codeConfig === 'object') {
             // 检查子类型 (如 400 下的 invalid_request)
             for (const [key, val] of Object.entries(codeConfig)) {
                if (key !== 'default' && msg.includes(key.toLowerCase())) {
                  return val;
                }
             }
             return codeConfig.default;
        }
      }
    }
  }

  // 3. 检查标准 HTTP 关键字，但仅当该厂商定义了对应代码时才匹配
  // 这避免了误判（例如厂商A的错误信息包含"unauthorized"但不代表401的情况，虽然罕见）
  const keywordMap = {
    'unauthorized': 401, 'invalid api key': 401, 'authentication': 401,
    'forbidden': 403, 'permission denied': 403, 'access denied': 403,
    'not found': 404,
    'too many requests': 429, 'rate limit': 429, 'quota': 429, 'throttling': 429,
    'internal server error': 500, 'internal error': 500,
    'bad gateway': 502,
    'service unavailable': 503, 'overloaded': 503,
    'gateway timeout': 504, 'timed out': 504,
    'bad request': 400, 'invalid request': 400, 'parameter': 400
  };

  for (const [keyword, code] of Object.entries(keywordMap)) {
    if (msg.includes(keyword) && config[code]) {
       const codeConfig = config[code];
       if (typeof codeConfig === 'string') return codeConfig;
       return codeConfig.default;
    }
  }

  // 4. 网络错误 (客户端通用错误，所有厂商都可能遇到)
  if (msg.includes('fetch failed') || msg.includes('network error') || msg.includes('econnrefused') || msg.includes('enotfound')) {
    return config.NETWORK_ERROR || "网络连接失败，请检查网络设置";
  }
  
  if (msg.includes('timeout') || msg.includes('etimedout')) {
    return "请求超时，请检查网络连接";
  }

  // 5. 无法识别，返回原始消息
  return errorMessage;
}

/**
 * 通用错误解析 (仅用于未知厂商)
 */
function parseGenericError(errorMessage) {
  const msg = errorMessage.toLowerCase();
  
  // 尝试匹配 HTTP 状态码
  const httpCodeMatch = errorMessage.match(/\b(4\d{2}|5\d{2})\b/);
  if (httpCodeMatch) {
    const code = parseInt(httpCodeMatch[0], 10);
    if (GENERIC_ERROR_CODES[code]) {
      return GENERIC_ERROR_CODES[code].default;
    }
  }
  
  if (msg.includes('network') || msg.includes('fetch failed')) return GENERIC_ERROR_CODES.NETWORK_ERROR;
  if (msg.includes('timeout')) return GENERIC_ERROR_CODES.TIMEOUT;
  
  return errorMessage;
}

/**
 * 获取指定提供商的所有错误码定义
 * @param {string} providerId - 提供商ID
 * @returns {object} 该提供商的错误码定义
 */
function getProviderErrorCodes(providerId) {
  return PROVIDER_ERROR_CODES[providerId] || GENERIC_ERROR_CODES;
}

/**
 * 判断是否为配额耗尽或余额不足错误
 * @param {string} providerId - 提供商ID
 * @param {string} errorMessage - 错误消息
 * @returns {boolean}
 */
function isQuotaError(providerId, errorMessage) {
  const msg = errorMessage.toLowerCase();
  
  // 针对特定厂商的判断
  if (providerId === 'gemini') {
    return msg.includes('resource_exhausted') || msg.includes('429');
  }
  
  if (providerId === 'siliconflow') {
    return msg.includes('insufficient_balance') || msg.includes('rate_limit_exceeded');
  }
  
  if (providerId === 'openai') {
    return msg.includes('insufficient_quota') || msg.includes('billing');
  }
  
  if (providerId === 'zhipu') {
    return msg.includes('1112') || msg.includes('1263');
  }
  
  if (providerId === 'baidu') {
    return msg.includes('4') || msg.includes('17') || msg.includes('18') || msg.includes('19');
  }

  if (providerId === 'aliyun') {
    return msg.includes('allocationquota') || msg.includes('ratequota');
  }

  if (providerId === 'moonshot') {
    return msg.includes('balance') || msg.includes('402');
  }
  
  // 通用关键字 (仅作为最后的后备)
  if (msg.includes('quota') || msg.includes('insufficient balance') || msg.includes('payment required') || msg.includes('402')) {
    return true;
  }
  
  return false;
}

module.exports = {
  GEMINI_ERROR_CODES,
  SILICONFLOW_ERROR_CODES,
  GROQ_ERROR_CODES,
  XAI_ERROR_CODES,
  OPENAI_ERROR_CODES,
  ZHIPU_ERROR_CODES,
  BAIDU_ERROR_CODES,
  ALIYUN_ERROR_CODES,
  MOONSHOT_ERROR_CODES,
  GENERIC_ERROR_CODES,
  PROVIDER_ERROR_CODES,
  getProviderErrorMessage,
  getProviderErrorCodes,
  isQuotaError,
};
