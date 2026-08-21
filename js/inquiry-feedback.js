(function initInquiryFeedbackModule() {
  const form = document.querySelector('#contact-form');
  const root = document.getElementById('inquiry-feedback');
  if (!form || !root) return;

  const inquiryApiMeta = document.querySelector('meta[name="inquiry-api"]');
  let inquiryApiUrl = (inquiryApiMeta && inquiryApiMeta.content.trim()) || '/api/inquiry';

  const host = window.location.hostname;
  if (host.endsWith('github.io') || host === 'localhost' || host === '127.0.0.1') {
    inquiryApiUrl = 'https://df-company.vercel.app/api/inquiry';
  }

  root.querySelectorAll('[data-inquiry-close]').forEach((el) => {
    el.addEventListener('click', hideInquiryFeedback);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      hideInquiryFeedback();
    }
  });

  function hideInquiryFeedback() {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function buildInquiryRef() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `INQ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bilingualHtml(en, zh) {
    return `<span class="t-en">${en}</span><span class="t-zh">${zh}</span>`;
  }

  function showInquiryFeedback(options = {}) {
    const {
      type = 'success',
      code = '',
      titleHtml = '',
      messageHtml = '',
      metaHtml = '',
      actions = [],
    } = options;

    root.className = `inquiry-feedback inquiry-feedback--${type}`;
    root.querySelector('.inquiry-feedback__code').textContent = code;
    root.querySelector('.inquiry-feedback__title').innerHTML = titleHtml;
    root.querySelector('.inquiry-feedback__message').innerHTML = messageHtml;

    const meta = root.querySelector('.inquiry-feedback__meta');
    if (metaHtml) {
      meta.textContent = metaHtml;
      meta.hidden = false;
    } else {
      meta.hidden = true;
    }

    const icon = root.querySelector('.inquiry-feedback__icon');
    if (type === 'loading') {
      icon.innerHTML = '<div class="inquiry-feedback__spinner"></div>';
    } else if (type === 'error') {
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      `;
    } else {
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;
    }

    const actionsEl = root.querySelector('.inquiry-feedback__actions');
    actionsEl.innerHTML = '';
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = action.className || 'btn btn-primary';
      btn.innerHTML = action.html;
      btn.addEventListener('click', () => {
        if (typeof action.onClick === 'function') action.onClick();
        else hideInquiryFeedback();
      });
      actionsEl.appendChild(btn);
    });

    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const focusTarget = root.querySelector('.inquiry-feedback__close:not([style*="hidden"])') ||
      root.querySelector('.inquiry-feedback__actions .btn');
    if (focusTarget) focusTarget.focus();
  }

  const feedbackCopy = {
    loading: {
      code: 'INQ-TRANSMIT',
      label: { en: 'System', zh: '系统回执', tw: '系統回執' },
      title: { en: 'Transmitting Inquiry', zh: '正在提交询盘', tw: '正在提交詢盤' },
      message: {
        en: 'Securely routing your request to our sales engineering team…',
        zh: '正在将您的询盘安全发送至销售工程团队…',
        tw: '正在將您的詢盤安全發送至銷售工程團隊…',
      },
    },
    success: {
      code: 'INQ-200 OK',
      label: { en: 'System', zh: '系统回执', tw: '系統回執' },
      title: { en: 'Inquiry Received', zh: '询盘已受理', tw: '詢盤已受理' },
      message: {
        en: 'Your request has been logged. Our team will respond within 24 business hours.',
        zh: '您的询盘已成功记录，我们将在 24 个工作小时内回复。',
        tw: '您的詢盤已成功記錄，我們將在 24 個工作小時內回覆。',
      },
      meta: { en: 'Response SLA · 24 Hours', zh: '响应承诺 · 24 小时内', tw: '響應承諾 · 24 小時內' },
      action: { en: 'Acknowledged', zh: '确认', tw: '確認' },
    },
    error: {
      code: 'INQ-ERR',
      label: { en: 'System', zh: '系统回执', tw: '系統回執' },
      title: { en: 'Transmission Failed', zh: '提交未成功', tw: '提交未成功' },
      message: {
        en: 'Please try again or contact us directly by phone or email.',
        zh: '请稍后重试，或直接通过电话 / 邮箱联系我们。',
        tw: '請稍後重試，或直接通過電話 / 郵箱聯繫我們。',
      },
      retry: { en: 'Try Again', zh: '重新提交', tw: '重新提交' },
      close: { en: 'Close', zh: '关闭', tw: '關閉' },
    },
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const lang = document.body.classList.contains('lang-tw') ? 'tw' :
      document.body.classList.contains('lang-zh') ? 'zh' :
        document.body.classList.contains('lang-en') ? 'en' : 'zh';
    const copyLang = lang === 'tw' ? 'tw' : lang === 'en' ? 'en' : 'zh';

    const formData = new FormData(form);
    const payload = {
      inquirerType: formData.get('inquirer-type'),
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      industry: formData.get('industry'),
      product: formData.get('product'),
      message: formData.get('message'),
    };

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    const loading = feedbackCopy.loading;

    root.querySelector('.inquiry-feedback__label').innerHTML =
      bilingualHtml(loading.label.en, loading.label[copyLang]);

    showInquiryFeedback({
      type: 'loading',
      code: loading.code,
      titleHtml: bilingualHtml(loading.title.en, loading.title[copyLang]),
      messageHtml: bilingualHtml(loading.message.en, loading.message[copyLang]),
      actions: [],
    });

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      const response = await fetch(inquiryApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        if (response.status === 404 || response.status === 405) {
          throw new Error('本地静态预览无法提交询盘（缺少 API）。请使用 df-company.vercel.app/contact.html 测试。');
        }
        throw new Error(result.message || feedbackCopy.error.message.en);
      }

      const success = feedbackCopy.success;
      root.querySelector('.inquiry-feedback__label').innerHTML =
        bilingualHtml(success.label.en, success.label[copyLang]);

      showInquiryFeedback({
        type: 'success',
        code: success.code,
        titleHtml: bilingualHtml(success.title.en, success.title[copyLang]),
        messageHtml: bilingualHtml(success.message.en, success.message[copyLang]),
        metaHtml: `${buildInquiryRef()} · ${success.meta[copyLang]}`,
        actions: [{
          className: 'btn btn-primary',
          html: bilingualHtml(success.action.en, success.action[copyLang]),
          onClick: hideInquiryFeedback,
        }],
      });

      form.reset();
      if (typeof syncCompanyField === 'function') syncCompanyField();
    } catch (error) {
      const err = feedbackCopy.error;
      let detail = error.message ? escapeHtml(error.message) : '';

      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        detail = '无法连接询盘 API，请检查网络或在 df-company.vercel.app 上重试。';
      }

      const detailHtml = detail
        ? `<br><span style="opacity:0.85;font-size:0.84rem">${detail}</span>`
        : '';

      root.querySelector('.inquiry-feedback__label').innerHTML =
        bilingualHtml(err.label.en, err.label[copyLang]);

      showInquiryFeedback({
        type: 'error',
        code: err.code,
        titleHtml: bilingualHtml(err.title.en, err.title[copyLang]),
        messageHtml: bilingualHtml(err.message.en, err.message[copyLang]) + detailHtml,
        metaHtml: 'ERR · CHECK CONNECTION',
        actions: [
          {
            className: 'btn btn-primary',
            html: bilingualHtml(err.retry.en, err.retry[copyLang]),
            onClick: hideInquiryFeedback,
          },
          {
            className: 'btn btn-outline-light',
            html: bilingualHtml(err.close.en, err.close[copyLang]),
            onClick: hideInquiryFeedback,
          },
        ],
      });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
})();
