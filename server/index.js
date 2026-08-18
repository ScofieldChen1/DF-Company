require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const express = require('express');
const { handleInquiry, isEmailConfigured, isSmsConfigured } = require('../lib/handleInquiry');

const app = express();
const PORT = Number(process.env.PORT || 8765);
const ROOT = path.join(__dirname, '..');

app.use(express.json({ limit: '32kb' }));
app.use(express.static(ROOT));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    email: isEmailConfigured(),
    sms: isSmsConfigured(),
  });
});

app.post('/api/inquiry', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`DF site + inquiry API → http://127.0.0.1:${PORT}`);
  console.log(`  Email notify: ${isEmailConfigured() ? 'ready' : 'not configured'}`);
  console.log(`  SMS notify:   ${isSmsConfigured() ? 'ready' : 'not configured'}`);
});
