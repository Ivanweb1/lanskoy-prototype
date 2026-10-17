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
    if (ok && inp.hasAttribute('data-rules')) ok = rules(inp).every(Boolean);
    if (ok && inp.hasAttribute('data-match')) ok = v === document.getElementById(inp.getAttribute('data-match')).value.trim();
    f.classList.toggle('is-invalid', !ok);
    aria(f, inp, ok);
    return ok;
  }

  /* ошибка поля — и для экранного диктора: aria-invalid + связь с текстом ошибки */
  var errN = 0;
  function aria(f, inp, ok) {
    var err = f.querySelector('.fld__err');
    if (!err) return;
    if (!err.id) err.id = 'fldErr' + (++errN);
    var ids = (inp.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== err.id; });
    if (!ok) ids.push(err.id);
    if (ids.length) inp.setAttribute('aria-describedby', ids.join(' ')); else inp.removeAttribute('aria-describedby');
    if (ok) inp.removeAttribute('aria-invalid'); else inp.setAttribute('aria-invalid', 'true');
  }

  /* куда дальше: ?first=1 (первый вход по временному паролю) идёт через
     «Придумайте свой пароль» — на настоящем сайте это знает сервер */
  function next(form) {
    var first = new URLSearchParams(location.search).get('first');
    if (first && form.hasAttribute('data-next-first')) return form.getAttribute('data-next-first');
    var url = form.getAttribute('data-next');
    if (first && form.getAttribute('data-keep') === 'first') url += (url.indexOf('?') > -1 ? '&' : '?') + 'first=1';
    return url;
  }

  /* условия пароля: не короче 8, буква, цифра (предложение, в ТЗ не заданы) */
  function rules(inp) {
    var v = inp.value;
    return [v.length >= 8, /[a-zа-яё]/i.test(v), /\d/.test(v)];
  }
  document.addEventListener('input', function (e) {
    var inp = e.target.closest('input[data-rules]');
    if (!inp) return;
    var ok = rules(inp);
    [].forEach.call(inp.closest('.fld').querySelectorAll('[data-rule]'), function (li, k) { li.classList.toggle('is-ok', ok[k]); });
  });

  [].forEach.call(document.querySelectorAll('form[data-next]:not([data-code]), form[data-swap]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      [].forEach.call(form.querySelectorAll('.fld'), function (f) {
        if (!check(f) && !bad) bad = f;
      });
      [].forEach.call(form.querySelectorAll('.check[data-req]'), function (c) {
        var ok = c.querySelector('input').checked;
        c.classList.toggle('is-invalid', !ok);
        if (!ok && !bad) bad = c;
      });
      if (bad) { bad.querySelector('input').focus(); return; }
      [].forEach.call(form.querySelectorAll('[data-echo]'), function (i) {
        var t = document.getElementById(i.getAttribute('data-echo'));
        if (t && i.value.trim()) t.textContent = i.value.trim();
      });
      if (form.hasAttribute('data-swap')) { showDone(); return; }
      location.href = next(form);
    });
  });

  document.addEventListener('change', function (e) {
    var c = e.target.closest('.check.is-invalid');
    if (c && e.target.checked) c.classList.remove('is-invalid');
  });

  /* заявка: «Ещё магазин» — пустая копия строки с кнопкой «убрать» */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('.dreq__add');
    if (add) {
      var rows = add.parentNode.querySelectorAll('.dreq__shop');
      var row = rows[0].cloneNode(true);
      row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      row.querySelectorAll('.fld').forEach(function (f) { f.classList.remove('is-invalid'); });
      add.parentNode.insertBefore(row, add);
      sync(add.parentNode);
      row.querySelector('input').focus();
      return;
    }
    var del = e.target.closest('.dreq__del');
    if (del) {
      var box = del.closest('.dreq__shops');
      del.closest('.dreq__shop').remove();
      sync(box);
      box.querySelector('.dreq__shop:last-of-type input').focus();
    }
  });
  function sync(box) {
    var rows = box.querySelectorAll('.dreq__shop');
    rows.forEach(function (r) {
      var many = rows.length > 1;
      r.classList.toggle('has-del', many);
      r.querySelector('.dreq__del').hidden = !many;
    });
  }

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
      var p = new URLSearchParams(location.search);
      var first = p.get('first') ? '&first=1' : '';
      if (code === '000000') {
        var n = (+p.get('err') || 0) + 1;
        location.href = n >= 3 ? 'design-lk-login.html?codeout=1' + first : '?err=' + n + first;
        return;
      }
      if (code === '999999') { location.href = '?expired=1' + first; return; }
      location.href = next(form);
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
  [].forEach.call(document.querySelectorAll('[data-state-off]'), function (el) {
    el.hidden = !!q.get(el.getAttribute('data-state-off'));
  });
  // сколько попыток ввода кода осталось
  var att = document.querySelector('[data-attempts]');
  if (att && q.get('err')) att.textContent = +q.get('err') >= 2 ? 'Осталась 1 попытка.' : 'Осталось 2 попытки.';
  // код устарел — повторная отправка доступна сразу
  if (q.get('expired') && document.querySelector('[data-code]')) {
    var w = document.querySelector('[data-wait]'), r = document.querySelector('[data-resend]');
    if (w && r) { w.hidden = true; r.hidden = false; }
  }
  if (q.get('sent')) showDone();
  if (q.get('sent')) [].forEach.call(document.querySelectorAll('[data-sent="wait"]'), function (s) {
    s.className = 'dstatus dstatus--wait'; s.textContent = 'На проверке';
  });

  /* обратный отсчёт блокировки: дошёл до нуля — снова на вход */
  var cd = document.querySelector('[data-countdown]');
  if (cd) {
    var sec = +cd.getAttribute('data-countdown');
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var cdId = setInterval(function () {
      if (--sec <= 0) { clearInterval(cdId); location.href = 'design-lk-login.html'; return; }
      cd.textContent = two(Math.floor(sec / 60)) + ':' + two(sec % 60);
    }, 1000);
  }
})();
