(function initInquiryFeedbackModule() {
  const form = document.querySelector('#contact-form');
  const root = document.getElementById('inquiry-feedback');
  if (!form || !root) return;

  const inquiryApiMeta = document.querySelector('meta[name="inquiry-api"]');
  let inquiryApiUrl = (inquiryApiMeta && inquiryApiMeta.content.trim()) || '/api/inquiry';

  const host = window.location.hostname;
  if (host.endsWith('github.io')) {
    inquiryApiUrl = 'https://df-company.vercel.app/api/inquiry';
  }

  root.querySelectorAll('[data-inquiry-close]').forEach((el) => {
    el.addEventListener('click', hideInquiryFeedback);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open') && !root.classList.contains('inquiry-feedback--loading')) {
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

  function getCopyLang() {
    if (document.body.classList.contains('lang-tw')) return 'tw';
    if (document.body.classList.contains('lang-en')) return 'en';
    return 'zh';
  }

  function showInquiryFeedback(options = {}) {
    const {
      type = 'success',
      code = '',
      titleHtml = '',
      messageHtml = '',
      showSuccessGreeting = false,
      metaHtml = '',
      actions = [],
    } = options;

    root.className = `inquiry-feedback inquiry-feedback--${type}`;
    root.querySelector('.inquiry-feedback__code').textContent = code;
    root.querySelector('.inquiry-feedback__title').innerHTML = titleHtml;

    const messageEl = root.querySelector('.inquiry-feedback__message');
    const greetingEl = document.getElementById('inquiry-success-greeting');

    if (showSuccessGreeting && greetingEl) {
      messageEl.hidden = true;
      messageEl.innerHTML = '';
      greetingEl.hidden = false;
    } else {
      messageEl.hidden = false;
      messageEl.innerHTML = messageHtml;
      if (greetingEl) greetingEl.hidden = true;
    }

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

    const focusTarget = root.querySelector('.inquiry-feedback__actions .btn') ||
      root.querySelector('.inquiry-feedback__close');
    if (focusTarget) focusTarget.focus();
  }

  function isPreviewMode() {
    return new URLSearchParams(window.location.search).get('preview') === 'inquiry-success';
  }

  function showSuccessFeedback() {
    const success = feedbackCopy.success;
    const langKey = getCopyLang() === 'tw' ? 'tw' : getCopyLang() === 'en' ? 'en' : 'zh';

    showInquiryFeedback({
      type: 'success',
      code: success.code,
      titleHtml: bilingualHtml(success.title.en, success.title[langKey]),
      showSuccessGreeting: true,
      metaHtml: success.meta[langKey],
      actions: [{
        className: 'btn btn-primary',
        html: bilingualHtml(success.action.en, success.action[langKey]),
        onClick: hideInquiryFeedback,
      }],
    });
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
      title: { en: 'Inquiry Received', zh: '发送成功', tw: '發送成功' },
      meta: { en: "We'll contact you shortly — in about 24 hours", zh: '响应承诺 · 24 小时内', tw: '響應承諾 · 24 小時內' },
      action: { en: 'Got it', zh: '好的', tw: '好的' },
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
    local: {
      en: 'This preview server cannot submit inquiries. Open df-company.vercel.app/contact.html online, or run "npm start" locally (Node.js required).',
      zh: '当前预览方式无法提交询盘。请在线打开 df-company.vercel.app/contact.html 测试，或在安装 Node.js 后运行 npm start。',
      tw: '當前預覽方式無法提交詢盤。請在線打開 df-company.vercel.app/contact.html 測試，或在安裝 Node.js 後運行 npm start。',
    },
    network: {
      en: 'Network error. Please check your connection and retry.',
      zh: '网络异常，请检查后重试。',
      tw: '網絡異常，請檢查後重試。',
    },
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const copyLang = getCopyLang();
    const langKey = copyLang === 'tw' ? 'tw' : copyLang === 'en' ? 'en' : 'zh';

    const messageField = form.querySelector('#message');
    if (messageField && !messageField.value.trim()) {
      showInquiryFeedback({
        type: 'error',
        code: 'INQ-VALIDATE',
        titleHtml: bilingualHtml('Missing Content', '请填写反馈内容'),
        messageHtml: bilingualHtml('Please fill in your message before submitting.', '提交前请填写留言内容。'),
        actions: [{
          className: 'btn btn-primary',
          html: bilingualHtml('OK', '知道了'),
          onClick: hideInquiryFeedback,
        }],
      });
      messageField.focus();
      return;
    }

    if (!form.reportValidity()) return;

    if (isPreviewMode()) {
      showSuccessFeedback();
      form.reset();
      if (typeof syncCompanyField === 'function') syncCompanyField();
      return;
    }

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

    const loading = feedbackCopy.loading;
    root.querySelector('.inquiry-feedback__label').innerHTML =
      bilingualHtml(loading.label.en, loading.label[langKey]);

    showInquiryFeedback({
      type: 'loading',
      code: loading.code,
      titleHtml: bilingualHtml(loading.title.en, loading.title[langKey]),
      messageHtml: bilingualHtml(loading.message.en, loading.message[langKey]),
      actions: [],
    });

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    const controller = new AbortController();
    const timeoutMs = host.endsWith('vercel.app') || host.endsWith('github.io') ? 28000 : 12000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(inquiryApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        if (response.status === 404 || response.status === 405 || response.status === 501) {
          throw new Error('local');
        }
        throw new Error(result.message || 'failed');
      }

      const success = feedbackCopy.success;

      showSuccessFeedback();

      form.reset();
      if (typeof syncCompanyField === 'function') syncCompanyField();
    } catch (error) {
      const err = feedbackCopy.error;
      let detail = '';

      if (error.name === 'AbortError') {
        detail = feedbackCopy.network[langKey];
      } else if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        detail = feedbackCopy.network[langKey];
      } else if (error.message === 'local') {
        detail = feedbackCopy.local[langKey];
      } else if (error.message && error.message !== 'failed') {
        detail = error.message;
      }

      const detailHtml = detail
        ? `<br><span style="opacity:0.85;font-size:0.84rem">${escapeHtml(detail)}</span>`
        : '';

      root.querySelector('.inquiry-feedback__label').innerHTML =
        bilingualHtml(err.label.en, err.label[langKey]);

      showInquiryFeedback({
        type: 'error',
        code: err.code,
        titleHtml: bilingualHtml(err.title.en, err.title[langKey]),
        messageHtml: bilingualHtml(err.message.en, err.message[langKey]) + detailHtml,
        metaHtml: 'ERR · CHECK CONNECTION',
        actions: [
          {
            className: 'btn btn-primary',
            html: bilingualHtml(err.retry.en, err.retry[langKey]),
            onClick: hideInquiryFeedback,
          },
          {
            className: 'btn btn-outline-light',
            html: bilingualHtml(err.close.en, err.close[langKey]),
            onClick: hideInquiryFeedback,
          },
        ],
      });
    } finally {
      window.clearTimeout(timeoutId);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  });

  if (isPreviewMode()) {
    showSuccessFeedback();
  }
})();
