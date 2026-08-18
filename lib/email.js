const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.NOTIFY_EMAIL
  );
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== 'false';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendInquiryEmail(data, formattedText) {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, reason: 'SMTP 未配置' };
  }

  const recipients = process.env.NOTIFY_EMAIL.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

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
