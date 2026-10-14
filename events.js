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
  var day = '';      /* день из ленты дат (ГГГГ-ММ-ДД), пусто — все даты */

  function apply() {
    var box = views[view];
    var shown = 0;

    Object.keys(views).forEach(function (k) { views[k].hidden = k !== view; });

    box.querySelectorAll('.evrow').forEach(function (row) {
      var okAud = aud === 'all' || row.dataset.aud === aud;
      var okType = type === 'all' || row.dataset.type === type;
      var okDay = !day || view !== 'upcoming' || row.dataset.date === day;
      var visible = okAud && okType && okDay;
      row.dataset.okf = okAud && okType ? '1' : '0';   /* для ленты дат: проходит ли фильтры без учёта дня */
      row.hidden = !visible;
      if (visible) shown++;
    });

    var filtersOn = aud !== 'all' || type !== 'all' || !!day;
    box.hidden = shown === 0;
    /* пусто из-за фильтров — одно сообщение, пусто само по себе — другое */
    empty.hidden = !(shown === 0 && filtersOn);
    none.hidden = !(shown === 0 && !filtersOn);

    count(shown);
    document.dispatchEvent(new CustomEvent('ev:applied', { detail: { view: view, day: day } }));
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
    aud = 'all'; type = 'all'; day = '';
    filters.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('is-active', c.dataset.aud === 'all' || c.dataset.type === 'all');
    });
    apply();
  }
  /* лента дат просит показать один день (или снова все) */
  document.addEventListener('ev:day', function (e) { day = e.detail || ''; apply(); });

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
    /* обязательные и необязательные с шаблоном (ссылки на ролики): пустое — можно, неверное — нет */
    var fields = [].slice.call(form.querySelectorAll('[required], input[pattern]'));
    var allOk = fields.map(validate).every(Boolean);
    if (!allOk) {
      var first = form.querySelector('.is-invalid [required], .is-invalid input[pattern]');
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
   Рассчитана на плотную афишу: не меньше шести недель, под числом —
   до трёх точек по числу событий в день. Клик по дню фильтрует список
   этим днём (повторный клик или «Все даты» — сброс): прокрутка к строке
   не работала бы, когда нужное событие ещё не подгружено.
   В прототипе даты берутся из data-date строк списка; на сайте ленту
   строит API по всем будущим событиям, а не только по загруженным. */
(function () {
  var cal = document.getElementById('evCal');
  var list = document.getElementById('viewUpcoming');
  if (!cal || !list) return;
  var rows = [].slice.call(list.querySelectorAll('.evrow[data-date]'));
  if (!rows.length) return;

  var WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MON = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var MONG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function parse(s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function key(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function word(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'событие' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'события' : 'событий'; }

  var byDay = {};
  rows.forEach(function (r) { (byDay[r.dataset.date] = byDay[r.dataset.date] || []).push(r); });
  var dates = Object.keys(byDay).sort();
  var start = parse(dates[0]), end = parse(dates[dates.length - 1]);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);          /* к понедельнику */
  end.setDate(end.getDate() + (7 - end.getDay()) % 7);                /* к воскресенью */
  var days = Math.round((end - start) / 864e5) + 1;
  if (days < 42) { end.setDate(end.getDate() + 42 - days); days = 42; }

  var h = '<div class="evcal__head"><button type="button" class="evcal__all" hidden>Все даты</button>' +
    '<span class="evcal__arrs"><button type="button" class="evcal__arr evcal__arr--prev" aria-label="Раньше"></button>' +
    '<button type="button" class="evcal__arr evcal__arr--next" aria-label="Позже"></button></span></div>' +
    '<div class="evcal__scroll"><ol class="evcal__days">';
  for (var i = 0, d = new Date(start); i < days; i++, d.setDate(d.getDate() + 1)) {
    var k = key(d), ev = byDay[k], wd = d.getDay(), first = d.getDate() === 1 || i === 0;
    var cls = 'evcal__d' + (wd === 0 || wd === 6 ? ' is-we' : '') + (first ? ' is-m' : '') + (wd === 1 ? ' is-mon' : '');
    var mon = first ? '<span class="evcal__mon">' + MON[d.getMonth()] + '</span>' : '';
    var inner = '<span class="evcal__wd">' + WD[wd] + '</span><span class="evcal__n">' + d.getDate() + '</span>';
    if (ev) {
      var dots = '';
      for (var j = 0; j < Math.min(ev.length, 3); j++) dots += '<i></i>';
      var lab = d.getDate() + ' ' + MONG[d.getMonth()] + ': ' + ev.length + ' ' + word(ev.length);
      h += '<li class="' + cls + ' has-ev">' + mon + '<button type="button" class="evcal__btn" data-day="' + k + '" aria-pressed="false" aria-label="' + lab + '" title="' + lab + '">' + inner + '<span class="evcal__dots" aria-hidden="true">' + dots + '</span></button></li>';
    } else {
      h += '<li class="' + cls + '" aria-hidden="true">' + mon + '<span class="evcal__btn">' + inner + '<span class="evcal__dots"></span></span></li>';
    }
  }
  cal.innerHTML = h + '</ol></div>';
  var sc = cal.querySelector('.evcal__scroll');
  var all = cal.querySelector('.evcal__all');
  var prev = cal.querySelector('.evcal__arr--prev'), next = cal.querySelector('.evcal__arr--next');

  /* стрелки листают по неделе; не нужны — прячутся */
  function arrs() {
    var max = sc.scrollWidth - sc.clientWidth;
    cal.classList.toggle('is-scroll', max > 2);
    prev.disabled = sc.scrollLeft <= 2;
    next.disabled = sc.scrollLeft >= max - 2;
  }
  function week(dir) {
    var w = cal.querySelector('.evcal__d').getBoundingClientRect().width * 7;
    sc.scrollBy({ left: dir * w, behavior: 'smooth' });
  }
  prev.addEventListener('click', function () { week(-1); });
  next.addEventListener('click', function () { week(1); });
  sc.addEventListener('scroll', arrs, { passive: true });
  window.addEventListener('resize', arrs);

  /* после каждого применения фильтров: гасим дни без видимых событий,
     отмечаем выбранный, прячем ленту в архиве */
  document.addEventListener('ev:applied', function (e) {
    var v = e.detail.view, sel = e.detail.day;
    cal.hidden = v !== 'upcoming';
    all.hidden = !sel;
    /* выбран день — «Показать ещё» и пагинация к нему не относятся */
    var more = list.querySelector('.results__more');
    if (more) more.hidden = !!sel;
    [].forEach.call(cal.querySelectorAll('.has-ev'), function (li) {
      var b = li.querySelector('button');
      var k = b.dataset.day;
      /* без учёта выбранного дня: остальные дни при выборе не гаснут */
      var on = byDay[k].some(function (r) { return r.dataset.okf !== '0'; });
      li.classList.toggle('is-off', !on);
      li.classList.toggle('is-sel', sel === k);
      b.setAttribute('aria-pressed', sel === k ? 'true' : 'false');
      b.disabled = !on && sel !== k;
    });
    /* выбранный день за краем ленты (выбор пришёл не кликом по ней) — подводим */
    var cur = sel && cal.querySelector('.is-sel');
    if (cur) {
      var l = cur.offsetLeft - sc.offsetLeft, r = l + cur.offsetWidth;
      if (l < sc.scrollLeft || r > sc.scrollLeft + sc.clientWidth) sc.scrollTo({ left: l - 40 });
    }
    arrs();
  });

  cal.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-day]');
    if (b) document.dispatchEvent(new CustomEvent('ev:day', { detail: b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.day }));
  });
  all.addEventListener('click', function () { document.dispatchEvent(new CustomEvent('ev:day', { detail: '' })); });

  /* лента собрана после первого apply() — догоняем его */
  document.dispatchEvent(new CustomEvent('ev:day', { detail: '' }));
})();
