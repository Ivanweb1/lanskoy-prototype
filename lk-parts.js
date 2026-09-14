/* Оболочка кабинета арендатора: верхняя строка и боковое меню.
   Подставляются в <div id="lkBar"> и <nav id="lkNav" data-lk="...">.
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

  function bar() {
    return '' +
'  <div class="lkbar__in">' +
'    <a href="lk.html" class="lkbar__logo">' +
'      <img src="logo.svg" alt="ТК «Ланской» — кабинет арендатора" class="logo__img" width="205" height="64">' +
'    </a>' +
'    <div class="lkbar__shop">' +
'      <span class="lkbar__name">' + SHOP.name + '</span>' +
'      <span class="lkbar__place">' + SHOP.place + '</span>' +
'    </div>' +
'    <div class="lkbar__acts">' +
'      <a href="shop.html" class="lkbar__link lkbar__link--site">Карточка на сайте</a>' +
'      <a href="lk-login.html" class="lkbar__link">Выйти</a>' +
'    </div>' +
'  </div>';
  }

  function nav(active) {
    return NAV.map(function (i) {
      if (i.t) return '<p class="lknav__t">' + i.t + '</p>';
      return '<a href="' + i.href + '" class="lknav__i' + (i.key === active ? ' is-current' : '') + '">' +
        i.label + (i.n ? '<span class="lknav__n">' + i.n + '</span>' : '') + '</a>';
    }).join('');
  }

  var b = document.getElementById('lkBar');
  if (b) { b.className = 'lkbar'; b.innerHTML = bar(); }

  var n = document.getElementById('lkNav');
  if (n) { n.className = 'lknav'; n.innerHTML = nav(n.dataset.lk || ''); }

})();
