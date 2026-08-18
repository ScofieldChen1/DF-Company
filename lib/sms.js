const crypto = require('crypto');
const https = require('https');

function isSmsConfigured() {
  return Boolean(
    process.env.ALIYUN_ACCESS_KEY_ID &&
      process.env.ALIYUN_ACCESS_KEY_SECRET &&
      process.env.ALIYUN_SMS_SIGN_NAME &&
      process.env.ALIYUN_SMS_TEMPLATE_CODE &&
      process.env.NOTIFY_PHONE
  );
}

function percentEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}

function buildSignature(params, accessKeySecret) {
  const canonicalized = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  const stringToSign = `GET&${percentEncode('/')}&${percentEncode(canonicalized)}`;
  return crypto
    .createHmac('sha1', `${accessKeySecret}&`)
    .update(stringToSign)
    .digest('base64');
}

function sendSingleSms(phone, content) {
  const params = {
    AccessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    SignName: process.env.ALIYUN_SMS_SIGN_NAME,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomBytes(16).toString('hex'),
    SignatureVersion: '1.0',
    TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
    TemplateParam: JSON.stringify({ content }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25',
  };

  params.Signature = buildSignature(params, process.env.ALIYUN_ACCESS_KEY_SECRET);
  const query = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  return new Promise((resolve, reject) => {
    const req = https.get(`https://dysmsapi.aliyuncs.com/?${query}`, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.Code === 'OK') {
            resolve(parsed);
            return;
          }
          reject(new Error(parsed.Message || `短信发送失败 (${parsed.Code || 'UNKNOWN'})`));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('短信请求超时'));
    });
  });
}

async function sendInquirySms(content) {
  if (!isSmsConfigured()) {
    return { ok: false, skipped: true, reason: '阿里云短信未配置' };
  }

  const phones = process.env.NOTIFY_PHONE.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const results = [];
  for (const phone of phones) {
    await sendSingleSms(phone, content);
    results.push({ phone, ok: true });
  }

  return { ok: true, results };
}

module.exports = {
  isSmsConfigured,
  sendInquirySms,
};
