/* Афиша: переключение «ближайшие / архив», фильтры, состояния события. */

/* ---------- список событий ---------- */
(function () {
  var tabs = document.getElementById('eventTabs');
  if (!tabs) return;

  var filters = document.getElementById('evFilters');
  var views = {
    upcoming: document.getElementById('viewUpcoming'),
    archive: document.getElementById('viewArchive')
  };
  var empty = document.getElementById('evEmpty');
  var none = document.getElementById('evNone');
  var view = 'upcoming';
  var aud = 'all';
  var type = 'all';

  function apply() {
    var box = views[view];
    var shown = 0;

    Object.keys(views).forEach(function (k) { views[k].hidden = k !== view; });

    box.querySelectorAll('.evrow').forEach(function (row) {
      var okAud = aud === 'all' || row.dataset.aud === aud;
      var okType = type === 'all' || row.dataset.type === type;
      var visible = okAud && okType;
      row.hidden = !visible;
      if (visible) shown++;
    });

    var filtersOn = aud !== 'all' || type !== 'all';
    box.hidden = shown === 0;
    /* пусто из-за фильтров — одно сообщение, пусто само по себе — другое */
    empty.hidden = !(shown === 0 && filtersOn);
    none.hidden = !(shown === 0 && !filtersOn);

    count(shown);
  }

  /* «1 событие», «2 события», «5 событий» */
  function count(n) {
    var box = document.getElementById('evCount');
    if (!box) return;
    var d10 = n % 10, d100 = n % 100;
    var word = 'событий';
    if (d10 === 1 && d100 !== 11) word = 'событие';
    else if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) word = 'события';
    box.textContent = n;
    document.getElementById('evCountWord').textContent = word;
  }

  function setView(v) {
    view = v;
    tabs.querySelectorAll('.viewtabs__item').forEach(function (i) {
      var on = i.dataset.view === v;
      i.classList.toggle('is-active', on);
      if (i.hasAttribute('aria-selected')) i.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    apply();
  }

  /* вкладка пишется в адрес (#archive): ссылкой можно поделиться,
     работает кнопка «Назад» */
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.viewtabs__item');
    if (!b) return;
    var v = b.dataset.view;
    if ((location.hash === '#archive') !== (v === 'archive')) {
      history.pushState(null, '', v === 'archive' ? '#archive' : location.pathname + location.search);
    }
    setView(v);
  });
  window.addEventListener('popstate', function () {
    setView(location.hash === '#archive' ? 'archive' : 'upcoming');
  });

  filters.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    var row = b.closest('.evfilters__row');
    row.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
    b.classList.add('is-active');
    if (b.dataset.aud) aud = b.dataset.aud;
    if (b.dataset.type) type = b.dataset.type;
    apply();
  });

  function reset() {
    aud = 'all'; type = 'all';
    filters.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('is-active', c.dataset.aud === 'all' || c.dataset.type === 'all');
    });
    apply();
  }
  document.querySelectorAll('[data-evreset]').forEach(function (b) {
    b.addEventListener('click', reset);
  });
  document.querySelectorAll('[data-goarchive]').forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.querySelector('[data-view="archive"]').click();
    });
  });

  if (location.hash === '#archive') setView('archive');
  else apply();
})();

/* ---------- состояния страницы события ---------- */
(function () {
  var bar = document.querySelector('.proto-bar__states');
  if (!bar) return;

  /* список состояний берём из кнопок панели — так блок работает
     на любой странице, где есть свой набор */
  var STATES = [].slice.call(bar.querySelectorAll('.proto-bar__st'))
    .map(function (b) { return b.dataset.state; });

  function show(state) {
    STATES.forEach(function (s) {
      document.querySelectorAll('.st-' + s).forEach(function (el) { el.hidden = s !== state; });
    });
    bar.querySelectorAll('.proto-bar__st').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.state === state);
    });
  }

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.proto-bar__st');
    if (b) show(b.dataset.state);
  });

  /* состояние можно задать адресом: ?past=1 из архива, ?state=sent с главной */
  var qs = new URLSearchParams(location.search);
  var want = qs.get('state') || (qs.get('past') === '1' ? 'past' : 'open');
  show(STATES.indexOf(want) > -1 ? want : 'open');
})();

/* ---------- валидация формы регистрации ---------- */
document.querySelectorAll('.jsform').forEach(function (form) {

  function validate(field) {
    var wrap = field.closest('.fld') || field.closest('.check');
    if (!wrap) return true;
    var ok = field.checkValidity();
    wrap.classList.toggle('is-invalid', !ok);
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = [].slice.call(form.querySelectorAll('[required]'));
    var allOk = fields.map(validate).every(Boolean);
    if (!allOk) {
      var first = form.querySelector('.is-invalid [required]');
      if (first) first.focus();
      return;
    }
    /* honeypot заполнен — значит бот; молча делаем вид, что всё хорошо */
    /* если у страницы есть промежуточный экран (double opt-in) — идём в него */
    var next = document.querySelector('.proto-bar__st[data-state="sent"]')
            || document.querySelector('.proto-bar__st[data-state="done"]');
    if (next) next.click();
    var panel = form.closest('.panel') || form;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  form.addEventListener('input', function (e) {
    var wrap = e.target.closest('.fld') || e.target.closest('.check');
    if (wrap && wrap.classList.contains('is-invalid')) validate(e.target);
  });
  form.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') validate(e.target);
  });
});

/* ---------- лента дат над «Ближайшими» ----------
   Полные недели от первого до последнего события (не меньше четырёх).
   Дни с событием — медные кнопки, клик прокручивает к строке и подсвечивает её.
   Событие скрыто фильтром — день гаснет. */
(function () {
  var cal = document.getElementById('evCal');
  var list = document.getElementById('viewUpcoming');
  if (!cal || !list) return;
  var rows = [].slice.call(list.querySelectorAll('.evrow[data-date]'));
  if (!rows.length) return;

  var WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MON = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  function parse(s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function key(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  var byDay = {};
  rows.forEach(function (r) { (byDay[r.dataset.date] = byDay[r.dataset.date] || []).push(r); });
  var dates = Object.keys(byDay).sort();
  var start = parse(dates[0]), end = parse(dates[dates.length - 1]);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);          /* к понедельнику */
  end.setDate(end.getDate() + (7 - end.getDay()) % 7);                /* к воскресенью */
  var days = Math.round((end - start) / 864e5) + 1;
  if (days < 28) { end.setDate(end.getDate() + 28 - days); days = 28; }

  var h = '<ol class="evcal__days">';
  for (var i = 0, d = new Date(start); i < days; i++, d.setDate(d.getDate() + 1)) {
    var k = key(d), ev = byDay[k], wd = d.getDay();
    var cls = 'evcal__d' + (wd === 0 || wd === 6 ? ' is-we' : '') + (d.getDate() === 1 || i === 0 ? ' is-m' : '');
    var mon = d.getDate() === 1 || i === 0 ? '<span class="evcal__mon">' + MON[d.getMonth()] + '</span>' : '';
    var inner = '<span class="evcal__wd">' + WD[wd] + '</span><span class="evcal__n">' + d.getDate() + '</span>';
    if (ev) {
      var t = ev.map(function (r) { return r.querySelector('.erow__title').textContent.trim(); }).join('; ');
      h += '<li class="' + cls + ' has-ev">' + mon + '<button type="button" class="evcal__btn" data-day="' + k + '" title="' + t.replace(/"/g, '&quot;') + '" aria-label="' + d.getDate() + ' ' + MON[d.getMonth()].toLowerCase() + ': ' + t.replace(/"/g, '&quot;') + '">' + inner + '<i class="evcal__dot" aria-hidden="true"></i></button></li>';
    } else {
      h += '<li class="' + cls + '" aria-hidden="true">' + mon + '<span class="evcal__btn">' + inner + '</span></li>';
    }
  }
  cal.innerHTML = h + '</ol>';

  /* фильтры и вкладки меняют список — пересчитываем после events.js */
  function sync() {
    cal.hidden = list.hidden;
    [].forEach.call(cal.querySelectorAll('.has-ev'), function (li) {
      var b = li.querySelector('button');
      var on = byDay[b.dataset.day].some(function (r) { return !r.hidden; });
      li.classList.toggle('is-off', !on);
      b.disabled = !on;
    });
  }
  ['evFilters', 'eventTabs'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function () { setTimeout(sync, 0); });
  });
  window.addEventListener('popstate', function () { setTimeout(sync, 0); });
  sync();

  cal.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-day]');
    if (!b) return;
    var row = byDay[b.dataset.day].filter(function (r) { return !r.hidden; })[0];
    if (!row) return;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    row.classList.remove('is-hl'); void row.offsetWidth; row.classList.add('is-hl');
  });
})();
