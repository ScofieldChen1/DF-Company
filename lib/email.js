const nodemailer = require('nodemailer');

function getNotifyEmails() {
  const raw = process.env.NOTIFY_EMAIL || process.env.INQUIRY_TO || '';
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getNotifyEmails().length);
}

function isEmailConfigured() {
  if (isResendConfigured()) return true;
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      getNotifyEmails().length
  );
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== 'false';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendViaResend(data, formattedText) {
  const recipients = getNotifyEmails();
  const fromName = process.env.SMTP_FROM_NAME || 'Orient Abrasives Inquiry';
  const from = process.env.RESEND_FROM || `${fromName} <onboarding@resend.dev>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: data.email,
      subject: `[官网询盘] ${data.name} — ${data.subject}`,
      text: formattedText,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Resend 发送失败 (${response.status})`);
  }

  return { ok: true };
}

async function sendInquiryEmail(data, formattedText) {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, reason: '邮件未配置' };
  }

  if (isResendConfigured()) {
    await sendViaResend(data, formattedText);
    return { ok: true };
  }

  const recipients = getNotifyEmails();
  const fromName = process.env.SMTP_FROM_NAME || 'Orient Abrasives Inquiry';
  const transport = createTransport();

  await transport.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: recipients.join(', '),
    replyTo: data.email,
    subject: `[官网询盘] ${data.name} — ${data.subject}`,
    text: formattedText,
  });

  return { ok: true };
}

module.exports = {
  isEmailConfigured,
  sendInquiryEmail,
};
