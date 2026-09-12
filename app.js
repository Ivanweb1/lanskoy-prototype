/* ТК «Ланской» — прототип главной. Логика только для показа. */

/* Номера секций люди набирают русскими буквами («А10»), а в данных они
   могут быть записаны латиницей («A10») — буквы выглядят одинаково, но это
   разные символы, и поиск молча не находит. Приводим к одному виду. */
var HOMOGLYPHS = { 'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X' };
function normCode(s) {
  return String(s || '').toUpperCase().replace(/[АВЕКМНОРСТУХ]/g, function (c) {
    return HOMOGLYPHS[c];
  }).toLowerCase();
}

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

/* ---------- слайдер фото на "О комплексе" ----------
   Плавность даёт CSS (scroll-behavior:smooth на .aboutgallery) —
   значит достаточно просто сдвинуть scrollLeft, без scrollBy(). */
(function () {
  var track = document.getElementById('aboutGallery');
  if (!track) return;
  var wrap = track.closest('.aboutgallery-wrap');
  var step = function () { return track.querySelector('.aboutgallery__item').offsetWidth + 16; };
  wrap.querySelector('.aboutgallery__nav--prev').addEventListener('click', function () {
    track.scrollLeft -= step();
  });
  wrap.querySelector('.aboutgallery__nav--next').addEventListener('click', function () {
    track.scrollLeft += step();
  });
})();

/* ---------- cookie ---------- */
document.querySelectorAll('[data-cookie]').forEach(function (b) {
  b.addEventListener('click', function () {
    document.getElementById('cookie').classList.add('is-hidden');
  });
});

/* ---------- лайтбокс: фото и видео поверх страницы ----------
   Один компонент на все галереи сайта — карточка магазина, страница
   события, портфолио дизайнера, общая галерея и видео. Плитки уже
   есть в разметке (см. shop.html/event.html/designer.html/gallery.html —
   там же и видео) — здесь только навешивается интерактивность и модалка,
   верстка плиток не меняется. */
(function () {
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.hidden = true;
  lb.innerHTML =
    '<div class="lightbox__backdrop"></div>' +
    '<button type="button" class="lightbox__close" aria-label="Закрыть">×</button>' +
    '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Предыдущее"></button>' +
    '<div class="lightbox__stage">' +
      '<div class="lightbox__ph"><span class="lightbox__label"></span><span class="lightbox__play" hidden></span></div>' +
      '<p class="lightbox__caption" hidden></p>' +
      '<p class="lightbox__note" hidden></p>' +
    '</div>' +
    '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Следующее"></button>' +
    '<p class="lightbox__counter"></p>';
  document.body.appendChild(lb);

  var els = {
    label: lb.querySelector('.lightbox__label'),
    play: lb.querySelector('.lightbox__play'),
    caption: lb.querySelector('.lightbox__caption'),
    note: lb.querySelector('.lightbox__note'),
    counter: lb.querySelector('.lightbox__counter'),
    prev: lb.querySelector('.lightbox__nav--prev'),
    next: lb.querySelector('.lightbox__nav--next'),
    close: lb.querySelector('.lightbox__close')
  };

  var state = { items: [], index: 0, opener: null };

  function render() {
    var item = state.items[state.index];
    els.label.hidden = !item.boxLabel;
    els.label.textContent = item.boxLabel || '';
    els.play.hidden = !item.isVideo;
    els.caption.hidden = !item.caption;
    els.caption.textContent = item.caption || '';
    els.note.hidden = !item.note;
    els.note.textContent = item.note || '';
    els.counter.textContent = (state.index + 1) + ' из ' + state.items.length;
    els.prev.disabled = els.next.disabled = state.items.length < 2;
  }

  function open(items, index, opener) {
    state.items = items;
    state.index = index;
    state.opener = opener || null;
    lb.classList.toggle('lightbox--video', !!items[index].isVideo);
    render();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    els.close.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (state.opener) state.opener.focus();
  }

  function step(dir) {
    if (state.items.length < 2) return;
    state.index = (state.index + dir + state.items.length) % state.items.length;
    lb.classList.toggle('lightbox--video', !!state.items[state.index].isVideo);
    render();
  }

  els.close.addEventListener('click', close);
  lb.querySelector('.lightbox__backdrop').addEventListener('click', close);
  els.prev.addEventListener('click', function () { step(-1); });
  els.next.addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* делает плитку доступной с клавиатуры и по клику открывающей лайтбокс */
  function makeOpenable(el, onActivate) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('data-lightbox', '');
    el.addEventListener('click', onActivate);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
    });
  }

  /* ---------- фото: любая .gallery на странице (магазин, событие, дизайнер) ---------- */
  document.querySelectorAll('.gallery').forEach(function (gal) {
    var tiles = [].slice.call(gal.querySelectorAll('.gallery__item'));
    if (!tiles.length) return;
    var items = tiles.map(function (t) {
      var label = t.querySelector('.ph__label');
      return { boxLabel: label ? label.textContent : 'Фото' };
    });
    tiles.forEach(function (t, i) {
      makeOpenable(t, function () { open(items, i, t); });
    });
  });

  /* ---------- альбомы общей галереи: gallery.html ----------
     У альбома в прототипе одна обложка, а не отдельные фото. Чтобы
     показать саму механику «открыл альбом → пролистал», генерируем
     столько слайдов, сколько заявлено в счётчике на обложке (или 3,
     если счётчик — ph-mark, то есть число ещё не подтверждено). */
  var albums = [].slice.call(document.querySelectorAll('#galGrid .album'));
  albums.forEach(function (a) {
    function activate() {
      if (a.hidden) return;
      var name = a.querySelector('.album__h');
      name = name ? name.textContent : 'Альбом';
      var nEl = a.querySelector('.album__n');
      var n = (nEl && !nEl.classList.contains('ph-mark')) ? parseInt(nEl.textContent, 10) : 0;
      if (!n) n = 3;
      var items = [];
      for (var i = 1; i <= n; i++) {
        items.push({ boxLabel: 'Фото ' + i + ' из ' + n, caption: name });
      }
      open(items, 0, a);
    }
    makeOpenable(a, activate);
  });

  /* ---------- видео: вкладка «Видео» на gallery.html ----------
     Открывает ту же оболочку, но в режиме плеера: реального видео нет,
     показываем заглушку с кнопкой воспроизведения (см. п. 6.9, 13.5 —
     решение по встраиванию с видеохостинга остаётся за разработкой). */
  var vids = [].slice.call(document.querySelectorAll('#vidGrid .vid'));
  vids.forEach(function (v) {
    function activate() {
      if (v.hidden) return;
      var visible = vids.filter(function (x) { return !x.hidden; });
      var items = visible.map(function (x) {
        var h = x.querySelector('.vid__h');
        return {
          isVideo: true,
          caption: h ? h.textContent : 'Видео',
          note: 'Плеер подключится после встраивания с видеохостинга — см. комментарий к разделу'
        };
      });
      open(items, visible.indexOf(v), v);
    }
    makeOpenable(v, activate);
  });
})();
