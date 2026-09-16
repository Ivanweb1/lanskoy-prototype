/* Поведение прототипа кабинета: чтобы у каждой кнопки был видимый результат
   и следующий шаг. Это имитация — данных и сервера нет, состояние между
   экранами передаётся параметрами в адресе (?sent=1, ?p=2 и т. п.). */

(function () {

  var page = location.pathname.split('/').pop() || 'index.html';
  var q = new URLSearchParams(location.search);

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function on(sel, fn) {
    document.addEventListener('click', function (e) {
      var t = e.target.closest(sel);
      if (t) fn(t, e);
    });
  }
  function head() { return document.querySelector('.lkhead'); }

  /* ---------- общие элементы форм ---------- */

  // × в повторяющихся строках (телефоны, мессенджеры, соцсети)
  on('.repeat__del', function (b) {
    var row = b.closest('.repeat__row');
    var rows = row.parentNode.querySelectorAll(':scope > .repeat__row');
    if (rows.length > 1) row.remove();
    else row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
  });

  // «+ Добавить …» — пустая копия предыдущей строки
  on('.addline:not(.reqadd)', function (b) {
    var prev = b.previousElementSibling;
    while (prev && !prev.classList.contains('repeat__row')) prev = prev.previousElementSibling;
    if (!prev) return;
    var row = prev.cloneNode(true);
    row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
    row.querySelectorAll('.fld').forEach(function (f) { f.classList.remove('is-invalid'); });
    b.parentNode.insertBefore(row, b);
    var inp = row.querySelector('input'); if (inp) inp.focus();
  });

  // ошибка поля гаснет, как только человек начинает исправлять
  document.addEventListener('input', function (e) {
    var f = e.target.closest('.fld.is-invalid');
    if (f) f.classList.remove('is-invalid');
  });

  // «Отправить на проверку»: нельзя отправить с неисправленным полем
  on('a[href="lk.html?sent=1"]', function (a, e) {
    var bad = document.querySelector('.fld.is-invalid');
    if (!bad) return;
    e.preventDefault();
    bad.scrollIntoView({ block: 'center' });
    var i = bad.querySelector('input,textarea'); if (i) i.focus({ preventScroll: true });
    var bar = a.closest('.formbar');
    if (bar && !bar.querySelector('.formbar__err')) {
      bar.insertBefore(el('<p class="formbar__err">Сначала исправьте поле, отмеченное ошибкой.</p>'), bar.firstChild);
    }
  });

  /* ---------- Обзор: состояние после отправки ---------- */

  if (page === 'lk.html' && q.get('sent')) {
    document.querySelectorAll('.lkmain > .alert').forEach(function (a) { a.remove(); });
    head().insertAdjacentElement('afterend', el(
      '<div class="alert">' +
        '<p class="alert__t">Изменения отправлены на проверку</p>' +
        'Всё из черновика ушло одной отправкой — описание, контакты, фото, видео и акция. ' +
        'Решение придёт на рабочую почту и появится здесь. До одобрения на сайте остаётся текущая версия карточки.' +
        '<span class="alert__acts">' +
          '<a href="lk-log.html" class="btn btn--ghost btn--sm">Что отправлено</a>' +
          '<a href="lk-preview.html" class="btn btn--ghost btn--sm">Предпросмотр</a>' +
        '</span>' +
      '</div>'));
    document.querySelectorAll('.lktile .status--draft, .lktile .status--stop').forEach(function (s) {
      s.className = 'status status--wait'; s.textContent = 'На проверке';
    });
  }

  /* ---------- Вход: сообщения после смены пароля и выхода ---------- */

  if (page === 'lk-login.html' && (q.get('pass') || q.get('out'))) {
    var form = document.querySelector('.lkauth__in form');
    var msg = q.get('pass')
      ? '<p class="alert__t">Пароль изменён</p>Войдите с новым паролем. На других устройствах вход завершён.'
      : '<p class="alert__t">Вы вышли из кабинета</p>Черновик сохранён — он будет на месте при следующем входе.';
    if (form) form.parentNode.insertBefore(el('<div class="alert alert--quiet">' + msg + '</div>'), form);
  }

  /* ---------- Аккаунт ---------- */

  if (page === 'lk-account.html') {
    on('.devrow .shot__act', function (b) { b.closest('.devrow').remove(); });
    on('.block__head .more', function (b) {
      b.closest('.block').querySelectorAll('.devrow').forEach(function (r) {
        if (!r.querySelector('.status')) r.remove();
      });
      b.replaceWith(el('<span class="block__meta">Вход на других устройствах завершён</span>'));
    });
    on('form .btn--primary', function (b) {
      var f = b.closest('form');
      f.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      var old = f.querySelector('.alert'); if (old) old.remove();
      b.insertAdjacentElement('beforebegin', el(
        '<div class="alert alert--quiet"><p class="alert__t">Пароль изменён</p>' +
        'Уведомление отправлено на почту, вход на других устройствах завершён.</div>'));
      document.querySelectorAll('.devrow').forEach(function (r) {
        if (!r.querySelector('.status')) r.remove();
      });
    });
  }

  /* ---------- Фотографии и видео: удалить / отменить / убрать ---------- */

  if (page === 'lk-photos.html') {
    on('.shot .shot__act', function (b) { b.closest('.shot').remove(); });
  }

  /* ---------- Акции ---------- */

  var PROMOS = {
    '1': { n: 'Скидка 15% на декоративную штукатурку', c: 'Скидка 15% на декоративную штукатурку при покупке от 20 м².',
           from: '2026-09-05', to: '2026-09-30', d: '5 сентября — 30 сентября' },
    '2': { n: 'Бесплатный выезд замерщика', c: 'Бесплатный выезд замерщика по Санкт-Петербургу.',
           from: '2026-08-20', to: '2026-10-31', d: '20 августа — 31 октября' },
    'draft': { n: 'Осенние цены на декоративную штукатурку', c: '', from: '2026-10-01', to: '2026-11-30', draft: true }
  };

  if (page === 'lk-promo.html') {
    var id = PROMOS[q.get('p')] ? q.get('p') : '1', P = PROMOS[id];
    document.querySelector('.lkhead__h1').textContent = P.n;
    document.querySelector('.crumbs [aria-current]').textContent = P.n;
    document.title = P.n + ' — кабинет арендатора — ТК «Ланской» — прототип';
    document.querySelector('.lkform input[type="text"]').value = P.n;
    document.querySelector('.lkform textarea').value = P.c;
    var dates = document.querySelectorAll('.lkform input[type="date"]');
    dates[0].value = P.from; dates[1].value = P.to;

    var off = Array.prototype.filter.call(document.querySelectorAll('.formbar button'),
      function (b) { return /Снять/.test(b.textContent); })[0];

    if (P.draft) {
      document.querySelector('.lkhead__sub').textContent =
        'Черновик. На сайте акции ещё нет — она уйдёт на проверку вместе с остальными изменениями карточки.';
      var st = document.querySelector('.lkhead__acts .status');
      st.className = 'status status--draft'; st.textContent = 'Черновик';
      if (off) off.textContent = 'Удалить черновик';
    }

    if (off) off.addEventListener('click', function () {
      var bar = off.closest('.formbar');
      if (bar.querySelector('.formbar__ask')) return;
      var ask = el('<p class="formbar__ask">' +
        (P.draft ? 'Удалить черновик акции? Его нельзя будет вернуть.'
                 : 'Снять акцию с сайта сейчас? Она перейдёт в завершённые, её можно будет повторить.') +
        ' <a href="lk-promos.html?' + (P.draft ? 'deldraft=1' : 'off=' + id) + '" class="link link--inline">' +
        (P.draft ? 'Да, удалить' : 'Да, снять') + '</a>' +
        ' <button type="button" class="link link--inline formbar__no">Отмена</button></p>');
      bar.insertBefore(ask, bar.firstChild);
      ask.querySelector('.formbar__no').addEventListener('click', function () { ask.remove(); });
    });
  }

  if (page === 'lk-promos.html') {
    var rows = document.querySelectorAll('.promorow');
    var offId = q.get('off');
    if (offId && PROMOS[offId]) {
      var row = document.querySelector('.promorow a[href="lk-promo.html?p=' + offId + '"]');
      row = row && row.closest('.promorow');
      if (row) {
        var done = document.querySelector('.promorow--off');
        row.classList.add('promorow--off');
        row.querySelector('.promorow__m').textContent = 'Снята вручную 16 сентября';
        row.querySelector('.promorow__d').innerHTML = PROMOS[offId].d + '<span>снята</span>';
        var s = row.querySelector('.status'); s.className = 'status'; s.textContent = 'Не показывается';
        var a = row.querySelector('.promorow__a a'); a.textContent = 'Повторить'; a.href = 'lk-promo-new.html?copy=' + offId;
        done.parentNode.insertBefore(row, done);
        document.querySelector('.block__meta').textContent = '1 акция опубликована';
        if (offId === '1') document.querySelector('.lkmain > .alert').remove();
        head().insertAdjacentElement('afterend', el('<div class="alert alert--quiet"><p class="alert__t">Акция «' +
          PROMOS[offId].n + '» снята с сайта</p>Она в завершённых — чтобы запустить снова, нажмите «Повторить».</div>'));
      }
    }
    if (q.get('deldraft')) {
      var dr = document.querySelector('.promorow a[href="lk-promo.html?p=draft"]');
      if (dr) {
        var sec = dr.closest('.block');
        dr.closest('.promorow').remove();
        sec.querySelector('.block__meta').textContent = 'Черновиков нет';
      }
      head().insertAdjacentElement('afterend', el('<div class="alert alert--quiet"><p class="alert__t">Черновик акции удалён</p>' +
        'Новую акцию можно создать кнопкой «Создать акцию».</div>'));
    }
  }

  if (page === 'lk-promo-new.html' && q.get('copy')) {
    var names = { '1': PROMOS['1'].n, '2': PROMOS['2'].n, 'summer': 'Летняя распродажа образцов' };
    var src = names[q.get('copy')] || names.summer;
    document.querySelector('.lkform input[type="text"]').value = src;
    var srcP = PROMOS[q.get('copy')];
    if (srcP) document.querySelector('.lkform textarea').value = srcP.c;
    head().insertAdjacentElement('afterend', el('<div class="alert alert--quiet"><p class="alert__t">Копия акции «' + src + '»</p>' +
      (srcP ? 'Название и условия перенесены. ' : 'Название перенесено. ') +
      'Укажите новые даты, категории и условия — копия уйдёт на проверку как новая акция.</div>'));
  }

})();
