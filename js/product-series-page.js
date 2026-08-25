(function () {
  var params = new URLSearchParams(window.location.search);
  var seriesId = params.get('series');
  var data = window.PRODUCT_SERIES_DATA && window.PRODUCT_SERIES_DATA[seriesId];

  if (!data) {
    document.body.innerHTML = '<div class="container" style="padding:120px 0;text-align:center"><h1>产品系列未找到</h1><p><a href="../products.html">返回产品目录</a></p></div>';
    return;
  }

  var seriesHash = {
    rough: '#rough',
    precision: '#precision',
    polishing: '#polishing',
    deburring: '#deburring'
  };

  document.title = data.title.zh + ' — Orient Abrasives';
  document.querySelector('meta[name="description"]').setAttribute('content', data.desc.zh);

  var breadcrumbSeries = document.getElementById('breadcrumb-series');
  var breadcrumbCurrent = document.getElementById('breadcrumb-current');
  var pageEyebrow = document.getElementById('page-eyebrow');
  var pageTitle = document.getElementById('page-title');
  var pageDescEn = document.getElementById('page-desc-en');
  var pageDescZh = document.getElementById('page-desc-zh');
  var subGrid = document.getElementById('product-sub-grid');
  var ctaLink = document.getElementById('series-cta-link');

  if (breadcrumbSeries) {
    breadcrumbSeries.href = '../products.html' + (seriesHash[data.series] || '');
    breadcrumbSeries.querySelector('.t-zh').textContent = data.seriesLabel.zh;
    breadcrumbSeries.querySelector('.t-en').textContent = data.seriesLabel.en;
  }
  if (breadcrumbCurrent) {
    breadcrumbCurrent.querySelector('.t-zh').textContent = data.title.zh;
    breadcrumbCurrent.querySelector('.t-en').textContent = data.title.en;
  }
  if (pageEyebrow) {
    pageEyebrow.querySelector('.t-zh').textContent = data.seriesLabel.zh;
    pageEyebrow.querySelector('.t-en').textContent = data.seriesLabel.en;
  }
  if (pageTitle) {
    pageTitle.querySelector('.t-zh').textContent = data.title.zh;
    pageTitle.querySelector('.t-en').textContent = data.title.en;
  }
  if (pageDescZh) pageDescZh.textContent = data.desc.zh;
  if (pageDescEn) pageDescEn.textContent = data.desc.en;
  if (ctaLink) ctaLink.href = '../contact.html?product=' + encodeURIComponent(data.contactProduct);

  if (!subGrid) return;

  subGrid.innerHTML = data.items.map(function (item) {
    return (
      '<article class="product-subitem">' +
        '<div class="product-subitem-photo"><img src="' + item.image + '" alt=""></div>' +
        '<div class="product-subitem-body">' +
          '<h3><span class="t-en">' + item.name.en + '</span><span class="t-zh">' + item.name.zh + '</span></h3>' +
          '<p class="t-en">' + item.desc.en + '</p>' +
          '<p class="t-zh">' + item.desc.zh + '</p>' +
          '<a href="../contact.html?product=' + encodeURIComponent(item.id) + '">' +
            '<span class="t-en">Inquire →</span><span class="t-zh">咨询 →</span>' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }).join('');
})();
