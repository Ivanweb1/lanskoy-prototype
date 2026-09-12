/* Каталог магазинов — фильтрация, поиск, сортировка.
   Всё на клиенте и только для показа: в бою это делает бэкенд,
   иначе 150 карточек придётся отдавать браузеру целиком. */

/* Подкатегории на странице категории — уточняющий фильтр чипами.
   Отдельно от каталога: там полный набор фильтров, здесь категория уже выбрана. */
(function () {
  var chips = document.getElementById('subChips');
  var grid = document.getElementById('subGrid');
  if (!chips || !grid) return;

  var cards = [].slice.call(grid.querySelectorAll('.shopcard'));
  var shown = document.getElementById('subShown');
  var empty = document.getElementById('subEmpty');

  function apply(sub) {
    var n = 0;
    cards.forEach(function (c) {
      var visible = sub === 'all' || (c.dataset.sub || '').split(' ').indexOf(sub) > -1;
      c.hidden = !visible;
      if (visible) n++;
    });
    shown.textContent = n;
    empty.hidden = n > 0;
    grid.hidden = n === 0;
  }

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    chips.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
    b.classList.add('is-active');
    apply(b.dataset.sub);
  });

  document.querySelectorAll('[data-subreset]').forEach(function (b) {
    b.addEventListener('click', function () {
      chips.querySelector('[data-sub="all"]').click();
    });
  });
})();

(function () {
  var grid = document.getElementById('shopGrid');
  if (!grid) return;

  var cards = [].slice.call(grid.querySelectorAll('.shopcard'));
  var search = document.getElementById('catSearch');
  var sortSelect = document.getElementById('sortSelect');
  var shownCount = document.getElementById('shownCount');
  var emptyState = document.getElementById('emptyState');
  var moreBox = document.getElementById('moreBox');
  var activeChips = document.getElementById('activeChips');

  /* подписи категорий для чипов — берём из самой карточки фильтра,
     чтобы не держать словарь в двух местах */
  function catLabel(value) {
    var input = document.querySelector('[data-filter="cat"][value="' + value + '"]');
    if (!input) return value;
    return input.parentNode.querySelector('span').childNodes[0].textContent.trim();
  }

  function checked(type) {
    return [].slice.call(document.querySelectorAll('[data-filter="' + type + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  function apply() {
    var cats = checked('cat');
    var floors = checked('floor');
    var q = normCode((search.value || '').trim());
    var shown = 0;

    cards.forEach(function (card) {
      var okCat = !cats.length || cats.indexOf(card.dataset.cat) > -1;
      var okFloor = !floors.length || floors.indexOf(card.dataset.floor) > -1;
      var okQuery = !q || normCode(card.textContent).indexOf(q) > -1;
      var visible = okCat && okFloor && okQuery;
      card.hidden = !visible;
      if (visible) shown++;
    });

    shownCount.textContent = shown;
    emptyState.hidden = shown > 0;
    grid.hidden = shown === 0;
    moreBox.hidden = shown === 0;
    renderChips(cats, floors, q);
  }

  function renderChips(cats, floors, q) {
    activeChips.innerHTML = '';
    var items = [];

    cats.forEach(function (v) {
      items.push({ label: catLabel(v), clear: function () { uncheck('cat', v); } });
    });
    floors.forEach(function (v) {
      items.push({ label: v + ' этаж', clear: function () { uncheck('floor', v); } });
    });
    if (q) items.push({ label: '«' + q + '»', clear: function () { search.value = ''; } });

    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip chip--rm';
      b.textContent = it.label;
      b.addEventListener('click', function () { it.clear(); apply(); });
      activeChips.appendChild(b);
    });

    activeChips.hidden = !items.length;
  }

  function uncheck(type, value) {
    var i = document.querySelector('[data-filter="' + type + '"][value="' + value + '"]');
    if (i) i.checked = false;
  }

  function sort(mode) {
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === 'floor') {
        return (a.dataset.floor || '9').localeCompare(b.dataset.floor || '9')
          || a.dataset.name.localeCompare(b.dataset.name, 'ru');
      }
      if (mode === 'promo') {
        return (b.dataset.promo - a.dataset.promo)
          || a.dataset.name.localeCompare(b.dataset.name, 'ru');
      }
      return a.dataset.name.localeCompare(b.dataset.name, 'ru');
    });
    sorted.forEach(function (c) { grid.appendChild(c); });
  }

  document.querySelectorAll('[data-filter]').forEach(function (i) {
    i.addEventListener('change', apply);
  });
  search.addEventListener('input', apply);
  sortSelect.addEventListener('change', function () { sort(sortSelect.value); });

  function resetAll() {
    document.querySelectorAll('[data-filter]').forEach(function (i) { i.checked = false; });
    search.value = '';
    apply();
  }
  document.getElementById('filtersReset').addEventListener('click', resetAll);
  document.querySelectorAll('[data-reset]').forEach(function (b) {
    b.addEventListener('click', resetAll);
  });

  sort('alpha');
  apply();
})();
