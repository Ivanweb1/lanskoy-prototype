/* ТК «Ланской» — прототип главной. Логика только для показа. */

/* ---------- комментарии к блокам ---------- */
var notesToggle = document.getElementById('notesToggle');
if (notesToggle) {
  notesToggle.addEventListener('click', function () {
    document.body.classList.toggle('notes-on');
  });
}

/* ---------- мегаменю ---------- */
var megaBtns = document.querySelectorAll('[data-mega]');
function closeMega(except) {
  document.querySelectorAll('.mega').forEach(function (m) {
    if (m !== except) m.hidden = true;
  });
  document.querySelectorAll('.menu__item--has').forEach(function (i) {
    i.classList.remove('is-open');
  });
}
megaBtns.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var panel = document.getElementById('mega-' + btn.dataset.mega);
    var willOpen = panel.hidden;
    closeMega();
    document.getElementById('searchbar').hidden = true;
    if (willOpen) {
      panel.hidden = false;
      btn.closest('.menu__item').classList.add('is-open');
    }
  });
});

/* ---------- поиск ---------- */
var searchbar = document.getElementById('searchbar');

/* иконка — только мобильный вариант, раскрывает оверлей */
document.getElementById('searchToggle').addEventListener('click', function (e) {
  e.stopPropagation();
  closeMega();
  searchbar.hidden = !searchbar.hidden;
  if (!searchbar.hidden) searchbar.querySelector('input').focus();
});

function closeSuggests(except) {
  document.querySelectorAll('.field.is-open').forEach(function (f) {
    if (f !== except) f.classList.remove('is-open');
  });
}

/* любое поле с подсказками раскрывает их по фокусу */
document.querySelectorAll('.field').forEach(function (f) {
  if (!f.querySelector('.suggest')) return;
  f.querySelector('input').addEventListener('focus', function () {
    closeMega();
    searchbar.hidden = true;
    closeSuggests(f);
    f.classList.add('is-open');
  });
});

document.addEventListener('click', function (e) {
  if (!e.target.closest('.header')) {
    closeMega();
    searchbar.hidden = true;
  }
  if (!e.target.closest('.field')) closeSuggests();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeMega();
    searchbar.hidden = true;
    document.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-open'); });
  }
});

/* ---------- бургер ---------- */
document.getElementById('burger').addEventListener('click', function (e) {
  e.stopPropagation();
  document.getElementById('menu').classList.toggle('is-open');
});

/* ---------- схематичные планы этажей ---------- */
var FLOORS = {
  1: {
    rooms: [
      [20, 20, 70, 46, 'A1', 1], [96, 20, 62, 46, 'A2', 0], [164, 20, 62, 46, 'A3', 1],
      [232, 20, 62, 46, 'A4', 1], [300, 20, 78, 46, 'A5', 0], [384, 20, 70, 46, 'A6', 1],
      [20, 72, 70, 44, 'A7', 0], [96, 72, 62, 44, 'A8', 1], [164, 72, 62, 44, 'A9', 1],
      [300, 72, 78, 44, 'A10', 1], [384, 72, 70, 44, 'A11', 0],
      [20, 150, 88, 46, 'A12', 1], [114, 150, 74, 46, 'A13', 1], [194, 150, 74, 46, 'A14', 0],
      [274, 150, 74, 46, 'A15', 1], [354, 150, 100, 46, 'A16', 1],
      [20, 202, 88, 44, 'A17', 0], [114, 202, 74, 44, 'A18', 1], [194, 202, 74, 44, 'A19', 1],
      [274, 202, 74, 44, 'A20', 0], [354, 202, 100, 44, 'A21', 1]
    ],
    serv: [[230, 72, 66, 44, 'вход'], [20, 122, 434, 22, 'галерея']]
  },
  2: {
    rooms: [
      [20, 20, 80, 50, 'B1', 1], [106, 20, 68, 50, 'B2', 1], [180, 20, 68, 50, 'B3', 0],
      [254, 20, 68, 50, 'B4', 1], [328, 20, 126, 50, 'B5', 1],
      [20, 76, 80, 46, 'B6', 1], [106, 76, 68, 46, 'B7', 0], [328, 76, 126, 46, 'B8', 1],
      [20, 156, 100, 50, 'B9', 1], [126, 156, 82, 50, 'B10', 1], [214, 156, 82, 50, 'B11', 0],
      [302, 156, 68, 50, 'B12', 1], [376, 156, 78, 50, 'B13', 1],
      [20, 212, 100, 44, 'B14', 0], [126, 212, 82, 44, 'B15', 1], [214, 212, 82, 44, 'B16', 1],
      [302, 212, 152, 44, 'B17', 1]
    ],
    serv: [[180, 76, 142, 46, 'атриум'], [20, 128, 434, 22, 'галерея']]
  },
  3: {
    rooms: [
      [60, 24, 96, 56, 'C1', 1], [162, 24, 84, 56, 'C2', 0], [252, 24, 84, 56, 'C3', 1],
      [342, 24, 72, 56, 'C4', 1],
      [60, 150, 96, 56, 'C5', 1], [162, 150, 84, 56, 'C6', 1], [252, 150, 84, 56, 'C7', 0],
      [342, 150, 72, 56, 'C8', 1],
      [60, 212, 130, 44, 'C9', 1], [196, 212, 110, 44, 'C10', 0], [312, 212, 102, 44, 'C11', 1]
    ],
    serv: [[60, 86, 354, 58, 'зона лекций и мероприятий']]
  }
};

function drawFloor(n) {
  var planEl = document.getElementById('plan');
  /* подсветка конкретной секции — для карточки арендатора (п. 6.12 ТЗ:
     «подсветка магазина по клику из его карточки») */
  var here = planEl.dataset.highlight || '';
  var d = FLOORS[n], s = '<svg viewBox="0 0 474 276" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема ' + n + ' этажа">';
  d.serv.forEach(function (r) {
    s += '<rect class="pl-serv" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
    s += '<text class="pl-txt" x="' + (r[0] + r[2] / 2) + '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle">' + r[4] + '</text>';
  });
  d.rooms.forEach(function (r) {
    var isHere = here && r[4] === here;
    s += '<rect class="pl-room' + (r[5] ? ' pl-room--busy' : '') + (isHere ? ' pl-room--here' : '') + '" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
    s += '<text class="pl-txt' + (isHere ? ' pl-txt--here' : '') + '" x="' + (r[0] + r[2] / 2) + '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle">' + r[4] + '</text>';
  });
  s += '</svg>';
  planEl.innerHTML = s;
}

/* схема этажей есть не на каждой странице — без этой проверки
   drawFloor() падает на null и обрывает весь код ниже (cookie и прочее) */
if (document.getElementById('plan')) {
  document.querySelectorAll('.floors__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.floors__tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      drawFloor(tab.dataset.floor);
    });
  });
  drawFloor(document.getElementById('plan').dataset.floor || 1);
}

/* ---------- cookie ---------- */
document.querySelectorAll('[data-cookie]').forEach(function (b) {
  b.addEventListener('click', function () {
    document.getElementById('cookie').classList.add('is-hidden');
  });
});
