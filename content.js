/* Акции и журнал: фильтры, поиск, оглавление статьи. */

/* ---------- универсальный фильтр «чипы + поиск» ---------- */
function chipFilter(cfg) {
  var box = document.getElementById(cfg.grid);
  if (!box) return;

  var items = [].slice.call(box.querySelectorAll(cfg.item));
  var filters = document.getElementById(cfg.filters);
  var search = cfg.search ? document.getElementById(cfg.search) : null;
  var empty = document.getElementById(cfg.empty);
  var state = {};

  function apply() {
    var q = search ? normCode((search.value || '').trim()) : '';
    var shown = 0;

    items.forEach(function (el) {
      var ok = Object.keys(state).every(function (key) {
        return state[key] === 'all' || (el.dataset[key] || '').split(' ').indexOf(state[key]) > -1;
      });
      if (ok && q) ok = normCode(el.textContent).indexOf(q) > -1
        || normCode(el.dataset.tags || '').indexOf(q) > -1;
      el.hidden = !ok;
      if (ok) shown++;
    });

    box.hidden = shown === 0;
    empty.hidden = shown > 0;
    if (cfg.count) plural(shown, cfg.count, cfg.countWord, cfg.words);
  }

  if (filters) {
    filters.querySelectorAll('.chip').forEach(function (c) {
      var key = Object.keys(c.dataset)[0];
      if (key && c.classList.contains('is-active')) state[key] = c.dataset[key];
    });

    filters.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      var row = b.closest('.evfilters__row');
      row.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      b.classList.add('is-active');
      var key = Object.keys(b.dataset)[0];
      state[key] = b.dataset[key];
      apply();
    });
  }

  if (search) search.addEventListener('input', apply);

  document.querySelectorAll('[' + cfg.reset + ']').forEach(function (b) {
    b.addEventListener('click', function () {
      if (search) search.value = '';
      if (filters) {
        filters.querySelectorAll('.evfilters__row').forEach(function (row) {
          row.querySelectorAll('.chip').forEach(function (c, i) {
            c.classList.toggle('is-active', i === 0);
            if (i === 0) state[Object.keys(c.dataset)[0]] = c.dataset[Object.keys(c.dataset)[0]];
          });
        });
      }
      apply();
    });
  });

  apply();
}

/* склонение: 1 акция / 2 акции / 5 акций */
function plural(n, idNum, idWord, words) {
  var num = document.getElementById(idNum);
  var word = document.getElementById(idWord);
  if (!num || !word) return;
  var d10 = n % 10, d100 = n % 100, w = words[2];
  if (d10 === 1 && d100 !== 11) w = words[0];
  else if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) w = words[1];
  num.textContent = n;
  word.textContent = w;
}

chipFilter({
  grid: 'promoGrid', item: '.promocard', filters: 'promoFilters',
  search: 'promoSearch', empty: 'promoEmpty', reset: 'data-promoreset',
  count: 'promoCount', countWord: 'promoCountWord',
  words: ['акция', 'акции', 'акций']
});

chipFilter({
  grid: 'postGrid', item: '.post', filters: 'postFilters',
  search: 'postSearch', empty: 'postEmpty', reset: 'data-postreset',
  count: 'postCount', countWord: 'postCountWord',
  words: ['статья', 'статьи', 'статей']
});

chipFilter({
  grid: 'vidGrid', item: '.vid', filters: 'vidFilters',
  empty: 'vidEmpty', reset: 'data-vidreset',
  count: 'vidCount', countWord: 'vidCountWord',
  words: ['видео', 'видео', 'видео']
});

chipFilter({
  grid: 'desGrid', item: '.descard', filters: 'desFilters',
  empty: 'desEmpty', reset: 'data-desreset',
  count: 'desCount', countWord: 'desCountWord',
  words: ['специалист', 'специалиста', 'специалистов']
});

chipFilter({
  grid: 'srchGrid', item: '.srch', filters: 'srchFilters',
  empty: 'srchEmpty', reset: 'data-srchreset',
  count: 'srchCount', countWord: 'srchCountWord',
  words: ['результат', 'результата', 'результатов']
});

chipFilter({
  grid: 'galGrid', item: '.album', filters: 'galFilters',
  empty: 'galEmpty', reset: 'data-galreset',
  count: 'galCount', countWord: 'galCountWord',
  words: ['альбом', 'альбома', 'альбомов']
});

/* ---------- оглавление статьи ---------- */
(function () {
  var nav = document.getElementById('tocNav');
  if (!nav) return;

  var heads = [].slice.call(document.querySelectorAll('.prose--article h2'));
  if (!heads.length) {
    document.getElementById('toc').hidden = true;
    return;
  }

  heads.forEach(function (h, i) {
    if (!h.id) h.id = 'h-' + (i + 1);
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.className = 'toc__i';
    a.textContent = h.textContent;
    nav.appendChild(a);
  });

  /* подсветка текущего раздела */
  var links = [].slice.call(nav.querySelectorAll('.toc__i'));
  function mark() {
    var pos = window.scrollY + 140;
    var active = 0;
    heads.forEach(function (h, i) {
      if (h.offsetTop <= pos) active = i;
    });
    links.forEach(function (l, i) { l.classList.toggle('is-active', i === active); });
  }
  window.addEventListener('scroll', mark, { passive: true });
  mark();
})();

/* ---------- подписка с главной ----------
   На главной по п. 6.1 стоит только поле. Полный сценарий double opt-in
   из п. 6.15 живёт на отдельной странице, поэтому после валидации
   уводим туда — сразу на экран «проверьте почту». */
document.querySelectorAll('.subform').forEach(function (form) {
  function validate(f) {
    var wrap = f.closest('.fld') || f.closest('.check');
    if (!wrap) return true;
    var ok = f.checkValidity();
    wrap.classList.toggle('is-invalid', !ok);
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = [].slice.call(form.querySelectorAll('[required]'));
    if (!fields.map(validate).every(Boolean)) {
      var first = form.querySelector('.is-invalid [required]');
      if (first) first.focus();
      return;
    }
    location.href = 'subscribe.html?state=sent';
  });
  form.addEventListener('input', function (e) {
    var w = e.target.closest('.fld') || e.target.closest('.check');
    if (w && w.classList.contains('is-invalid')) validate(e.target);
  });
  form.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') validate(e.target);
  });
});
