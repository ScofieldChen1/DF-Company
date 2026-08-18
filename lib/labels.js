const SUBJECT_LABELS = {
  quote: '获取报价 / Request a Quote',
  custom: '定制规格 / Custom OEM',
  partnership: '合作代理 / Partnership',
  product: '产品咨询 / Product Info',
  other: '其他 / Other',
};

const INDUSTRY_LABELS = {
  shipbuilding: '造船 / Shipbuilding',
  aviation: '航空 / Aviation',
  automotive: '汽车 / Automotive',
  machinery: '重工 / Heavy Machinery',
  precision: '精密 / Precision',
  other: '其他 / Other',
};

const PRODUCT_LABELS = {
  'polishing-wheel': '抛光轮',
  'active-shank': '活动带杆抛光轮',
  'steel-paper': '钢纸磨片',
  'grinding-circle': '砂圈',
  'polishing-series': '抛光类产品',
  'springness-plate': '弹性磨盘',
  cowhide: '牛皮轮',
  'sponge-wheel': '海绵轮',
  'latex-wheel': '橡胶轮',
  'diamond-points': '金刚石磨头',
  'alloy-wheel': '合金砂轮',
  'diamond-wheel': '金刚石研磨轮',
  custom: '定制 / OEM',
};

function label(map, value) {
  if (!value) return '—';
  return map[value] || value;
}

function buildInquiryPayload(body) {
  const inquirerType = body.inquirerType === 'individual' ? '个人 / Individual' : '公司 / Company';

  return {
    inquirerType,
    name: String(body.name || '').trim(),
    company: String(body.company || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    subject: label(SUBJECT_LABELS, body.subject),
    industry: label(INDUSTRY_LABELS, body.industry),
    product: label(PRODUCT_LABELS, body.product),
    message: String(body.message || '').trim(),
    submittedAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  };
}

function formatEmailText(data) {
  const lines = [
    '【东方磨具官网 · 新询盘】',
    '',
    `提交时间：${data.submittedAt}`,
    `询盘身份：${data.inquirerType}`,
    `姓名：${data.name}`,
    `公司：${data.company || '—'}`,
    `邮箱：${data.email}`,
    `电话：${data.phone || '—'}`,
    `询盘类型：${data.subject}`,
    `所属行业：${data.industry}`,
    `产品品类：${data.product}`,
    '',
    '—— 留言内容 ——',
    data.message,
    '',
    '—',
    '请在 24 个工作小时内回复客户。',
  ];

  return lines.join('\n');
}

function formatSmsContent(data) {
  const summary = [data.name, data.phone || data.email, data.subject, data.message]
    .filter(Boolean)
    .join(' | ');

  const maxLen = 60;
  return summary.length > maxLen ? `${summary.slice(0, maxLen - 1)}…` : summary;
}

module.exports = {
  buildInquiryPayload,
  formatEmailText,
  formatSmsContent,
};
