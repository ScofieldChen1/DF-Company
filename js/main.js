// 移动端导航 + Mega Menu
const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const siteHeader = document.querySelector('.site-header');
const megaWrap = document.querySelector('.mega-menu-wrap');
const megaItems = document.querySelectorAll('.nav-item[data-mega]:not([data-mega=""])');
const megaPanels = document.querySelectorAll('.mega-menu-panel');
let megaCloseTimer = null;
let activeMegaId = null;

function closeMegaMenu() {
  if (!siteHeader) return;
  siteHeader.classList.remove('mega-active');
  megaItems.forEach(item => item.classList.remove('is-mega-active'));
  megaPanels.forEach(panel => panel.classList.remove('is-active'));
  if (megaWrap) megaWrap.setAttribute('aria-hidden', 'true');
  activeMegaId = null;
}

function openMegaMenu(megaId, navItem) {
  if (!siteHeader || window.innerWidth <= 640) return;
  closeLangPanel();
  const panel = document.querySelector(`.mega-menu-panel[data-mega="${megaId}"]`);
  if (!panel) return;

  megaItems.forEach(item => item.classList.remove('is-mega-active'));
  megaPanels.forEach(p => p.classList.remove('is-active'));

  siteHeader.classList.add('mega-active');
  navItem.classList.add('is-mega-active');
  panel.classList.add('is-active');
  if (megaWrap) megaWrap.setAttribute('aria-hidden', 'false');
  activeMegaId = megaId;
}

function cancelMegaClose() {
  if (megaCloseTimer) {
    clearTimeout(megaCloseTimer);
    megaCloseTimer = null;
  }
}

function scheduleMegaClose() {
  cancelMegaClose();
  megaCloseTimer = setTimeout(closeMegaMenu, 200);
}

function initMegaMenu() {
  if (!siteHeader || !megaWrap) return;

  megaItems.forEach(item => {
    const megaId = item.dataset.mega;
    item.addEventListener('mouseenter', () => {
      cancelMegaClose();
      openMegaMenu(megaId, item);
    });
  });

  megaWrap.addEventListener('mouseenter', () => {
    cancelMegaClose();
    if (activeMegaId) {
      const navItem = document.querySelector(`.nav-item[data-mega="${activeMegaId}"]`);
      if (navItem) openMegaMenu(activeMegaId, navItem);
    }
  });

  siteHeader.addEventListener('mouseenter', cancelMegaClose);
  siteHeader.addEventListener('mouseleave', scheduleMegaClose);

  document.querySelectorAll('.nav-top-link--placeholder').forEach(link => {
    link.addEventListener('click', (e) => e.preventDefault());
  });
}

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) closeMegaMenu();
  });
}

initMegaMenu();
window.addEventListener('resize', () => {
  cancelMegaClose();
  closeMegaMenu();
  closeLangPanel();
});

// 语言切换（地球图标面板）
const LANG_KEY = 'orient-lang';
const langGlobeBtn = document.querySelector('.lang-globe-btn');
const langPanelWrap = document.querySelector('.lang-panel-wrap');
const langOptions = document.querySelectorAll('.lang-option');

function closeLangPanel() {
  if (!siteHeader) return;
  siteHeader.classList.remove('lang-panel-open');
  if (langPanelWrap) langPanelWrap.setAttribute('aria-hidden', 'true');
  if (langGlobeBtn) {
    langGlobeBtn.setAttribute('aria-expanded', 'false');
    langGlobeBtn.classList.remove('is-open');
  }
}

function openLangPanel() {
  if (!siteHeader) return;
  closeMegaMenu();
  siteHeader.classList.add('lang-panel-open');
  if (langPanelWrap) langPanelWrap.setAttribute('aria-hidden', 'false');
  if (langGlobeBtn) {
    langGlobeBtn.setAttribute('aria-expanded', 'true');
    langGlobeBtn.classList.add('is-open');
  }
}

function toggleLangPanel() {
  if (siteHeader?.classList.contains('lang-panel-open')) {
    closeLangPanel();
  } else {
    openLangPanel();
  }
}

if (langGlobeBtn) {
  langGlobeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLangPanel();
  });
}

document.addEventListener('click', (e) => {
  if (!siteHeader?.classList.contains('lang-panel-open')) return;
  if (!e.target.closest('.lang-panel-wrap') && !e.target.closest('.lang-globe-btn')) {
    closeLangPanel();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLangPanel();
});

// 简繁转换
let twConverter = null;

function initTwConverter() {
  if (typeof OpenCC !== 'undefined') {
    twConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  }
}

function cacheTranslatableElements() {
  document.querySelectorAll('.t-zh, .lang-static-zh').forEach(el => {
    if (el.dataset.zhOriginal === undefined) {
      el.dataset.zhOriginal = el.innerHTML;
    }
  });
}

function convertHtmlText(html, converter) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const walk = (node) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent = converter(child.textContent);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(wrap);
  return wrap.innerHTML;
}

function convertToTraditionalChinese() {
  if (!twConverter) return;
  document.querySelectorAll('.t-zh, .lang-static-zh').forEach(el => {
    const original = el.dataset.zhOriginal ?? el.innerHTML;
    el.dataset.zhOriginal = original;
    el.innerHTML = convertHtmlText(original, twConverter);
  });
}

function restoreSimplifiedChinese() {
  document.querySelectorAll('.t-zh, .lang-static-zh').forEach(el => {
    if (el.dataset.zhOriginal !== undefined) {
      el.innerHTML = el.dataset.zhOriginal;
    }
  });
}

initTwConverter();
cacheTranslatableElements();

function setLanguage(lang) {
  if (lang === 'both') lang = 'zh';

  if (document.body.classList.contains('lang-tw') && lang !== 'tw') {
    restoreSimplifiedChinese();
  }

  document.body.classList.remove('lang-en', 'lang-zh', 'lang-tw', 'lang-both');
  document.body.classList.add('lang-' + lang);
  langOptions.forEach(btn => btn.classList.toggle('is-active', btn.dataset.lang === lang));
  localStorage.setItem(LANG_KEY, lang);

  if (lang === 'tw') {
    convertToTraditionalChinese();
    document.documentElement.lang = 'zh-TW';
  } else if (lang === 'zh') {
    document.documentElement.lang = 'zh-CN';
  } else if (lang === 'en') {
    document.documentElement.lang = 'en';
  }

  closeLangPanel();
}

let savedLang = localStorage.getItem(LANG_KEY);
if (savedLang === 'both' || !savedLang) savedLang = 'zh';
setLanguage(savedLang);
langOptions.forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));

// URL 参数预填表单（用户路径 deep-link）
const params = new URLSearchParams(window.location.search);
const subjectMap = { quote: 'quote', custom: 'custom', partnership: 'partnership', product: 'product' };
const productMap = {
  'alloy-wheel': 'alloy-wheel',
  'steel-paper': 'steel-paper',
  'springness-plate': 'springness-plate',
  'grinding-circle': 'grinding-circle',
  'diamond-points': 'diamond-points',
  'diamond-wheel': 'diamond-wheel',
  'polishing-wheel': 'polishing-wheel',
  'active-shank': 'active-shank',
  cowhide: 'cowhide',
  'sponge-wheel': 'sponge-wheel',
  'wool-wheel': 'wool-wheel',
  'fiber-oil-stone': 'fiber-oil-stone',
  'brush-series': 'brush-series',
  'latex-wheel': 'latex-wheel',
  'psa-disc': 'psa-disc',
  'polishing-series': 'polishing-series',
  'rubber-point': 'rubber-point',
  'oil-stone': 'oil-stone',
  'abrasive-stick': 'abrasive-stick',
};

const subjectEl = document.querySelector('#subject');
const productEl = document.querySelector('#product');

if (params.get('type') && subjectEl && subjectMap[params.get('type')]) {
  subjectEl.value = subjectMap[params.get('type')];
}
if (params.get('product') && productEl && productMap[params.get('product')]) {
  productEl.value = productMap[params.get('product')];
  if (subjectEl) subjectEl.value = 'product';
}

// 询盘身份：选「个人」时隐藏公司栏
function syncCompanyField() {
  const form = document.querySelector('#contact-form');
  const companyGroup = document.querySelector('#company-group');
  const companyInput = document.querySelector('#company');
  if (!form || !companyGroup || !companyInput) return;

  const isIndividual = form.querySelector('input[name="inquirer-type"][value="individual"]:checked');
  companyGroup.classList.toggle('is-hidden', !!isIndividual);
  companyInput.required = !isIndividual;
  if (isIndividual) companyInput.value = '';
}

function initInquirerTypeToggle() {
  const form = document.querySelector('#contact-form');
  if (!form || form.dataset.inquirerBound === 'true') {
    syncCompanyField();
    return;
  }

  form.dataset.inquirerBound = 'true';
  form.addEventListener('change', (e) => {
    if (e.target.name === 'inquirer-type') syncCompanyField();
  });
  syncCompanyField();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInquirerTypeToggle);
} else {
  initInquirerTypeToggle();
}

// 联系表单 — 提交后发送邮件 / 短信通知
const form = document.querySelector('#contact-form');

function ensureInquiryFeedback() {
  let root = document.getElementById('inquiry-feedback');
  if (root) return root;

  root = document.createElement('div');
  root.id = 'inquiry-feedback';
  root.className = 'inquiry-feedback';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="inquiry-feedback__backdrop" data-inquiry-close></div>
    <div class="inquiry-feedback__panel">
      <div class="inquiry-feedback__stripe"></div>
      <div class="inquiry-feedback__header">
        <span class="inquiry-feedback__code"></span>
        <button type="button" class="inquiry-feedback__close" data-inquiry-close aria-label="Close">&times;</button>
      </div>
      <div class="inquiry-feedback__body">
        <div class="inquiry-feedback__icon" aria-hidden="true"></div>
        <h2 class="inquiry-feedback__title"></h2>
        <p class="inquiry-feedback__message"></p>
        <div class="inquiry-feedback__meta"></div>
        <div class="inquiry-feedback__actions"></div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  root.querySelectorAll('[data-inquiry-close]').forEach((el) => {
    el.addEventListener('click', () => hideInquiryFeedback());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      hideInquiryFeedback();
    }
  });

  return root;
}

function hideInquiryFeedback() {
  const root = document.getElementById('inquiry-feedback');
  if (!root) return;
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

function showInquiryFeedback(options = {}) {
  const root = ensureInquiryFeedback();
  const { type = 'success', code = '', titleHtml = '', messageHtml = '', metaHtml = '', actions = [] } = options;

  root.className = `inquiry-feedback inquiry-feedback--${type}`;
  root.querySelector('.inquiry-feedback__code').textContent = code;
  root.querySelector('.inquiry-feedback__title').innerHTML = titleHtml;
  root.querySelector('.inquiry-feedback__message').innerHTML = messageHtml;

  const meta = root.querySelector('.inquiry-feedback__meta');
  if (metaHtml) {
    meta.innerHTML = metaHtml;
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

if (form) {
  const inquiryApiMeta = document.querySelector('meta[name="inquiry-api"]');
  const inquiryApiUrl = (inquiryApiMeta && inquiryApiMeta.content.trim()) || '/api/inquiry';

  const feedbackCopy = {
    loading: {
      code: 'INQ-TRANSMIT',
      title: {
        en: 'Transmitting Inquiry',
        zh: '正在提交询盘',
        tw: '正在提交詢盤',
      },
      message: {
        en: 'Securely routing your request to our sales engineering team…',
        zh: '正在将您的询盘安全发送至销售工程团队…',
        tw: '正在將您的詢盤安全發送至銷售工程團隊…',
      },
    },
    success: {
      code: 'INQ-200 OK',
      title: {
        en: 'Inquiry Received',
        zh: '询盘已受理',
        tw: '詢盤已受理',
      },
      message: {
        en: 'Your request has been logged. Our team will respond within 24 business hours.',
        zh: '您的询盘已成功记录，我们将在 24 个工作小时内回复。',
        tw: '您的詢盤已成功記錄，我們將在 24 個工作小時內回覆。',
      },
      meta: {
        en: 'Response SLA · 24 Hours',
        zh: '响应承诺 · 24 小时内',
        tw: '響應承諾 · 24 小時內',
      },
      action: {
        en: 'Acknowledged',
        zh: '确认',
        tw: '確認',
      },
    },
    error: {
      code: 'INQ-ERR',
      title: {
        en: 'Transmission Failed',
        zh: '提交未成功',
        tw: '提交未成功',
      },
      message: {
        en: 'Please try again or contact us directly by phone or email.',
        zh: '请稍后重试，或直接通过电话 / 邮箱联系我们。',
        tw: '請稍後重試，或直接通過電話 / 郵箱聯繫我們。',
      },
      retry: {
        en: 'Try Again',
        zh: '重新提交',
        tw: '重新提交',
      },
      close: {
        en: 'Close',
        zh: '关闭',
        tw: '關閉',
      },
    },
  };

  function bilingualHtml(en, zh) {
    return `<span class="t-en">${en}</span><span class="t-zh">${zh}</span>`;
  }

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
          throw new Error(
            '本地静态预览无法提交询盘（缺少 API）。请双击「打开网站.command」用 Node 启动，或直接在 df-company.vercel.app/contact.html 测试。'
          );
        }
        throw new Error(result.message || feedbackCopy.error.message.en);
      }

      const success = feedbackCopy.success;
      const ref = buildInquiryRef();

      showInquiryFeedback({
        type: 'success',
        code: success.code,
        titleHtml: bilingualHtml(success.title.en, success.title[copyLang]),
        messageHtml: bilingualHtml(success.message.en, success.message[copyLang]),
        metaHtml: `${ref} · ${success.meta[copyLang]}`,
        actions: [{
          className: 'btn btn-primary',
          html: bilingualHtml(success.action.en, success.action[copyLang]),
          onClick: hideInquiryFeedback,
        }],
      });

      form.reset();
      syncCompanyField();
    } catch (error) {
      const err = feedbackCopy.error;
      let detail = error.message ? escapeHtml(error.message) : '';

      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        detail = '无法连接询盘 API。若使用 python -m http.server，请改用「打开网站.command」或 npm start；也可在 df-company.vercel.app 上测试。';
      }

      const detailHtml = detail
        ? `<br><span style="opacity:0.85;font-size:0.84rem">${detail}</span>`
        : '';

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
}
