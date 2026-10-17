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
    // телефон: целиком, с кодом страны и города — 11 цифр, начиная с 7 или 8
    if (ok && inp.hasAttribute('data-phone') && v) { var d = v.replace(/\D/g, ''); ok = d.length === 11 && /^[78]/.test(d); }
    if (ok && inp.hasAttribute('data-date') && v) ok = dateOk(f, inp, v);
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

  /* даты ДД.ММ.ГГГГ: настоящая дата; окончание — не раньше начала и не в прошлом.
     «Сегодня» в прототипе — 15.09.2026, как в журнале и на дашборде */
  var TODAY = new Date(2026, 8, 15);
  function parseD(v) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v); if (!m) return null;
    var d = new Date(+m[3], m[2] - 1, +m[1]);
    return d.getDate() === +m[1] && d.getMonth() === m[2] - 1 ? d : null;
  }
  function dateOk(f, inp, v) {
    var err = f.querySelector('.fld__err'), d = parseD(v);
    if (!d) { err.textContent = 'Дата целиком: 05.09.2026'; return false; }
    if (inp.hasAttribute('data-date-end')) {
      var from = parseD((inp.form.querySelector('[data-date]:not([data-date-end])') || {}).value || '');
      if (from && d < from) { err.textContent = 'Окончание раньше начала'; return false; }
      if (d < TODAY) { err.textContent = 'Дата уже прошла — акция сразу уйдёт с сайта'; return false; }
    }
    return true;
  }
  document.addEventListener('input', function (e) {
    var t = e.target.closest('[data-date]'); if (!t) return;
    var d = t.value.replace(/\D/g, '').slice(0, 8);
    t.value = d.length > 4 ? d.slice(0, 2) + '.' + d.slice(2, 4) + '.' + d.slice(4) : d.length > 2 ? d.slice(0, 2) + '.' + d.slice(2) : d;
  });

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

  [].forEach.call(document.querySelectorAll('form[data-next]:not([data-code]), form[data-swap], form[data-card]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      [].forEach.call(form.querySelectorAll('.fld'), function (f) {
        if (!check(f) && !bad) bad = f;
      });
      [].forEach.call(form.querySelectorAll('[data-req-group]'), function (g) {
        var ok = !!g.querySelector('input:checked'); g.classList.toggle('is-invalid', !ok);
        if (!ok && !bad) bad = g;
      });
      [].forEach.call(form.querySelectorAll('.check[data-req]'), function (c) {
        var ok = c.querySelector('input').checked;
        c.classList.toggle('is-invalid', !ok);
        if (!ok && !bad) bad = c;
      });
      if (!bad) bad = form.querySelector('.dhour__t.is-bad') && form.querySelector('.dhour__t.is-bad').closest('.dhour');
      var barErr = document.querySelector('[data-bar-err]');
      // фото: отклонённое нужно убрать, загрузка — дождаться
      var why = 'Сначала исправьте поле, отмеченное ошибкой';
      if (!bad && form.hasAttribute('data-photos')) {
        bad = form.querySelector('.dshot.is-stop');
        if (bad) why = 'Удалите отклонённое фото — иначе отправку вернут снова';
        else if ((bad = form.querySelector('.dshot.is-load'))) why = 'Дождитесь, пока загрузятся фотографии';
        else if ((bad = form.querySelector('.dvid.is-load'))) why = 'Дождитесь, пока загрузится видео';
      }
      if (barErr) { barErr.hidden = !bad; barErr.textContent = why; }
      if (bad) { bad.scrollIntoView({ block: 'center' }); var fi = bad.querySelector('input'); if (fi) fi.focus({ preventScroll: true }); return; }
      if (form.hasAttribute('data-card')) { location.href = 'design-lk.html?sent=1'; return; }
      [].forEach.call(form.querySelectorAll('[data-echo]'), function (i) {
        var t = document.getElementById(i.getAttribute('data-echo'));
        if (t && i.value.trim()) t.textContent = i.value.trim();
      });
      if (form.hasAttribute('data-swap')) { showDone(); return; }
      location.href = next(form);
    });
  });

  document.addEventListener('change', function (e) {
    var g = e.target.closest('[data-req-group].is-invalid'); if (g && e.target.checked) g.classList.remove('is-invalid');
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

  /* повторяющиеся строки (телефоны, мессенджеры, соцсети) */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('.drep__add');
    if (add) {
      var rows = add.parentNode.querySelectorAll('.drep__row');
      var row = rows[rows.length - 1].cloneNode(true);
      row.querySelectorAll('input').forEach(function (i) { i.value = ''; i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
      row.querySelectorAll('.fld').forEach(function (f) { f.classList.remove('is-invalid'); });
      var lab = row.querySelector('.fld__lab');
      if (lab && add.getAttribute('data-label')) lab.textContent = add.getAttribute('data-label');
      row.querySelectorAll('.dd__btn, .dd__list').forEach(function (x) { x.remove(); });
      row.querySelectorAll('.dform__sel').forEach(function (w) {
        w.classList.remove('dd', 'is-open');
        var s = w.querySelector('select'); delete s.dataset.dd; s.removeAttribute('aria-hidden'); s.removeAttribute('tabindex');
      });
      add.parentNode.insertBefore(row, add);
      if (window.lnsEnhanceSelect) row.querySelectorAll('.dform__sel').forEach(window.lnsEnhanceSelect);
      row.querySelector('input').focus();
      saved();
      return;
    }
    var del = e.target.closest('.drep__del');
    if (del) {
      var box = del.closest('.drep');
      var all = box.querySelectorAll('.drep__row');
      var r = del.closest('.drep__row');
      if (all.length > 1) r.remove();
      else r.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      saved();
    }
    // режим работы: как в понедельник — на все дни
    if (e.target.closest('[data-copy-hours]')) {
      var hs = document.querySelectorAll('.dhour');
      var src = hs[0].querySelectorAll('input');
      hs.forEach(function (h, k) {
        if (!k) return;
        var t = h.querySelectorAll('input');
        t[0].value = src[0].value; t[1].value = src[1].value; t[2].checked = src[2].checked;
        hour(h);
      });
      saved();
    }
  });

  /* режим работы: «Выходной» гасит часы дня */
  function hour(h) {
    var off = h.querySelector('.dhour__off input').checked;
    h.classList.toggle('is-off', off);
    h.querySelectorAll('.dhour__t').forEach(function (t, k) { t.disabled = off; t.classList.remove('is-bad'); if (off) t.value = ''; else if (!t.value) t.value = k ? '20:00' : '10:00'; });
  }
  /* время: цифры сами получают двоеточие, неверное (25:00, 9:7) — красная рамка */
  document.addEventListener('input', function (e) {
    var t = e.target.closest('.dhour__t');
    if (!t) return;
    var d = t.value.replace(/\D/g, '').slice(0, 4);
    t.value = d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d;
  });
  document.addEventListener('focusout', function (e) {
    var t = e.target.closest && e.target.closest('.dhour__t');
    if (t) t.classList.toggle('is-bad', !!t.value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value));
  });
  document.addEventListener('change', function (e) {
    var h = e.target.closest('.dhour');
    if (h && e.target.closest('.dhour__off')) hour(h);
    if (e.target.closest('form[data-card]')) saved();
  });

  /* счётчик символов в описании */
  [].forEach.call(document.querySelectorAll('[data-count]'), function (c) {
    var ta = c.closest('.fld').querySelector('textarea, input');
    var max = +ta.getAttribute('maxlength');
    var upd = function () { c.firstChild.textContent = ta.value.length; c.classList.toggle('is-near', ta.value.length > max * 0.9); };
    ta.addEventListener('input', upd); upd();
  });

  /* «Черновик сохранён · время» — имитация автосохранения */
  var savedEl = document.querySelector('[data-saved]'), savedT;
  function saved() {
    // что-то поменялось — старое «сначала исправьте» больше не к месту
    var be = document.querySelector('[data-bar-err]'); if (be) be.hidden = true;
    if (!savedEl) return;
    savedEl.textContent = 'Сохраняем черновик…';
    clearTimeout(savedT);
    savedT = setTimeout(function () {
      var d = new Date();
      savedEl.textContent = 'Черновик сохранён · ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    }, 700);
  }
  document.addEventListener('input', function (e) {
    if (e.target.closest('form[data-card]')) saved();
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
  /* data-state="x" — виден только при ?x=1; data-state-off="x y" — скрыт при любом из них */
  [].forEach.call(document.querySelectorAll('[data-state], [data-state-off]'), function (el) {
    var on = el.getAttribute('data-state'), off = el.getAttribute('data-state-off');
    var show = on ? !!q.get(on) : true;
    if (off && off.split(' ').some(function (k) { return !!q.get(k); })) show = false;
    el.hidden = !show;
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
  // новый арендатор — карточка пустая
  if (q.get('empty')) {
    [].forEach.call(document.querySelectorAll('[data-empty]'), function (s) {
      s.className = 'dstatus dstatus--empty'; s.textContent = 'Не заполнено';
    });
    [].forEach.call(document.querySelectorAll('[data-empty-text]'), function (t) { t.textContent = t.getAttribute('data-empty-text'); });
  }
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

  /* ---------- фотографии ---------- */
  var gal = document.querySelector('[data-gal]');
  if (gal) {
    var MAX = 20;
    var cnt = document.querySelector('[data-gal-count]');
    var syncGal = function () {
      var all = gal.querySelectorAll('.dshot:not(.is-err)');
      if (cnt) cnt.textContent = all.length + ' из ' + MAX + ' фотографий';
      gal.querySelectorAll('.dshot__cover').forEach(function (c) { c.remove(); });
      var first = gal.querySelector('.dshot:not(.is-err) .dshot__img');
      if (first) first.insertAdjacentHTML('beforeend', '<span class="dshot__cover">Обложка</span>');
      var note = document.querySelector('[data-rejected-note]');
      if (note) note.hidden = !gal.querySelector('.dshot.is-stop');
      saved();
    };

    gal.addEventListener('click', function (e) {
      var d = e.target.closest('.dshot__del');
      if (d) { d.closest('.dshot').remove(); syncGal(); }
    });

    // порядок — перетаскиванием; первая становится обложкой
    var dragged = null;
    gal.addEventListener('dragstart', function (e) {
      dragged = e.target.closest('.dshot'); if (!dragged) return;
      dragged.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move';
    });
    gal.addEventListener('dragover', function (e) {
      if (!dragged) return;
      e.preventDefault();
      var t = e.target.closest('.dshot');
      gal.querySelectorAll('.is-target').forEach(function (x) { x.classList.remove('is-target'); });
      if (t && t !== dragged) t.classList.add('is-target');
    });
    gal.addEventListener('drop', function (e) {
      if (!dragged) return;
      e.preventDefault();
      var t = e.target.closest('.dshot');
      if (t && t !== dragged) {
        var list = [].slice.call(gal.children);
        gal.insertBefore(dragged, list.indexOf(dragged) < list.indexOf(t) ? t.nextSibling : t);
      }
    });
    gal.addEventListener('dragend', function () {
      if (dragged) dragged.classList.remove('is-drag');
      gal.querySelectorAll('.is-target').forEach(function (x) { x.classList.remove('is-target'); });
      dragged = null; syncGal();
    });

    // загрузка: проверка формата, веса, размера и ориентации; превью — сам файл
    var tile = function (cls, inner, status, statusCls) {
      var li = document.createElement('li');
      li.className = 'dshot ' + cls;
      li.draggable = !/is-err/.test(cls);
      li.innerHTML = '<span class="dshot__img">' + inner + '</span><span class="dshot__row"><span class="dstatus ' + statusCls + '">' + status +
        '</span><button type="button" class="dshot__del" aria-label="Убрать"></button></span>';
      gal.appendChild(li);
      return li;
    };
    var bad = function (name, why) {
      tile('is-err', '<span>«' + name + '» не загружен: ' + why + '</span>', 'Ошибка', 'dstatus--err');
    };
    var add = function (files) {
      [].forEach.call(files, function (f) {
        if (gal.querySelectorAll('.dshot:not(.is-err)').length >= MAX) return bad(f.name, 'в галерее уже ' + MAX + ' фотографий');
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return bad(f.name, 'нужен JPG, PNG или WebP');
        if (f.size > 10 * 1024 * 1024) return bad(f.name, 'больше 10 МБ');
        var url = URL.createObjectURL(f), im = new Image();
        im.onload = function () {
          if (im.naturalHeight > im.naturalWidth) return bad(f.name, 'вертикальное — обрежется в каталоге');
          if (Math.max(im.naturalWidth, im.naturalHeight) < 1600) return bad(f.name, 'меньше 1600 px по длинной стороне');
          var li = tile('is-load', '<img src="' + url + '" alt=""><span class="dshot__load"><span>Загружается</span><span class="dshot__bar"><i></i></span></span>', 'Загружается', 'dstatus--wait');
          var p = 0, bar = li.querySelector('.dshot__bar i');
          var id = setInterval(function () {
            p = Math.min(100, p + 8 + Math.random() * 14); bar.style.width = p + '%';
            if (p >= 100) {
              clearInterval(id);
              li.classList.remove('is-load'); li.querySelector('.dshot__load').remove();
              var st = li.querySelector('.dstatus'); st.className = 'dstatus dstatus--draft'; st.textContent = 'Черновик';
              syncGal();
            }
          }, 180);
          syncGal();
        };
        im.onerror = function () { bad(f.name, 'файл повреждён'); };
        im.src = url;
      });
    };
    var fileIn = document.querySelector('[data-gal-file]');
    fileIn.addEventListener('change', function () { add(fileIn.files); fileIn.value = ''; });
    var drop = document.querySelector('[data-drop]');
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { if (dragged) return; e.preventDefault(); drop.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });
    drop.addEventListener('drop', function (e) { if (dragged) return; e.preventDefault(); add(e.dataTransfer.files); });
  }

  // логотип: превью нового файла, статус — черновик
  var logoIn = document.querySelector('[data-logo-file]');
  if (logoIn) logoIn.addEventListener('change', function () {
    var f = logoIn.files[0]; if (!f) return;
    var box = document.querySelector('.dlogo__box');
    box.innerHTML = '<img src="' + URL.createObjectURL(f) + '" alt="Новый логотип">';
    document.querySelector('.dlogo').classList.add('is-new');
    var st = document.querySelector('.dlogo .dstatus'); st.className = 'dstatus dstatus--draft'; st.textContent = 'Черновик';
    saved();
  });

  /* ---------- видео ---------- */
  var vids = document.querySelector('[data-vids]');
  if (vids) {
    var VMAX = 5;
    var vsync = function () {
      var n = vids.querySelectorAll('.dvid:not(.is-err)').length;
      var c = document.querySelector('[data-vid-count]'), l = document.querySelector('[data-vid-left]');
      if (c) c.textContent = n + ' из ' + VMAX;
      if (l) l.textContent = n >= VMAX ? 'Добавлено максимум — ' + VMAX + ' роликов' : 'Можно добавить ещё ' + (VMAX - n);
      saved();
    };
    var row = function (cls, img, name, meta, status, statusCls, del, extra) {
      var li = document.createElement('li');
      li.className = 'dvid ' + cls;
      li.innerHTML = '<span class="dvid__img">' + img + '</span><span class="dvid__body"><span class="dvid__n">' + name + '</span><span class="dvid__m">' + meta + '</span>' + (extra || '') +
        '</span><span class="dvid__side"><span class="dstatus ' + statusCls + '">' + status + '</span><button type="button" class="dvid__del">' + del + '</button></span>';
      vids.appendChild(li);
      return li;
    };
    var verr = function (name, why) { row('is-err', '', name, 'Не загружен: ' + why, 'Ошибка', 'dstatus--err', 'Убрать'); vsync(); };
    var full = function () { return vids.querySelectorAll('.dvid:not(.is-err)').length >= VMAX; };
    var mb = function (b) { return Math.round(b / 1048576) + ' МБ'; };
    var mmss = function (s) { s = Math.round(s); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; };

    // имитация загрузки: полоса до 100%, затем «Черновик»
    var upload = function (li, from) {
      var p = from || 0, bar = li.querySelector('.dshot__bar i'), t = li.querySelector('[data-pct]');
      var id = setInterval(function () {
        if (!li.isConnected) return clearInterval(id);
        p = Math.min(100, p + 3 + Math.random() * 6);
        bar.style.width = p + '%'; t.textContent = 'Загружено ' + Math.round(p) + '% · не закрывайте страницу';
        if (p >= 100) {
          clearInterval(id); li.classList.remove('is-load'); li.querySelector('.dvid__load').remove();
          var st = li.querySelector('.dstatus'); st.className = 'dstatus dstatus--draft'; st.textContent = 'Черновик';
          li.querySelector('.dvid__del').textContent = 'Удалить';
          vsync();
        }
      }, 400);
    };
    [].forEach.call(vids.querySelectorAll('[data-sim]'), function (li) { upload(li, +li.getAttribute('data-sim')); });

    vids.addEventListener('click', function (e) {
      var d = e.target.closest('.dvid__del'); if (d) { d.closest('.dvid').remove(); vsync(); }
    });

    // файл: формат, вес, длительность, ориентация и размер кадра
    var addFile = function (f) {
      if (!f) return;
      if (full()) return verr(f.name, 'уже ' + VMAX + ' роликов');
      if (!/\.(mp4|mov)$/i.test(f.name)) return verr(f.name, 'нужен MP4 или MOV');
      if (f.size > 500 * 1048576) return verr(f.name, 'больше 500 МБ');
      var url = URL.createObjectURL(f), v = document.createElement('video');
      v.preload = 'metadata'; v.muted = true;
      v.onloadedmetadata = function () {
        if (v.duration > 180) return verr(f.name, 'длиннее 3 минут (' + mmss(v.duration) + ')');
        if (v.videoHeight >= v.videoWidth) return verr(f.name, 'вертикальное — нужно горизонтальное 16:9');
        if (v.videoWidth < 1280 || v.videoHeight < 720) return verr(f.name, 'меньше 1280 × 720');
        var li = row('is-load', '<video src="' + url + '#t=1" muted preload="metadata"></video><span class="dvid__play" aria-hidden="true"></span>', f.name,
          'Файл · ' + mb(f.size) + ' · ' + mmss(v.duration), 'Загружается', 'dstatus--wait', 'Отменить',
          '<span class="dvid__load"><span class="dshot__bar"><i></i></span><span data-pct>Загружено 0%</span></span>');
        upload(li, 0); vsync();
      };
      v.onerror = function () { verr(f.name, 'файл не читается — проверьте формат'); };
      v.src = url;
    };
    var vin = document.querySelector('[data-vid-file]');
    vin.addEventListener('change', function () { addFile(vin.files[0]); vin.value = ''; });
    var vdrop = document.querySelector('[data-vdrop]');
    ['dragenter', 'dragover'].forEach(function (ev) { vdrop.addEventListener(ev, function (e) { e.preventDefault(); vdrop.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { vdrop.addEventListener(ev, function () { vdrop.classList.remove('is-over'); }); });
    vdrop.addEventListener('drop', function (e) { e.preventDefault(); addFile(e.dataTransfer.files[0]); });

    // ссылка: только VK Видео и RuTube
    var lin = document.querySelector('[data-vlink]'), lf = lin.closest('.fld');
    var HOSTS = [
      { re: /^(https?:\/\/)?(www\.)?rutube\.ru\/(video|shorts)\/[\w-]+/i, name: 'RuTube' },
      { re: /^(https?:\/\/)?(www\.)?(vk\.com\/(video|clip)-?\d+_\d+|vkvideo\.ru\/video-?\d+_\d+)/i, name: 'VK Видео' }
    ];
    var addLink = function () {
      var v = lin.value.trim(), h = HOSTS.filter(function (x) { return x.re.test(v); })[0];
      var errT = lf.querySelector('.fld__err');
      if (!h) { errT.textContent = 'Нужна ссылка на ролик с VK Видео или RuTube'; lf.classList.add('is-invalid'); aria(lf, lin, false); lin.focus(); return; }
      if (full()) { errT.textContent = 'Добавлено максимум — ' + VMAX + ' роликов'; lf.classList.add('is-invalid'); return; }
      aria(lf, lin, true);
      var short = v.replace(/^https?:\/\/(www\.)?/, '');
      row('', '<span class="dvid__host">' + h.name + '</span><span class="dvid__play" aria-hidden="true"></span>', 'Ролик ' + h.name,
        h.name + ' · по ссылке · название подтянется с хостинга', 'Черновик', 'dstatus--draft', 'Удалить',
        '<a class="dvid__m dvid__url" href="' + (/^https?:/.test(v) ? v : 'https://' + v) + '" target="_blank" rel="noopener">' + (short.length > 34 ? short.slice(0, 34) + '…' : short) + '</a>')
        .querySelector('.dvid__img').classList.add('dvid__img--host');
      lin.value = ''; vsync();
    };
    document.querySelector('[data-vlink-add]').addEventListener('click', addLink);
    lin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addLink(); } });
  }

  /* ---------- акции: снять с публикации, удалить черновик ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-off], [data-del]');
    if (b && b.closest('.dprow')) {
      var acts = b.closest('.dprow__acts');
      acts.dataset.was = acts.innerHTML;
      var del = b.hasAttribute('data-del');
      acts.innerHTML = '<span class="dprow__ask" role="alert">' +
        (del ? 'Удалить черновик акции?' : 'Снять акцию с сайта? Она пропадёт из ленты сразу, без проверки.') +
        '<span><button type="button" class="dprow__off dprow__yes" data-yes="' + (del ? 'del' : 'off') + '">' + (del ? 'Удалить' : 'Снять') + '</button>' +
        '<button type="button" class="dprow__off" data-no>Отмена</button></span></span>';
      acts.querySelector('[data-no]').focus();
      return;
    }
    var no = e.target.closest('[data-no]');
    if (no) { var a = no.closest('.dprow__acts'); a.innerHTML = a.dataset.was; return; }
    var yes = e.target.closest('[data-yes]');
    if (yes) {
      var r = yes.closest('.dprow');
      if (yes.getAttribute('data-yes') === 'del') { r.remove(); return; }
      r.classList.add('is-off');
      var st = r.querySelector('.dprow__body .dstatus'); st.className = 'dstatus dstatus--empty'; st.textContent = 'Снята';
      r.querySelector('.dprow__left').textContent = 'снята вручную сегодня';
      r.querySelector('.dprow__acts').innerHTML = '<a href="design-lk-promo.html" class="dbtn dbtn--ghost dprow__btn">Повторить</a>';
    }
  });

  /* ---------- форма акции: режим по адресу, живой предпросмотр ---------- */
  var pf = document.querySelector('form[data-promo]');
  if (pf) {
    var PROMOS = {
      '1': { n: 'Скидка 15% на декоративную штукатурку', c: ['Декоративно-отделочные материалы'], t: 'Скидка 15% на декоративную штукатурку при покупке от 20 м². Не суммируется с другими скидками.', s: '05.09.2026', e: '30.09.2026', img: 'img/promos/vladart-plaster.webp', st: 'ok' },
      '2': { n: 'Бесплатный выезд замерщика', c: ['Декоративно-отделочные материалы', 'Лакокрасочные и клеящие материалы'], t: 'Бесплатный выезд замерщика по Санкт-Петербургу при заказе отделки от 30 м². Запись по телефону магазина.', s: '20.08.2026', e: '31.10.2026', img: 'img/promos/vladart-zamer.webp', st: 'ok' },
      draft: { n: 'Осенние цены на декоративную штукатурку', c: ['Декоративно-отделочные материалы'], t: 'Специальные цены на штукатурку из осенней коллекции.', s: '01.10.2026', e: '30.11.2026', img: 'img/cat-dekor.webp', st: 'draft' },
      summer: { n: 'Летняя распродажа образцов', c: ['Декоративно-отделочные материалы', 'Шторы, карнизы, ткани'], t: 'Образцы штукатурок и тканей из шоурума со скидкой до 50%. Количество ограничено.', s: '', e: '', img: 'img/cat-tekstil.webp', st: 'draft' }
    };
    var pq = new URLSearchParams(location.search), key = pq.get('p'), copy = pq.get('copy'), P = PROMOS[key] || PROMOS[copy];
    var $ = function (s) { return document.querySelector(s); };
    var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    var pimg = $('.dpimg');

    var setImg = function (src) {
      var im = $('[data-pv-img]');
      im.src = src; im.hidden = !src; $('[data-pv-noimg]').hidden = !!src;
      pimg.classList.toggle('has-img', !!src);
      $('[data-pimg-t]').innerHTML = src ? 'Изображение загружено · <u>заменить</u>' : 'Перетащите изображение или <u>выберите файл</u>';
    };
    var preview = function () {
      var t = pf.elements.title.value.trim();
      $('[data-pv-title]').textContent = t || 'Название акции';
      var e = parseD(pf.elements.to.value.trim());
      $('[data-pv-term]').textContent = e ? 'до ' + e.getDate() + ' ' + MONTHS[e.getMonth()] : 'срок не указан';
      if (key && P && t) { $('[data-p-crumb]').textContent = t; }
    };

    if (P) {
      pf.elements.title.value = P.n; pf.elements.terms.value = P.t;
      if (!copy) { pf.elements.from.value = P.s; pf.elements.to.value = P.e; }
      [].forEach.call(pf.querySelectorAll('[name=cat]'), function (c) { c.checked = P.c.indexOf(c.value) > -1; });
      setImg(P.img);
      if (copy) {
        $('[data-p-sub]').textContent = 'По образцу «' + P.n + '». Проверьте условия и укажите новый срок — карточка справа покажет, как акция будет выглядеть в ленте.';
      } else {
        $('[data-p-h1]').textContent = P.n; $('[data-p-crumb]').textContent = P.n;
        document.title = P.n + ' — кабинет арендатора — ТК «Ланской»';
        if (P.st === 'ok') {
          $('[data-p-sub]').textContent = 'Акция опубликована. Любая правка уйдёт на проверку, а на сайте до одобрения останется текущая версия.';
          $('[data-p-status]').innerHTML = '<span class="dstatus dstatus--ok">Опубликовано</span>';
          $('[data-promo-off]').hidden = false; $('[data-promo-cancel]').hidden = true;
        } else {
          $('[data-p-sub]').textContent = 'Черновик — уйдёт на проверку вместе с остальными изменениями карточки.';
        }
      }
    } else setImg('');
    [].forEach.call(pf.querySelectorAll('[data-count]'), function (c) { c.closest('.fld').querySelector('input,textarea').dispatchEvent(new Event('input', { bubbles: true })); });
    preview();
    pf.addEventListener('input', preview);
    pf.addEventListener('change', function (e) { if (e.target.closest('[data-date]')) { var f = e.target.closest('.fld'); if (e.target.value) check(f); } });

    // снять с публикации — второе нажатие подтверждает
    var offB = $('[data-promo-off]');
    offB.addEventListener('click', function () {
      if (!offB.dataset.ask) { offB.dataset.ask = '1'; offB.textContent = 'Точно снять? Нажмите ещё раз'; return; }
      location.href = 'design-lk-promos.html?off=' + key;
    });

    // изображение акции: те же требования, что у галереи
    var pin = $('[data-pimg]'), perr = $('[data-pimg-err]');
    var addP = function (f) {
      if (!f) return;
      var fail = function (w) { perr.textContent = '«' + f.name + '» не подходит: ' + w; perr.hidden = false; };
      perr.hidden = true;
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return fail('нужен JPG, PNG или WebP');
      if (f.size > 10 * 1048576) return fail('больше 10 МБ');
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        if (im.naturalHeight > im.naturalWidth) return fail('вертикальное — в ленте обрежется');
        if (Math.max(im.naturalWidth, im.naturalHeight) < 1600) return fail('меньше 1600 px по длинной стороне');
        setImg(url); saved();
      };
      im.src = url;
    };
    pin.addEventListener('change', function () { addP(pin.files[0]); pin.value = ''; });
    var pd = $('[data-pimg-drop]');
    ['dragenter', 'dragover'].forEach(function (ev) { pd.addEventListener(ev, function (e) { e.preventDefault(); pd.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { pd.addEventListener(ev, function () { pd.classList.remove('is-over'); }); });
    pd.addEventListener('drop', function (e) { e.preventDefault(); addP(e.dataTransfer.files[0]); });
  }

  /* список акций: пришли со «Снять с публикации» в форме — снимаем строку */
  var offQ = new URLSearchParams(location.search).get('off');
  if (offQ && document.querySelector('.dprows')) {
    var link = document.querySelector('.dprow a[href="design-lk-promo.html?p=' + offQ + '"]');
    var offBtn = link && link.closest('.dprow').querySelector('[data-off]');
    if (offBtn) { offBtn.click(); var y = document.querySelector('[data-yes]'); if (y) y.click(); }
  }

  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }

  /* ---------- журнал: фильтр по разделу ---------- */
  var lsec = document.querySelector('[data-log-sec]');
  if (lsec) {
    /* отправки: открыты три последние, остальные свёрнуты в строку;
       в длинной отправке видны первые 5 изменений и итог проверки */
    var SHOW = 5;
    document.querySelectorAll('.dlogg[data-sub]').forEach(function (g, i) {
      var rows = [].slice.call(g.querySelectorAll('.dlogr:not(.dlogr--head):not(.dlogr--dec)'));
      var head = g.querySelector('.dlogg__head'), meta = g.querySelector('.dlogg__m');
      var tog = document.createElement('button');
      tog.type = 'button'; tog.className = 'dlogg__tog';
      var setTog = function () {
        var open = g.classList.contains('is-open');
        tog.textContent = open ? 'Свернуть' : rows.length + ' ' + plural(rows.length, 'изменение', 'изменения', 'изменений');
        tog.setAttribute('aria-expanded', String(open));
      };
      meta.insertAdjacentElement('afterend', tog);
      head.classList.add('dlogg__head--btn');
      head.addEventListener('click', function () { g.classList.toggle('is-open'); setTog(); });
      if (i < 3) g.classList.add('is-open');
      setTog();
      if (rows.length > SHOW + 1) {
        rows.slice(SHOW).forEach(function (r) { r.classList.add('is-more'); r.hidden = true; });
        var li = document.createElement('li');
        li.className = 'dlog__rest';
        var n = rows.length - SHOW;
        li.innerHTML = '<button type="button">Ещё ' + n + ' ' + plural(n, 'изменение', 'изменения', 'изменений') + '</button>';
        rows[SHOW - 1].insertAdjacentElement('afterend', li);
        li.querySelector('button').addEventListener('click', function () {
          rows.forEach(function (r) { r.classList.remove('is-more'); r.hidden = false; }); li.remove();
        });
      }
    });
    var more = document.querySelector('[data-log-more]');
    if (more) more.querySelector('button').addEventListener('click', function () {
      document.querySelectorAll('.dlogg[data-more]').forEach(function (g) { g.hidden = false; g.removeAttribute('data-more'); });
      more.remove();
    });
    var lfilter = function () {
      var v = lsec.value, n = 0;
      document.querySelectorAll('.dlogg').forEach(function (g) {
        var k = 0;
        if (g.hasAttribute('data-more')) return;
        g.querySelectorAll('.dlogr:not(.dlogr--head):not(.dlogr--dec)').forEach(function (r) {
          var on = v === 'all' || r.getAttribute('data-sec') === v;
          r.hidden = !on || (v === 'all' && r.classList.contains('is-more')); if (on) k++;
        });
        var rest = g.querySelector('.dlog__rest'); if (rest) rest.hidden = v !== 'all';
        if (v !== 'all' && k) g.classList.add('is-open');
        // решение модератора и заголовки остаются у плашки, если в ней что-то найдено
        g.hidden = !k; n += k;
      });
      document.querySelector('[data-log-empty]').hidden = !!n;
      document.querySelector('[data-log-n]').innerHTML = v === 'all' ? '' : 'Найдено ' + n + ' · <button type="button" class="dprow__off" data-log-reset>Сбросить</button>';
    };
    lsec.addEventListener('change', lfilter);
    document.addEventListener('click', function (e) { if (e.target.closest('[data-log-reset]')) { lsec.value = 'all'; lfilter(); } });
  }
  /* ---------- аккаунт: смена пароля и устройства ---------- */
  var apf = document.querySelector('[data-pass-form]');
  if (apf) {
    apf.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      apf.querySelectorAll('.fld').forEach(function (f) { if (!check(f) && !bad) bad = f; });
      if (bad) { bad.querySelector('input').focus(); return; }
      var done = document.querySelector('[data-pass-done]'); done.hidden = false;
      apf.reset(); apf.querySelectorAll('[data-rule]').forEach(function (li) { li.classList.remove('is-ok'); });
      outAll();
      done.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
  var outRow = function (r) {
    r.classList.add('is-out');
    var b = r.querySelector('[data-dev-out]'); if (b) b.outerHTML = '<span class="dkdev__m">Вход завершён</span>';
  };
  var outAll = function () { document.querySelectorAll('.dkdev:not(.is-this):not(.is-out)').forEach(outRow); };
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-dev-out]'); if (o) outRow(o.closest('.dkdev'));
    if (e.target.closest('[data-dev-all]')) outAll();
  });
  /* ---------- инструкция: текущий раздел в содержании ---------- */
  var toc = document.querySelector('.dhelp__toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        toc.querySelectorAll('a').forEach(function (a) { a.classList.remove('is-cur'); });
        var a = links[e.target.id]; if (a) a.classList.add('is-cur');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.dhelp__sec').forEach(function (sec) { io.observe(sec); });
  }
  /* ---------- предпросмотр карточки: настоящая страница магазина в рамке ----------
     Внутри — design-shop.html: светлая тема, ссылки не уводят, изменённые
     места обведены медной пунктирной рамкой с подписью */
  var pvFrame = document.querySelector('[data-frame]');
  if (pvFrame) {
    var pvMarks = document.querySelector('[data-marks]'), pvHint = document.querySelector('[data-hint]'), pvT;
    var hintPv = function () {
      pvHint.textContent = 'В предпросмотре ссылки не открываются — это вид карточки, а не сайт';
      pvHint.classList.add('is-on'); clearTimeout(pvT);
      pvT = setTimeout(function () { pvHint.classList.remove('is-on'); }, 2600);
    };
    var MARKS = [
      { sel: 'main a[href^="tel:"]', t: 'Телефон' },
      { sel: '.dgallery', t: '3 новые фотографии' },
      { block: 'Видео', t: '2 новых видео' },
      { sel: '.dpromos', t: 'Новая акция' }
    ];
    var setupPv = function () {
      var d = pvFrame.contentDocument; if (!d || !d.body) return;
      d.documentElement.setAttribute('data-theme', 'light');
      var st = d.createElement('style');
      st.textContent = '.pv-on .pvmark{outline:2px dashed #C49A6C;outline-offset:6px;position:relative}' +
        '.pv-on .pvmark::after{content:attr(data-pv);position:absolute;right:0;top:-30px;z-index:5;padding:4px 10px;background:#011427;color:#F6F4ED;font:600 10px/1.4 Montserrat,sans-serif;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}' +
        '.cookie,#siteCookie{display:none!important}';
      d.head.appendChild(st);
      // данные черновика вместо опубликованных: телефон исправлен
      d.querySelectorAll('main a[href^="tel:"]').forEach(function (a) { a.href = 'tel:+78123630007'; });
      var tw = d.createTreeWalker(d.querySelector('main') || d.body, NodeFilter.SHOW_TEXT), tn;
      while ((tn = tw.nextNode())) if (tn.nodeValue.indexOf('000-00-00') > -1) tn.nodeValue = tn.nodeValue.replace(/\+7[\s\u00a0]*\(812\)[\s\u00a0]*000-00-00/g, '+7\u00a0(812)\u00a0363-00-07');
      MARKS.forEach(function (m) {
        var els = m.sel ? [].slice.call(d.querySelectorAll(m.sel)) : [].filter.call(d.querySelectorAll('.dblock'), function (b) { var h = b.querySelector('h2'); return h && h.textContent.trim() === m.block; });
        els.forEach(function (el) { el.classList.add('pvmark'); el.setAttribute('data-pv', m.t); });
      });
      d.body.classList.toggle('pv-on', pvMarks.checked);
      d.addEventListener('click', function (e) { if (e.target.closest('a, button[type=submit]')) { e.preventDefault(); hintPv(); } }, true);
    };
    pvFrame.addEventListener('load', setupPv);

    /* много изменений: в строке первые три, остальные — в раскрывающемся списке по разделам.
       ?many=1 — показать большой черновик */
    var plist = document.querySelector('.dkpv__list');
    if (/[?&]many=1/.test(location.search)) {
      [['design-lk-card.html', 'Карточка магазина', 'изменено описание'], ['design-lk-card.html', 'Карточка магазина', 'режим работы: суббота'],
       ['design-lk-card.html', 'Карточка магазина', 'добавлена соцсеть Дзен'], ['design-lk-photos.html', 'Фотографии', 'новый логотип'],
       ['design-lk-photos.html', 'Фотографии', 'обложка галереи'], ['design-lk-promo.html?p=1', 'Акции', 'продлена «Скидка 15%»']]
        .forEach(function (x) { plist.insertAdjacentHTML('beforeend', '<a href="' + x[0] + '" class="dkpv__i" data-sec="' + x[1] + '">' + x[2] + '</a>'); });
    }
    var pitems = [].slice.call(plist.querySelectorAll('.dkpv__i'));
    var pn = document.querySelector('.dkpv__sum .dstatus__n'); if (pn) pn.textContent = pitems.length;
    // список «Все изменения» строится всегда: на телефоне он единственный способ их увидеть
    if (pitems.length) {
      var few = pitems.length <= 4;
      if (!few) pitems.slice(3).forEach(function (a) { a.hidden = true; });
      var groups = {};
      pitems.forEach(function (a) { var k = a.getAttribute('data-sec'); (groups[k] = groups[k] || []).push(a); });
      var wrap = document.createElement('span');
      wrap.className = 'dkpv__more' + (few ? ' is-few' : '');
      var rest = pitems.length - 3;
      wrap.innerHTML = '<button type="button" class="dkpv__morebtn" aria-expanded="false"><span class="dkpv__mdesk">ещё ' + rest + '</span><span class="dkpv__mmob">Все изменения</span></button><div class="dkpv__pop" hidden><p class="dkpv__popt">Все изменения · ' + pitems.length + '</p>' +
        Object.keys(groups).map(function (k) {
          return '<div class="dkpv__popg"><p class="dkpv__popk">' + k + '</p>' + groups[k].map(function (a) { return '<a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>'; }).join('') + '</div>';
        }).join('') + '</div>';
      plist.parentNode.appendChild(wrap);
      var mb = wrap.querySelector('button'), pop = wrap.querySelector('.dkpv__pop');
      mb.addEventListener('click', function () { var o = pop.hidden; pop.hidden = !o; wrap.classList.toggle('is-open', o); mb.setAttribute('aria-expanded', String(o)); });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) { pop.hidden = true; wrap.classList.remove('is-open'); mb.setAttribute('aria-expanded', 'false'); } });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { pop.hidden = true; wrap.classList.remove('is-open'); } });
    }
    // «К изменениям» — туда, откуда открыли предпросмотр (раздел кабинета), иначе на дашборд
    var back = document.querySelector('[data-pv-back]');
    if (back && /design-lk[\w-]*\.html/.test(document.referrer) && !/preview/.test(document.referrer)) back.href = document.referrer;
    pvMarks.addEventListener('change', function () { var d = pvFrame.contentDocument; if (d && d.body) d.body.classList.toggle('pv-on', pvMarks.checked); });
    document.querySelectorAll('[data-device]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-device]').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        document.querySelector('[data-stage]').classList.toggle('is-phone', b.getAttribute('data-device') === 'phone');
      });
    });
  }
})();

/* ---------- выпадающие списки в стиле сайта (копия из design.js — он в кабинете не подключён) ----------
   Раскрытый список у <select> рисует браузер/ОС (системный шрифт, синяя
   подсветка) — стилями его не изменить. Поэтому поверх каждого списка
   строим свой: кнопка + список вариантов. Настоящий <select> остаётся
   скрытым и синхронным: фильтры и формы работают с ним как раньше.
   Клавиатура: Enter/Пробел/↓ — открыть, ↑↓ — выбор, Enter — подтвердить,
   Esc — закрыть; клик вне списка закрывает */
(function () {
  function enhance(sel, host) {
    if (sel.dataset.dd) return;
    sel.dataset.dd = '1';
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    host.classList.add('dd');
    var list = document.createElement('ul');
    list.className = 'dd__list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    var lab = host.querySelector('.dselect__lab, .fld__lab');
    btn.setAttribute('aria-label', (lab ? lab.textContent + ': ' : '') + 'выбрать');
    host.appendChild(btn);
    host.appendChild(list);
    var cur = 0;

    function build() {
      list.innerHTML = '';
      [].forEach.call(sel.options, function (o, i) {
        if (o.hidden) return;
        var li = document.createElement('li');
        li.className = 'dd__opt';
        li.setAttribute('role', 'option');
        li.textContent = o.textContent;
        li.dataset.i = i;
        list.appendChild(li);
      });
    }
    function mark() {
      [].forEach.call(list.children, function (li) {
        var i = +li.dataset.i;
        li.classList.toggle('is-sel', i === sel.selectedIndex);
        li.classList.toggle('is-cur', i === cur);
        li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false');
      });
    }
    function open() {
      document.dispatchEvent(new CustomEvent('dd:close'));
      cur = sel.selectedIndex;
      mark();
      list.hidden = false;
      host.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      list.hidden = true;
      host.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function pick(i) {
      if (i !== sel.selectedIndex) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      close();
      btn.focus();
    }
    build();
    /* поле — по ширине раскрытого списка (самого длинного варианта),
       чтобы список не выступал из-под него */
    function fit() {
      if (!host.classList.contains('dselect')) return;
      list.style.visibility = 'hidden';
      list.hidden = false;
      var w = list.offsetWidth;
      list.hidden = true;
      list.style.visibility = '';
      if (w > host.offsetWidth) host.style.minWidth = w + 'px';
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      list.hidden ? open() : close();
    });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li) pick(+li.dataset.i);
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li && +li.dataset.i !== cur) { cur = +li.dataset.i; mark(); }
    });
    function step(d) {
      var n = sel.options.length;
      do { cur = (cur + d + n) % n; } while (sel.options[cur].hidden);
      mark();
    }
    btn.addEventListener('keydown', function (e) {
      if (list.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cur); }
      else if (e.key === 'Escape' || e.key === 'Tab') close();
    });
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) close(); });
    document.addEventListener('dd:close', close);
    /* «label» вокруг списка фильтра: клик по подписи открывает список */
    host.addEventListener('click', function (e) {
      if (e.target === btn || btn.contains(e.target) || list.contains(e.target)) return;
      e.preventDefault();
      list.hidden ? open() : close();
    });
  }
  [].forEach.call(document.querySelectorAll('.dselect'), function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  });
  [].forEach.call(document.querySelectorAll('.dform__sel, .sortbox'), function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  });
  /* для полей, добавленных после загрузки (объекты в анкете дизайнера) */
  window.lnsEnhanceSelect = function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  };

})();
