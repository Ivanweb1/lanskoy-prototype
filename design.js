/* ТК «Ланской» — дизайн главной. Переключатель темы и подмена медиа под тему.
   ТЗ п. 9.7: тёмная тема обязательна. Способ выбора темы в ТЗ не описан —
   реализовано: системная настройка по умолчанию + ручной переключатель в шапке,
   выбор запоминается. Вопрос про тему по умолчанию открыт для заказчика. */

(function () {
  var KEY = 'lns-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);

    // логотип: на тёмном фоне знак тёмно-синим не читается.
    // Брендбук стр. 08 — на тёмном фоне используется инверсная версия.
    var logo = document.querySelector('.nav .logo__img');
    if (logo) logo.src = theme === 'dark' ? 'logo-dark.svg' : 'logo.svg';

    // подвал тёмно-синий в обеих темах, поэтому там всегда инверсная версия:
    // тёмный знак логотипа на тёмном фоне не читался
    var flogo = document.querySelector('.footer .logo__img--inv');
    if (flogo) flogo.src = 'logo-dark.svg';

    // фотография первого экрана: светлая — просторный светлый интерьер (стр. 39),
    // тёмная — вечерний шоурум с тёплым светом (стр. 38)
    var photo = document.getElementById('heroPhoto');
    if (photo) photo.src = theme === 'dark' ? 'img/hero-dark.webp' : 'img/hero-light.webp';

    var tog = document.getElementById('themeTog');
    if (tog) {
      tog.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      tog.querySelector('.themetog__t').textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
    }
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  }

  // кнопку добавляем в готовую утилитарную строку, чтобы не трогать partials.js прототипа
  function mount() {
    var host = document.querySelector('.utility__actions');
    if (!host || document.getElementById('themeTog')) return;
    var li = document.createElement('li');
    li.className = 'themetog-li';
    li.innerHTML = '<button type="button" class="themetog" id="themeTog" aria-pressed="false">' +
                   '<span class="themetog__ic" aria-hidden="true"></span>' +
                   '<span class="themetog__t">Тёмная тема</span></button>';
    host.appendChild(li);   // служебный элемент — в самый край, после «Войти в кабинет»
    li.querySelector('button').addEventListener('click', toggle);
  }

  mount();
  apply(current());

  // пока фотографии нет — остаётся подложка-паттерн, а сам <img> спрятан,
  // чтобы не показывать alt-текст битой картинки
  function watch(img) {
    if (!img) return;
    var show = function () { img.style.visibility = 'visible'; };
    var hide = function () { img.style.visibility = 'hidden'; };
    img.addEventListener('load', show);
    img.addEventListener('error', hide);
    if (img.complete) { img.naturalWidth ? show() : hide(); }
  }

  watch(document.getElementById('heroPhoto'));
  [].forEach.call(document.querySelectorAll('.cat__img, .ecard__img, .pcard__img, .jimg, .fimg, .rimg'), watch);


  /* ---------- меню по центру строки навигации ----------
     Иконку поиска и бургер собираем в одну группу, чтобы строка стала
     сеткой «1fr — меню — 1fr»: тогда меню центрируется по контейнеру,
     а не по остатку между логотипом и иконкой. */
  (function () {
    var navIn = document.querySelector('.nav__in');
    if (!navIn || navIn.querySelector('.nav__side')) return;
    var side = document.createElement('div');
    side.className = 'nav__side';
    var ic = navIn.querySelector('.ic-search');
    var bg = navIn.querySelector('.burger');
    if (ic) side.appendChild(ic);   // обработчики app.js остаются: узлы те же
    if (bg) side.appendChild(bg);
    navIn.appendChild(side);
  })();

  /* ---------- шапка: липкая + компактное состояние ---------- */
  var header = document.querySelector('.header');
  if (header) {
    // затемнение под раскрытой шапкой
    var scrim = document.createElement('div');
    scrim.className = 'hscrim';
    document.body.appendChild(scrim);

    var compact = false;
    function onScroll() {
      var next = window.scrollY > 24;
      if (next !== compact) {
        compact = next;
        document.body.classList.toggle('is-sticky', compact);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // подсветка иконки и затемнение страницы, пока открыт поиск или мегаменю.
    // Обработчики прототипа (app.js) сами открывают панели — мы только следим
    // за их состоянием, чтобы не дублировать логику.
    var bar = document.getElementById('searchbar');
    function syncPanels() {
      var searchOpen = bar && !bar.hidden;
      var megaOpen = !![].filter.call(document.querySelectorAll('.mega'), function (m) { return !m.hidden; }).length;
      document.body.classList.toggle('is-search-open', !!searchOpen);
      document.body.classList.toggle('is-mega-open', megaOpen);
    }
    var mo = new MutationObserver(syncPanels);
    [].forEach.call(document.querySelectorAll('.mega, #searchbar'), function (el) {
      mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
    });
    syncPanels();

    scrim.addEventListener('click', function () {
      if (bar) bar.hidden = true;
      [].forEach.call(document.querySelectorAll('.mega'), function (m) { m.hidden = true; });
      [].forEach.call(document.querySelectorAll('.menu__item--has'), function (i) { i.classList.remove('is-open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') scrim.click();
    });
  }

  // состояние «событий нет» — п. 6.8 ТЗ. Показывается по адресу ?events=0,
  // панели состояний в прототипе нет, как и на страницах кабинета.
  if (/[?&]events=0(&|$)/.test(location.search)) {
    var grid = document.getElementById('eventsGrid');
    var empty = document.getElementById('eventsEmpty');
    if (grid && empty) { grid.hidden = true; empty.hidden = false; }
  }
})();
