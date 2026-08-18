const { isEmailConfigured, isSmsConfigured } = require('../lib/handleInquiry');

module.exports = (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    ok: true,
    email: isEmailConfigured(),
    sms: isSmsConfigured(),
  });
};
