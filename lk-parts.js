/* Боковая панель кабинета арендатора.
   Подставляется в <aside id="lkSide" data-lk="...">.
   Публичный header сюда не тянем сознательно: кабинет — рабочий
   инструмент, мегаменю и поиск по сайту в нём только мешают.
   app.js на страницах кабинета не подключается — он рассчитан на
   публичную шапку и без неё падает на первом же обработчике. */

(function () {

  /* Демо-арендатор тот же, что в публичной части (shop.html): данные
     реальные, с действующего сайта, чтобы кабинет и карточка сходились. */
  var SHOP = { name: 'VLADART STUDIO', place: 'Секция А10 · 1 этаж' };

  var NAV = [
    { t: 'Магазин' },
    { key: 'overview', label: 'Обзор', href: 'lk.html' },
    { key: 'card', label: 'Карточка магазина', href: 'lk-card.html' },
    { key: 'photos', label: 'Фотографии', href: 'lk-photos.html' },
    { key: 'video', label: 'Видео', href: 'lk-video.html' },
    { key: 'promos', label: 'Акции', href: 'lk-promos.html', n: '2' },
    { t: 'Прочее' },
    { key: 'log', label: 'Журнал изменений', href: 'lk-log.html' },
    { key: 'account', label: 'Аккаунт и вход', href: 'lk-account.html' }
  ];

  function nav(active) {
    return NAV.map(function (i) {
      if (i.t) return '<p class="lknav__t">' + i.t + '</p>';
      return '<a href="' + i.href + '" class="lknav__i' + (i.key === active ? ' is-current' : '') + '">' +
        i.label + (i.n ? '<span class="lknav__n">' + i.n + '</span>' : '') + '</a>';
    }).join('');
  }

  function side(active) {
    return '' +
'  <div class="lkside__top">' +
'    <a href="lk.html" class="lkside__logo">' +
'      <img src="logo.svg" alt="ТК «Ланской» — кабинет арендатора" class="logo__img" width="205" height="64">' +
'    </a>' +
'  </div>' +
'  <nav class="lkside__nav" aria-label="Разделы кабинета">' + nav(active) + '</nav>' +
'  <div class="lkside__foot">' +
'    <p class="lkside__name">' + SHOP.name + '</p>' +
'    <p class="lkside__place">' + SHOP.place + '</p>' +
'    <div class="lkside__links">' +
'      <a href="shop.html">Карточка на сайте</a>' +
'      <a href="lk-login.html">Выйти</a>' +
'    </div>' +
'  </div>';
  }

  var s = document.getElementById('lkSide');
  if (s) { s.className = 'lkside'; s.innerHTML = side(s.dataset.lk || ''); }

})();
