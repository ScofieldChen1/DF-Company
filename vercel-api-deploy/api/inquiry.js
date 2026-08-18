const { handleInquiry } = require('../lib/handleInquiry');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const result = await handleInquiry(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('[inquiry]', error);
    return res.status(500).json({
      ok: false,
      message: error.message || '服务器错误，请稍后重试。',
    });
  }
};
