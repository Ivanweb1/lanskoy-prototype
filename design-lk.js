/* ТК «Ланской» — поведение дизайн-версии кабинета (design-lk-*.html).
   design.js сюда не подключаем: он рассчитан на публичную шапку и подвал.
   Отсюда — только то, что нужно кабинету: тема, логотип под тему,
   фото под тему, показ пароля и проверка форм входа. */

(function () {
  var KEY = 'lns-theme';
  var root = document.documentElement;

  /* ---------- тема ---------- */
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    // на кремовом — полноцветный логотип, на синем — бело-золотой (брендбук стр. 08)
    [].forEach.call(document.querySelectorAll('[data-logo]'), function (img) {
      img.src = theme === 'dark' ? 'logo-gold.png' : 'logo.svg';
    });
    // светлая — дневной интерьер (стр. 39), тёмная — вечерний шоурум (стр. 38)
    [].forEach.call(document.querySelectorAll('[data-photo-light]'), function (img) {
      img.src = theme === 'dark' ? img.getAttribute('data-photo-dark') : img.getAttribute('data-photo-light');
    });
    var tog = document.getElementById('themeTog');
    if (tog) {
      tog.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      tog.setAttribute('aria-label', theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');
    }
  }

  var tog = document.getElementById('themeTog');
  if (tog) tog.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  });
  apply(current());

  /* ---------- показать / скрыть пароль ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.dpass__eye');
    if (!b) return;
    var inp = b.parentNode.querySelector('input');
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', show ? 'true' : 'false');
    b.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
    inp.focus();
  });

  /* ---------- проверка форм ----------
     Имитация: сервера нет. Пустые и неверные поля подсвечиваются, при
     верном заполнении — переход по data-next формы. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function check(f) {
    var inp = f.querySelector('input');
    if (!inp) return true;
    var v = inp.value.trim();
    var ok = inp.required ? !!v : true;
    if (ok && inp.type === 'email') ok = EMAIL.test(v);
    f.classList.toggle('is-invalid', !ok);
    return ok;
  }

  [].forEach.call(document.querySelectorAll('form[data-next]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      [].forEach.call(form.querySelectorAll('.fld'), function (f) {
        if (!check(f) && !bad) bad = f;
      });
      if (bad) { bad.querySelector('input').focus(); return; }
      location.href = form.getAttribute('data-next');
    });
  });

  // ошибка гаснет, как только человек начинает исправлять
  document.addEventListener('input', function (e) {
    var f = e.target.closest('.fld.is-invalid');
    if (f) f.classList.remove('is-invalid');
  });

  /* ---------- состояния экрана входа из адреса ----------
     ?out=1 — вышли из кабинета, ?err=1 — неверная почта или пароль */
  var q = new URLSearchParams(location.search);
  [].forEach.call(document.querySelectorAll('[data-state]'), function (el) {
    el.hidden = !q.get(el.getAttribute('data-state'));
  });
})();
