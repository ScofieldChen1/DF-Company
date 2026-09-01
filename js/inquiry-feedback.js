(function initContactFormFeedback() {
  const form = document.getElementById('contact-form');
  const shell = document.getElementById('contact-form-shell');
  const successView = document.getElementById('contact-form-success');
  const errorBar = document.getElementById('contact-form-error');
  const dismissBtn = document.getElementById('contact-form-dismiss');
  const submitBtn = form && form.querySelector('.contact-form-submit');

  if (!form || !shell || !successView || !submitBtn) return;

  const inquiryApiMeta = document.querySelector('meta[name="inquiry-api"]');
  let inquiryApiUrl = (inquiryApiMeta && inquiryApiMeta.content.trim()) || '/api/inquiry';

  const host = window.location.hostname;
  if (host.endsWith('github.io')) {
    inquiryApiUrl = 'https://df-company.vercel.app/api/inquiry';
  }

  let isSubmitted = false;
  let isSubmitting = false;

  const errorCopy = {
    empty: { en: 'Please fill in the required fields.', zh: '请填写反馈内容' },
    failed: { en: 'Submission failed. Please try again later.', zh: '提交失败，请稍后重试' },
    network: { en: 'Network error. Please check your connection and retry.', zh: '网络异常，请检查后重试' },
    local: {
      en: 'This preview server cannot submit inquiries. Open https://df-company.vercel.app/contact.html online, or run "npm start" locally (Node.js required).',
      zh: '当前预览方式无法提交询盘。请在线打开 df-company.vercel.app/contact.html 测试，或在安装 Node.js 后运行 npm start。',
    },
  };

  function getLang() {
    if (document.body.classList.contains('lang-en')) return 'en';
    return 'zh';
  }

  function copy(key) {
    const lang = getLang();
    return errorCopy[key][lang] || errorCopy[key].zh;
  }

  function hideError() {
    if (!errorBar) return;
    errorBar.hidden = true;
    errorBar.querySelector('.contact-form-error__text').textContent = '';
  }

  function showError(message) {
    if (!errorBar) return;
    errorBar.querySelector('.contact-form-error__text').textContent = message;
    errorBar.hidden = false;
    errorBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setSubmitting(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');

    const loadingEl = submitBtn.querySelector('.contact-form-submit__loading');
    const labelEl = submitBtn.querySelector('.contact-form-submit__label');
    if (loadingEl) {
      loadingEl.hidden = !loading;
      loadingEl.setAttribute('aria-hidden', loading ? 'false' : 'true');
    }
    if (labelEl) {
      labelEl.hidden = loading;
    }
  }

  function showSuccessView() {
    isSubmitted = true;
    hideError();
    form.classList.add('is-hidden');
    form.setAttribute('aria-hidden', 'true');

    successView.hidden = false;
    requestAnimationFrame(() => {
      successView.classList.add('is-visible');
    });

    dismissBtn.focus();
  }

  function resetToEditState() {
    isSubmitted = false;
    successView.classList.remove('is-visible');
    successView.hidden = true;
    form.classList.remove('is-hidden');
    form.removeAttribute('aria-hidden');
    form.reset();
    if (typeof syncCompanyField === 'function') syncCompanyField();
    hideError();
  }

  dismissBtn.addEventListener('click', resetToEditState);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || isSubmitted) return;

    hideError();

    const messageField = form.querySelector('#message');
    if (messageField && !messageField.value.trim()) {
      showError(copy('empty'));
      messageField.focus();
      return;
    }

    if (!form.reportValidity()) return;

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

    setSubmitting(true);

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

      showSuccessView();
    } catch (error) {
      if (error.name === 'AbortError') {
        showError(copy('network'));
      } else if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        showError(copy('network'));
      } else if (error.message === 'local') {
        showError(copy('local'));
      } else if (error.message && error.message !== 'failed') {
        showError(error.message);
      } else {
        showError(copy('failed'));
      }
    } finally {
      window.clearTimeout(timeoutId);
      setSubmitting(false);
    }
  });
})();
