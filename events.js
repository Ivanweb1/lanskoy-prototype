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

  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.viewtabs__item');
    if (!b) return;
    tabs.querySelectorAll('.viewtabs__item').forEach(function (i) { i.classList.remove('is-active'); });
    b.classList.add('is-active');
    view = b.dataset.view;
    apply();
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

  apply();
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

  /* архив открывает страницу сразу в состоянии «прошло» */
  show(location.search.indexOf('past=1') > -1 ? 'past' : 'open');
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
