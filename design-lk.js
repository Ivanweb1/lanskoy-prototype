/* ТК «Ланской» — поведение дизайн-версии кабинета (design-lk-*.html).
   design.js подключается только там, где стоит общая шапка сайта (вход).
   Отсюда — только то, что нужно кабинету: показ пароля и проверка форм.
   Вход и код — с переключателем темы сайта; внутри кабинета тема только светлая. */

(function () {
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

  [].forEach.call(document.querySelectorAll('form[data-next]:not([data-code]), form[data-swap]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      [].forEach.call(form.querySelectorAll('.fld'), function (f) {
        if (!check(f) && !bad) bad = f;
      });
      if (bad) { bad.querySelector('input').focus(); return; }
      if (form.hasAttribute('data-swap')) { showDone(); return; }
      location.href = form.getAttribute('data-next');
    });
  });

  // ошибка гаснет, как только человек начинает исправлять
  document.addEventListener('input', function (e) {
    var f = e.target.closest('.fld.is-invalid');
    if (f) f.classList.remove('is-invalid');
  });

  /* ---------- код подтверждения ----------
     Цифра — переход к следующей ячейке, Backspace — к предыдущей,
     вставка из буфера раскладывает код по ячейкам. Демо: 000000 — неверный код. */
  [].forEach.call(document.querySelectorAll('form[data-code]'), function (form) {
    var cells = [].slice.call(form.querySelectorAll('.dotp input'));
    var fld = form.querySelector('.dotp').closest('.fld');
    function mark() { cells.forEach(function (c) { c.classList.toggle('is-filled', !!c.value); }); }
    function fill(from, digits) {
      digits.split('').forEach(function (d, k) { if (cells[from + k]) cells[from + k].value = d; });
      mark();
      var next = cells[Math.min(from + digits.length, cells.length - 1)];
      next.focus(); next.select();
    }
    cells.forEach(function (c, i) {
      c.addEventListener('input', function () {
        var d = c.value.replace(/\D/g, '');
        c.value = '';
        if (d) fill(i, d.slice(0, cells.length - i)); else mark();
      });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !c.value && i > 0) { cells[i - 1].value = ''; cells[i - 1].focus(); mark(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && i > 0) { cells[i - 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowRight' && i < cells.length - 1) { cells[i + 1].focus(); e.preventDefault(); }
      });
      c.addEventListener('focus', function () { c.select(); });
      c.addEventListener('paste', function (e) {
        var d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (!d) return;
        e.preventDefault(); fill(i, d.slice(0, cells.length - i));
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = cells.map(function (c) { return c.value; }).join('');
      if (code.length < cells.length) {
        fld.classList.add('is-invalid');
        (cells.filter(function (c) { return !c.value; })[0] || cells[0]).focus();
        return;
      }
      if (code === '000000') { location.search = '?err=1'; return; }
      location.href = form.getAttribute('data-next');
    });
  });

  /* таймер повторной отправки: на экране кода — сразу, на восстановлении
     пароля — когда показано «Проверьте почту» */
  function startTimer(box) {
    var timer = box.querySelector('[data-timer]');
    if (!timer || timer.dataset.run) return;
    timer.dataset.run = '1';
    var left, id;
    var wait = box.querySelector('[data-wait]');
    var again = box.querySelector('[data-resend]');
    var tick = function () {
      timer.textContent = '00:' + (left < 10 ? '0' : '') + left;
      if (left-- <= 0) { clearInterval(id); wait.hidden = true; again.hidden = false; }
    };
    var run = function () { left = +timer.getAttribute('data-timer'); id = setInterval(tick, 1000); tick(); };
    again.addEventListener('click', function () {
      wait.hidden = false; again.hidden = true;
      wait.firstChild.textContent = 'Отправлено повторно. Ещё раз — через ';
      run();
    });
    run();
  }
  [].forEach.call(document.querySelectorAll('[data-timer]'), function (t) {
    var step = t.closest('[data-step]');
    if (!step || !step.hidden) startTimer(step || document);
  });

  /* форма с data-swap: при верном заполнении вместо формы — следующий шаг.
     ?sent=1 открывает экран сразу на этом шаге */
  function showDone() {
    var f = document.querySelector('[data-step="form"]'), d = document.querySelector('[data-step="done"]');
    if (!f || !d) return;
    f.hidden = true; d.hidden = false; startTimer(d);
  }

  /* ---------- состояния экрана входа из адреса ----------
     ?out=1 — вышли из кабинета, ?err=1 — неверная почта или пароль */
  var q = new URLSearchParams(location.search);
  [].forEach.call(document.querySelectorAll('[data-state]'), function (el) {
    el.hidden = !q.get(el.getAttribute('data-state'));
  });
  if (q.get('sent')) showDone();
})();
