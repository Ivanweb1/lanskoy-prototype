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

  [].forEach.call(document.querySelectorAll('form[data-next]:not([data-code]), form[data-swap], form[data-card]'), function (form) {
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
      add.parentNode.insertBefore(row, add);
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
    var ta = c.closest('.fld').querySelector('textarea');
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
      r.querySelector('.dprow__acts').innerHTML = '<a href="lk-promo-new.html" class="dbtn dbtn--ghost dprow__btn">Повторить</a>';
    }
  });
})();
