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

  var NAV = [
    { t: 'Магазин' },
    { key: 'overview', label: 'Дашборд', href: 'design-lk.html', ic: 'overview' },
    { key: 'card', label: 'Карточка магазина', href: 'design-lk-card.html', ic: 'card', n: '1' },
    { key: 'photos', label: 'Фотографии', href: 'lk-photos.html', ic: 'photo', n: '1' },
    { key: 'video', label: 'Видео', href: 'lk-video.html', ic: 'video' },
    { key: 'promos', label: 'Акции', href: 'lk-promos.html', ic: 'promo' },
    { sep: true },
    { key: 'log', label: 'Журнал изменений', href: 'lk-log.html', ic: 'log' },
    { key: 'account', label: 'Аккаунт и вход', href: 'lk-account.html', ic: 'user' },
    { key: 'help', label: 'Инструкция', href: 'lk-help.html', ic: 'help' }
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
  s.className = 'dkside';
  s.setAttribute('aria-label', 'Меню кабинета');
  s.innerHTML =
    '<div class="dkside__top"><a href="design-lk.html" class="dkside__logo">' +
      '<img src="logo-gold.png" alt="ТК «Ланской» — кабинет арендатора" width="148" height="46"></a></div>' +
    shop() +
    '<nav class="dknav" aria-label="Разделы кабинета">' + nav(s.getAttribute('data-lk') || '') + '</nav>' +
    '<div class="dkside__foot">' +
      '<p class="dkside__who">Вы вошли как<b>vladart@vladart.ru</b></p>' +
      '<a href="design-shop.html">Карточка на сайте</a>' +
      '<a href="design-lk-login.html?out=1">Выйти</a>' +
    '</div>';

  // верхняя полоса с меню — на телефоне
  var bar = document.createElement('div');
  bar.className = 'dkbar';
  bar.innerHTML = '<a href="design-lk.html"><img src="logo-gold.png" alt="ТК «Ланской» — кабинет" width="116" height="36"></a>' +
    '<button type="button" class="dkbar__btn" aria-expanded="false" aria-controls="dkSide">Меню</button>';
  document.body.insertBefore(bar, document.body.firstChild);
  var btn = bar.querySelector('button');
  function toggle(open) {
    document.body.classList.toggle('is-menu', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function () { toggle(!document.body.classList.contains('is-menu')); });
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('is-menu') && !e.target.closest('#dkSide, .dkbar__btn')) toggle(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
})();
