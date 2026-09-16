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

  /* Одна учётная запись на все магазины арендатора (ответ заказчика):
     у каждого магазина своя карточка, переключение — здесь.
     Второй магазин — заглушка, реальных данных о нём нет. */
  var SHOPS = [
    { name: SHOP.name, place: SHOP.place, current: true },
    { name: 'Второй магазин арендатора', place: 'Секция — · этаж —', ph: true }
  ];

  function switcher() {
    return '' +
'    <details class="lkswitch">' +
'      <summary class="lkswitch__btn" aria-label="Сменить магазин">' +
'        <span class="lkside__name">' + SHOP.name + '</span>' +
'        <span class="lkside__place">' + SHOP.place + '</span>' +
'      </summary>' +
'      <div class="lkswitch__list">' +
'        <p class="lkswitch__t">Ваши магазины</p>' +
        SHOPS.map(function (s) {
          return '<a href="lk.html" class="lkswitch__i' + (s.current ? ' is-current' : '') + '">' +
            '<span class="' + (s.ph ? 'ph-mark' : '') + '">' + s.name + '</span>' +
            '<small class="' + (s.ph ? 'ph-mark' : '') + '">' + s.place + '</small></a>';
        }).join('') +
'      </div>' +
'    </details>';
  }

  var NAV = [
    { t: 'Магазин' },
    { key: 'overview', label: 'Обзор', href: 'lk.html' },
    { key: 'card', label: 'Карточка магазина', href: 'lk-card.html' },
    { key: 'photos', label: 'Фотографии', href: 'lk-photos.html' },
    { key: 'video', label: 'Видео', href: 'lk-video.html' },
    { key: 'promos', label: 'Акции', href: 'lk-promos.html', n: '2' },
    { sep: true },
    { key: 'log', label: 'Журнал изменений', href: 'lk-log.html' },
    { key: 'account', label: 'Аккаунт и вход', href: 'lk-account.html' },
    { key: 'help', label: 'Инструкция', href: 'lk-help.html' }
  ];

  function nav(active) {
    return NAV.map(function (i) {
      if (i.t) return '<p class="lknav__t">' + i.t + '</p>';
      if (i.sep) return '<hr class="lknav__sep">';
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
      switcher() +
'    <div class="lkside__links">' +
'      <a href="shop.html">Карточка на сайте</a>' +
'      <a href="lk-login.html?out=1">Выйти</a>' +
'    </div>' +
'  </div>';
  }

  /* Инструкция открывается и без входа — со страниц входа, кода,
     восстановления пароля и заявки. Тогда вместо меню кабинета простая
     шапка, а ссылки на закрытые разделы ведут на вход. */
  function guest() {
    return '' +
'  <a href="index.html" class="lkguest__logo">' +
'    <img src="logo.svg" alt="ТК «Ланской» — на главную" class="logo__img" width="205" height="64">' +
'  </a>' +
'  <nav class="lkguest__links">' +
'    <a href="index.html" class="lkauth__mini">На сайт комплекса</a>' +
'    <a href="lk-login.html" class="btn btn--primary btn--sm">Войти в кабинет</a>' +
'  </nav>';
  }

  var s = document.getElementById('lkSide');
  var isGuest = s && s.dataset.lk === 'help' && /[?&]guest=1/.test(location.search);
  if (isGuest) {
    s.className = 'lkguest'; s.innerHTML = guest();
    document.body.classList.add('is-guest');
    var CLOSED = ['lk.html', 'lk-card.html', 'lk-photos.html', 'lk-video.html', 'lk-promos.html', 'lk-log.html', 'lk-account.html'];
    document.querySelectorAll('.lkmain a[href]').forEach(function (a) {
      if (CLOSED.indexOf(a.getAttribute('href')) > -1) a.setAttribute('href', 'lk-login.html');
    });
  } else if (s) { s.className = 'lkside'; s.innerHTML = side(s.dataset.lk || ''); }

})();
