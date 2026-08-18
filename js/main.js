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
  'polishing-wheel': 'polishing-wheel',
  'active-shank': 'active-shank',
  'steel-paper': 'steel-paper',
  'grinding-circle': 'grinding-circle',
  'polishing-series': 'polishing-series',
  'springness-plate': 'springness-plate',
  'cowhide': 'cowhide',
  'sponge-wheel': 'sponge-wheel',
  'latex-wheel': 'latex-wheel',
  'diamond-points': 'diamond-points',
  'alloy-wheel': 'alloy-wheel',
  'diamond-wheel': 'diamond-wheel'
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
if (form) {
  const inquiryApiMeta = document.querySelector('meta[name="inquiry-api"]');
  const inquiryApiUrl = (inquiryApiMeta && inquiryApiMeta.content.trim()) || '/api/inquiry';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const lang = document.body.classList.contains('lang-tw') ? 'tw' :
                 document.body.classList.contains('lang-zh') ? 'zh' :
                 document.body.classList.contains('lang-en') ? 'en' : 'zh';

    const successMessages = {
      en: 'Thank you! We will respond within 24 business hours.',
      zh: '感谢您的询盘！我们将在 24 个工作小时内回复。',
      tw: '感謝您的詢盤！我們將在 24 個工作小時內回覆。',
      both: 'Thank you! We will respond within 24 business hours.\n感谢您的询盘！我们将在 24 个工作小时内回复。'
    };

    const errorMessages = {
      en: 'Submission failed. Please try again or contact us directly.',
      zh: '提交失败，请稍后重试或直接联系我们。',
      tw: '提交失敗，請稍後重試或直接聯繫我們。',
      both: 'Submission failed.\n提交失败，请稍后重试。'
    };

    const sendingMessages = {
      en: 'Sending…',
      zh: '发送中…',
      tw: '發送中…',
      both: 'Sending… / 发送中…'
    };

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

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="t-en">${sendingMessages.en}</span><span class="t-zh">${sendingMessages.zh}</span>`;
      }

      const response = await fetch(inquiryApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || errorMessages[lang] || errorMessages.both);
      }

      alert(successMessages[lang] || successMessages.both);
      form.reset();
      syncCompanyField();
    } catch (error) {
      alert(error.message || errorMessages[lang] || errorMessages.both);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}
