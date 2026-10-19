/* ТК «Ланской» — боковая панель кабинета (дизайн-версия).
   Подставляется в <aside id="dkSide" data-lk="раздел">. Разметка одна на все
   разделы, поэтому собирается здесь, как lk-parts.js в Ч/Б. Ссылки ведут на
   дизайн-версии, где они уже есть, иначе — на Ч/Б-прототип. */

(function () {
  // демо-арендатор — тот же, что в публичной карточке (shop.html)
  var SHOPS = [
    { name: 'VLADART STUDIO', place: 'Секция А10 · 1 этаж', current: true },
    { name: 'ФАКТУРА ДЕКОР', place: 'Секция В22 · 2 этаж' }  // второй магазин — демо, вымышленный
  ];
  var cur = SHOPS[0];

  // инициалы для круга: по первой букве двух первых слов (VLADART STUDIO → VS)
  function initials(n) {
    var w = n.replace(/[«»"']/g, '').split(/\s+/).filter(Boolean);
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : w[0].charAt(1))).toUpperCase();
  }

  var NAV = [
    { t: 'Магазин' },
    { key: 'overview', label: 'Дашборд', href: 'design-lk.html', ic: 'overview' },
    { key: 'card', label: 'Карточка магазина', href: 'design-lk-card.html', ic: 'card', n: '1' },
    { key: 'photos', label: 'Фотографии', href: 'design-lk-photos.html', ic: 'photo', n: '1' },
    { key: 'video', label: 'Видео', href: 'design-lk-video.html', ic: 'video' },
    { key: 'promos', label: 'Акции', href: 'design-lk-promos.html', ic: 'promo' },
    { sep: true },
    { key: 'log', label: 'Журнал изменений', href: 'design-lk-log.html', ic: 'log' },
    { key: 'account', label: 'Аккаунт и вход', href: 'design-lk-account.html', ic: 'user' },
    { key: 'help', label: 'Инструкция', href: 'design-lk-help.html', ic: 'help' }
  ];

  function shop() {
    return '<details class="dkshop">' +
      '<summary aria-label="Сменить магазин"><span class="dkshop__name">' + cur.name + '</span>' +
      '<span class="dkshop__place">' + cur.place + '</span></summary>' +
      '<div class="dkshop__list"><p class="dkshop__t">Ваши магазины</p>' +
      SHOPS.map(function (s) {
        return '<a href="design-lk.html" class="dkshop__i' + (s.current ? ' is-current' : '') + (s.ph ? ' is-ph' : '') + '">' +
          s.name + '<small>' + s.place + '</small></a>';
      }).join('') + '</div></details>';
  }

  /* счётчик у раздела — только то, что ждёт действия арендатора:
     отклонённое модератором. Не число акций и не новые записи */
  var quiet = /[?&](sent|empty)=1/.test(location.search);

  function nav(active) {
    return NAV.map(function (i) {
      if (i.t) return '<p class="dknav__t">' + i.t + '</p>';
      if (i.sep) return '<hr class="dknav__sep">';
      var on = i.key === active;
      return '<a href="' + i.href + '" class="dknav__i' + (on ? ' is-current' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="dknav__ic" style="--ic:var(--ic-' + i.ic + ')" aria-hidden="true"></span>' + i.label +
        (i.n && !quiet ? '<span class="dknav__n" title="Нужно исправить">' + i.n + '<span class="hp"> — нужно исправить</span></span>' : '') + '</a>';
    }).join('');
  }

  var s = document.getElementById('dkSide');
  if (!s) return;

  /* инструкция открывается и без входа — со страниц входа (?guest=1):
     вместо меню кабинета простая полоса, закрытые разделы ведут на вход */
  if (s.getAttribute('data-lk') === 'help' && /[?&]guest=1/.test(location.search)) {
    document.body.classList.add('is-guest');
    var g = document.createElement('header');
    g.className = 'dkguest';
    g.innerHTML = '<a href="design.html"><img src="logo-gold.png" alt="ТК «Ланской» — на главную" width="135" height="42"></a>' +
      '<nav class="dkguest__acts"><a href="design.html" class="dkguest__site">На сайт комплекса</a>' +
      '<a href="design-lk-login.html" class="dbtn dbtn--fill">Войти в кабинет</a></nav>';
    s.replaceWith(g);
    document.body.insertBefore(g, document.body.firstChild);
    [].forEach.call(document.querySelectorAll('.dkmain a[href^="design-lk"]'), function (a) {
      if (!/design-lk-(login|request|reset)\.html/.test(a.getAttribute('href'))) a.setAttribute('href', 'design-lk-login.html');
    });
    return;
  }
  s.className = 'dkside';
  s.setAttribute('aria-label', 'Меню кабинета');
  s.innerHTML =
    '<div class="dkside__top"><a href="design-lk.html" class="dkside__logo">' +
      '<img src="logo-gold.png" alt="ТК «Ланской» — кабинет арендатора" width="148" height="46"></a></div>' +
    shop() +
    '<a href="design-shop.html" class="dkshop__site">Карточка на сайте</a>' +
    '<nav class="dknav" aria-label="Разделы кабинета">' + nav(s.getAttribute('data-lk') || '') + '</nav>' +
    '<div class="dkside__foot">' +
      '<p class="dkside__who">Вы вошли как<b>vladart@vladart.ru</b></p>' +
      '<a href="design-lk-login.html?out=1">Выйти</a>' +
    '</div>';

  /* журнал как уведомления: точка у иконки, пока последнее решение
     администрации не просмотрено; открыли журнал — точка гаснет */
  var LAST_DECISION = '2026-09-12T16:40';
  var logNew = false;
  try {
    if (s.getAttribute('data-lk') === 'log') localStorage.setItem('lkLogSeen', LAST_DECISION);
    else logNew = !quiet && localStorage.getItem('lkLogSeen') !== LAST_DECISION;
  } catch (e) { logNew = !quiet && s.getAttribute('data-lk') !== 'log'; }

  // верхняя полоса с меню — на телефоне
  var bar = document.createElement('div');
  bar.className = 'dkbar';
  bar.innerHTML = '<a href="design-lk.html"><img src="logo-gold.png" alt="ТК «Ланской» — кабинет" width="116" height="36"></a>' +
    '<a href="design-lk-log.html" class="dkbar__log' + (logNew ? ' is-new' : '') + '" aria-label="Журнал изменений' + (logNew ? ' — есть новое решение администрации' : '') + '">' +
      '<span class="dknav__ic" style="--ic:var(--ic-log)" aria-hidden="true"></span></a>' +
    '<div class="dkme">' +
      '<button type="button" class="dkme__btn" aria-expanded="false" aria-controls="dkMe" aria-label="Магазин ' + cur.name + ' — меню">' +
        '<span class="dkme__av" aria-hidden="true">' + initials(cur.name) + '</span></button>' +
      '<div class="dkme__pop" id="dkMe" hidden>' +
        '<div class="dkme__cur"><b>' + cur.name + '</b><span>' + cur.place + '</span></div>' +
        '<a href="design-shop.html" class="dkme__a dkme__a--ext">Карточка на сайте</a>' +
        (SHOPS.length > 1 ? '<p class="dkme__t">Другие магазины</p>' + SHOPS.filter(function (x) { return !x.current; }).map(function (x) {
          return '<a href="design-lk.html" class="dkme__shop"><span class="dkme__av dkme__av--sm" aria-hidden="true">' + initials(x.name) + '</span>' +
            '<span><b>' + x.name + '</b><small>' + x.place + '</small></span></a>';
        }).join('') : '') +
        '<div class="dkme__acc"><span>Вы вошли как<b>vladart@vladart.ru</b></span>' +
        '<a href="design-lk-login.html?out=1" class="dkme__a">Выйти</a></div>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="dkbar__btn" aria-expanded="false" aria-controls="dkSide">Меню</button>';
  document.body.insertBefore(bar, document.body.firstChild);

  /* нижнее меню — на телефоне: основные разделы, остальное под «Ещё» */
  var TABS = [
    { key: 'overview', label: 'Дашборд' },
    { key: 'card', label: 'Карточка' },
    { key: 'photos', label: 'Фото' },
    { key: 'promos', label: 'Акции' }
  ];
  var active = s.getAttribute('data-lk') || '';
  var inTabs = TABS.some(function (t) { return t.key === active; });
  var tab = document.createElement('nav');
  tab.className = 'dktab';
  tab.setAttribute('aria-label', 'Основные разделы');
  tab.innerHTML = TABS.map(function (t) {
    var i = NAV.filter(function (n) { return n.key === t.key; })[0], on = t.key === active;
    return '<a href="' + i.href + '" class="dktab__i' + (on ? ' is-current' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
      '<span class="dktab__ic" aria-hidden="true"><span class="dknav__ic" style="--ic:var(--ic-' + i.ic + ')"></span>' +
      (i.n && !quiet ? '<span class="dktab__n">' + i.n + '<span class="hp"> — нужно исправить</span></span>' : '') + '</span>' +
      t.label + '</a>';
  }).join('') +
    '<button type="button" class="dktab__i dktab__more' + (inTabs ? '' : ' is-current') + '" aria-expanded="false" aria-controls="dkSide">' +
    '<span class="dktab__ic" aria-hidden="true"><span class="dktab__burger"></span></span>Ещё</button>';
  document.body.appendChild(tab);
  document.body.classList.add('has-tab');
  var more = tab.querySelector('.dktab__more');
  more.addEventListener('click', function () { toggle(!document.body.classList.contains('is-menu')); });

  /* на страницах с панелью отправки меню уезжает при прокрутке вниз
     и возвращается при прокрутке вверх — чтобы две панели не занимали пол-экрана */
  if (document.querySelector('.dkbarbot')) {
    var lastY = window.pageYOffset, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset, d = y - lastY;
        if (y < 80) document.body.classList.remove('tab-hidden');
        else if (d > 8) document.body.classList.add('tab-hidden');
        else if (d < -8) document.body.classList.remove('tab-hidden');
        if (Math.abs(d) > 8 || y < 80) lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  var btn = bar.querySelector('.dkbar__btn');
  // круг магазина: выпадающий список с полным названием, другими магазинами и выходом
  var me = bar.querySelector('.dkme__btn'), pop = bar.querySelector('.dkme__pop');
  function meOpen(open) {
    pop.hidden = !open;
    me.setAttribute('aria-expanded', String(open));
  }
  me.addEventListener('click', function () { meOpen(pop.hidden); });
  document.addEventListener('click', function (e) { if (!pop.hidden && !e.target.closest('.dkme')) meOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { meOpen(false); me.focus(); } });

  function toggle(open) {
    document.body.classList.toggle('is-menu', open);
    btn.setAttribute('aria-expanded', String(open));
    more.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function () { toggle(!document.body.classList.contains('is-menu')); });
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('is-menu') && !e.target.closest('#dkSide, .dkbar__btn, .dktab__more')) toggle(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
})();
