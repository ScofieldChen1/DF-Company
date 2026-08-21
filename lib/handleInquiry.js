const { buildInquiryPayload, formatEmailText, formatSmsContent } = require('./labels');
const { isEmailConfigured, sendInquiryEmail } = require('./email');
const { isSmsConfigured, sendInquirySms } = require('./sms');

function validateInquiry(body) {
  const errors = [];
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();
  const inquirerType = body.inquirerType === 'individual' ? 'individual' : 'company';
  const company = String(body.company || '').trim();

  if (!name) errors.push('请填写姓名');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('请填写有效邮箱');
  if (!message) errors.push('请填写留言');
  if (inquirerType === 'company' && !company) errors.push('请填写公司名称');

  return { errors, inquirerType };
}

async function handleInquiry(body) {
  const { errors, inquirerType } = validateInquiry(body || {});
  if (errors.length) {
    return { status: 400, body: { ok: false, message: errors.join('；') } };
  }

  if (!isEmailConfigured() && !isSmsConfigured()) {
    return {
      status: 503,
      body: {
        ok: false,
        message: '通知服务尚未配置，请在 Vercel / 服务器环境变量中设置 SMTP 或短信参数。',
      },
    };
  }

  const payload = buildInquiryPayload({ ...body, inquirerType });
  const emailText = formatEmailText(payload);
  const smsText = formatSmsContent(payload);

  const [emailResult, smsResult] = await Promise.allSettled([
    sendInquiryEmail(payload, emailText),
    sendInquirySms(smsText),
  ]);

  const emailOk = emailResult.status === 'fulfilled' && emailResult.value.ok;
  const smsOk = smsResult.status === 'fulfilled' && smsResult.value.ok;
  const emailSkipped = emailResult.status === 'fulfilled' && emailResult.value.skipped;
  const smsSkipped = smsResult.status === 'fulfilled' && smsResult.value.skipped;

  if (!emailOk && !smsOk && !emailSkipped && !smsSkipped) {
    const emailErr = emailResult.status === 'rejected' ? emailResult.reason?.message : '';
    const smsErr = smsResult.status === 'rejected' ? smsResult.reason?.message : '';
    throw new Error([emailErr, smsErr].filter(Boolean).join(' / ') || '通知发送失败');
  }

  if (!emailOk && !smsOk) {
    const emailErr = emailResult.status === 'rejected'
      ? emailResult.reason?.message
      : emailSkipped
        ? ''
        : '邮件未发送';
    const smsErr = smsResult.status === 'rejected'
      ? smsResult.reason?.message
      : smsSkipped
        ? ''
        : '短信未发送';
    const detail = [emailErr, smsErr].filter(Boolean).join('；');
    const hint = emailErr && /ETIMEDOUT|ECONNREFUSED|ETIMEOUT/i.test(emailErr)
      ? '（Vercel 海外节点通常无法直连 QQ/163 等国内 SMTP，请改用 Resend API 或 SendGrid 等海外可达的邮件服务）'
      : '';
    return {
      status: 502,
      body: {
        ok: false,
        message: `通知发送失败：${detail}${hint}`,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      delivered: { email: emailOk, sms: smsOk },
    },
  };
}

module.exports = {
  validateInquiry,
  handleInquiry,
  isEmailConfigured,
  isSmsConfigured,
};
