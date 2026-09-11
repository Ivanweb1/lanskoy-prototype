/* Указатель брендов: фильтр по букве и поиск по названию. */

(function () {
  var list = document.getElementById('brandList');
  if (!list) return;

  var nav = document.getElementById('alphaNav');
  var search = document.getElementById('brandSearch');
  var empty = document.getElementById('brandEmpty');
  var groups = [].slice.call(list.querySelectorAll('.brandgroup'));
  var letter = 'all';

  function apply() {
    var q = (search.value || '').trim().toLowerCase();
    var total = 0;

    groups.forEach(function (g) {
      var shown = 0;
      g.querySelectorAll('.brandtile').forEach(function (t) {
        var okLetter = letter === 'all' || g.dataset.letter === letter;
        var okQuery = !q || t.dataset.name.toLowerCase().indexOf(q) > -1;
        var visible = okLetter && okQuery;
        t.hidden = !visible;
        if (visible) shown++;
      });
      g.hidden = shown === 0;
      total += shown;
    });

    empty.hidden = total > 0;
  }

  nav.addEventListener('click', function (e) {
    var b = e.target.closest('.alpha__i');
    if (!b || b.classList.contains('alpha__i--off')) return;
    nav.querySelectorAll('.alpha__i').forEach(function (i) { i.classList.remove('is-active'); });
    b.classList.add('is-active');
    letter = b.dataset.letter;
    apply();
  });

  search.addEventListener('input', apply);

  document.querySelectorAll('[data-brandreset]').forEach(function (b) {
    b.addEventListener('click', function () {
      search.value = '';
      nav.querySelector('[data-letter="all"]').click();
    });
  });
})();
