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
    var logo = document.querySelector('.logo__img');
    if (logo) logo.src = theme === 'dark' ? 'logo-dark.svg' : 'logo.svg';

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
  [].forEach.call(document.querySelectorAll('.cat__img'), watch);
})();
