/* Общие шапка и подвал для всех страниц прототипа.
   Подставляются в <div id="siteHeader" data-active="..."> и <div id="siteFooter">.
   Так меню правится в одном месте, а не в каждом файле.
   Подключать ДО app.js — он навешивает обработчики на готовую разметку. */

var LNS = (function () {

  var CATS = [
    ['Декоративно-отделочные материалы', 'category.html'],
    ['Плитка', 'category.html'],
    ['Обои', 'category.html'],
    ['Шторы, карнизы, ткани', 'category.html'],
    ['Лакокрасочные и клеящие материалы', 'category.html'],
    ['Напольные покрытия', 'category.html'],
    ['Потолки', 'category.html'],
    ['Двери, перегородки, фурнитура', 'category.html'],
    ['Остекление и оконная фурнитура', 'category.html'],
    ['Стекло и зеркала', 'category.html'],
    ['Сантехника', 'category.html'],
    ['Свет', 'category.html'],
    ['Лестницы', 'category.html'],
    ['Отопление и кондиционирование', 'category.html']
  ];

  var NAV = [
    { key: 'shops', label: 'Магазины', mega: 'shops' },
    { key: 'promos', label: 'Акции', href: 'promos.html' },
    { key: 'events', label: 'Афиша', href: 'events.html' },
    { key: 'journal', label: 'Журнал', href: 'journal.html' },
    { key: 'designers', label: 'Дизайнерам', href: '#' },
    { key: 'about', label: 'О комплексе', mega: 'about' }
  ];

  function navItems(active) {
    return NAV.map(function (n) {
      var cur = n.key === active ? ' is-current' : '';
      if (n.mega) {
        return '<li class="menu__item menu__item--has' + cur + '">' +
          '<button type="button" class="menu__link" data-mega="' + n.mega + '">' +
          n.label + '<span class="caret"></span></button></li>';
      }
      return '<li class="menu__item' + cur + '"><a class="menu__link" href="' + n.href + '">' + n.label + '</a></li>';
    }).join('');
  }

  function header(active) {
    return '' +
'  <div class="utility">' +
'    <div class="wrap utility__in">' +
'      <ul class="utility__info">' +
'        <li>10:00&nbsp;—&nbsp;20:00 ежедневно</li>' +
'        <li>Санкт-Петербург, ул. Студенческая, 10</li>' +
'        <li><a href="#">+7 (812) 363-00-07</a></li>' +
'        <li><a href="contacts.html">Как добраться</a></li>' +
'      </ul>' +
'      <ul class="utility__actions">' +
'        <li><a href="rent.html" class="btn btn--ghost btn--sm">Аренда</a></li>' +
'        <li><a href="#" class="utility__login">Войти в кабинет</a></li>' +
'      </ul>' +
'    </div>' +
'  </div>' +

'  <div class="nav">' +
'    <div class="wrap nav__in">' +
'      <a href="index.html" class="logo">' +
'        <img src="logo.svg" alt="ТК «Ланской» — торговый центр интерьерных решений" class="logo__img" width="205" height="64">' +
'      </a>' +

'      <nav class="menu" id="menu"><ul class="menu__list">' + navItems(active) + '</ul></nav>' +

'      <div class="hsearch">' +
'        <div class="field field--hs">' +
'          <input type="search" placeholder="Магазины, бренды, статьи" autocomplete="off" aria-label="Поиск по сайту">' +
'          <button type="button" class="field__go" aria-label="Найти"></button>' +
'          <div class="suggest">' +
'            <p class="suggest__group">Магазины</p>' +
'            <a href="shop.html" class="suggest__item"><span>VLADART STUDIO</span><span class="suggest__meta">секция А10 · 1 этаж</span></a>' +
'            <a href="shop.html" class="suggest__item"><span>ПРЕМЬЕР ДЕКОР</span><span class="suggest__meta">секция А12 · 1 этаж</span></a>' +
'            <p class="suggest__group">Бренды</p>' +
'            <a href="brand.html" class="suggest__item"><span>Kerama Marazzi</span><span class="suggest__meta">4 магазина</span></a>' +
'            <p class="suggest__group">Статьи</p>' +
'            <a href="article.html" class="suggest__item"><span>Комбинированный пол: плитка и ламинат</span><span class="suggest__meta">23.06.2026</span></a>' +
'            <p class="suggest__group">События</p>' +
'            <a href="event.html" class="suggest__item"><span>«Волховец» — реализация проектных продаж</span><span class="suggest__meta">28 августа</span></a>' +
'          </div>' +
'        </div>' +
'      </div>' +

'      <button type="button" class="ic-search" id="searchToggle" aria-label="Поиск по сайту"></button>' +
'      <button type="button" class="burger" id="burger" aria-label="Меню"><span></span></button>' +
'    </div>' +

'    <div class="mega" id="mega-shops" hidden>' +
'      <div class="wrap mega__in">' +
'        <div class="mega__col mega__col--wide">' +
'          <p class="mega__title">Категории</p>' +
'          <ul class="mega__cats">' +
            CATS.map(function (c) { return '<li><a href="' + c[1] + '">' + c[0] + '</a></li>'; }).join('') +
'          </ul>' +
'        </div>' +
'        <div class="mega__col">' +
'          <p class="mega__title">Навигация</p>' +
'          <ul class="mega__links">' +
'            <li><a href="shops.html">Все магазины</a></li>' +
'            <li><a href="categories.html">По категориям</a></li>' +
'            <li><a href="brands.html">Бренды</a></li>' +
'            <li><a href="floors.html">Схема этажей</a></li>' +
'          </ul>' +
'        </div>' +
'        <div class="mega__col">' +
'          <p class="mega__title">Знаете номер помещения?</p>' +
'          <div class="field field--sm">' +
'            <input type="search" placeholder="Например, А10">' +
'            <button type="button" class="field__go" aria-label="Найти"></button>' +
'          </div>' +
'          <p class="mega__hint">Секции 1—3 этажей: А, B, C</p>' +
'        </div>' +
'      </div>' +
'    </div>' +

'    <div class="mega" id="mega-about" hidden>' +
'      <div class="wrap mega__in">' +
'        <div class="mega__col">' +
'          <p class="mega__title">О комплексе</p>' +
'          <ul class="mega__links">' +
'            <li><a href="about.html">О комплексе</a></li>' +
'            <li><a href="floors.html">Схема этажей</a></li>' +
'            <li><a href="contacts.html">Парковка и как добраться</a></li>' +
'          </ul>' +
'        </div>' +
'        <div class="mega__col">' +
'          <p class="mega__title">Медиа</p>' +
'          <ul class="mega__links">' +
'            <li><a href="gallery.html">Галерея</a></li>' +
'            <li><a href="video.html">Видео</a></li>' +
'            <li><a href="events.html">Архив событий</a></li>' +
'          </ul>' +
'        </div>' +
'        <div class="mega__col">' +
'          <p class="mega__title">Контакты</p>' +
'          <ul class="mega__links">' +
'            <li><a href="contacts.html">Контакты и реквизиты</a></li>' +
'            <li><a href="contacts.html#feedback">Обратная связь</a></li>' +
'          </ul>' +
'        </div>' +
'      </div>' +
'    </div>' +

'    <div class="searchbar" id="searchbar" hidden>' +
'      <div class="wrap">' +
'        <div class="field field--lg">' +
'          <input type="search" placeholder="Магазины, бренды, статьи, события, номер помещения">' +
'          <button type="button" class="field__go" aria-label="Найти"></button>' +
'        </div>' +
'        <p class="searchbar__hint">Единый поиск по сайту · подсказки при вводе</p>' +
'      </div>' +
'    </div>' +
'  </div>';
  }

  function footer() {
    return '' +
'  <div class="wrap footer__in">' +
'    <div class="footer__brand">' +
'      <img src="logo.svg" alt="ТК «Ланской»" class="logo__img logo__img--inv" width="205" height="64">' +
'      <p class="footer__addr">Санкт-Петербург,<br>ул. Студенческая, 10</p>' +
'      <p class="footer__addr"><a href="#">+7 (812) 363-00-07</a><br>10:00 — 20:00 ежедневно</p>' +
'      <ul class="socials"><li><a href="#">VK</a></li><li><a href="#">YouTube</a></li></ul>' +
'    </div>' +
'    <div class="footer__cols">' +
'      <div><p class="footer__title">Покупателям</p><ul>' +
'        <li><a href="shops.html">Магазины</a></li>' +
'        <li><a href="categories.html">Категории</a></li>' +
'        <li><a href="brands.html">Бренды</a></li>' +
'        <li><a href="promos.html">Акции</a></li>' +
'        <li><a href="floors.html">Схема этажей</a></li></ul></div>' +
'      <div><p class="footer__title">События</p><ul>' +
'        <li><a href="events.html">Афиша</a></li><li><a href="events.html">Архив событий</a></li>' +
'        <li><a href="gallery.html">Галерея</a></li><li><a href="video.html">Видео</a></li></ul></div>' +
'      <div><p class="footer__title">Профессионалам</p><ul>' +
'        <li><a href="#">Дизайнерам</a></li><li><a href="#">Каталог дизайнеров</a></li>' +
'        <li><a href="journal.html">Журнал</a></li></ul></div>' +
'      <div><p class="footer__title">Комплекс</p><ul>' +
'        <li><a href="about.html">О комплексе</a></li><li><a href="rent.html">Аренда</a></li>' +
'        <li><a href="contacts.html">Контакты</a></li><li><a href="#">Войти в кабинет</a></li></ul></div>' +
'    </div>' +
'  </div>' +
'  <div class="wrap footer__legal">' +
'    <p>© 2026 ТК «Ланской»</p>' +
'    <ul><li><a href="#">Политика обработки ПД</a></li>' +
'    <li><a href="#">Пользовательское соглашение</a></li>' +
'    <li><a href="#">Политика cookie</a></li></ul>' +
'  </div>';
  }

  function cookie() {
    return '' +
'  <p class="cookie__text">Мы используем cookie. Вы можете выбрать, какие категории разрешить.</p>' +
'  <div class="cookie__acts">' +
'    <button type="button" class="btn btn--sm btn--ghost" data-cookie>Настроить</button>' +
'    <button type="button" class="btn btn--sm btn--ghost" data-cookie>Только необходимые</button>' +
'    <button type="button" class="btn btn--sm btn--primary" data-cookie>Принять все</button>' +
'  </div>';
  }

  /* подстановка сразу при загрузке — до того, как app.js начнёт искать элементы */
  var h = document.getElementById('siteHeader');
  if (h) { h.className = 'header'; h.innerHTML = header(h.dataset.active || ''); }

  var f = document.getElementById('siteFooter');
  if (f) { f.className = 'footer'; f.innerHTML = footer(); }

  var c = document.getElementById('siteCookie');
  if (c) { c.className = 'cookie'; c.id = 'cookie'; c.innerHTML = cookie(); }

  return { categories: CATS };
})();
