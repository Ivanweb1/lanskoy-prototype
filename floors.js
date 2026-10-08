/* Интерактивная схема этажей.
   План берётся из FLOORS (app.js) — та же геометрия, что в мини-схеме
   на карточке арендатора, чтобы не расходились.
   В бою привязка «секция → арендатор» приходит из CMS. */

(function () {
  var planBox = document.getElementById('bigPlan');
  if (!planBox) return;

  /* кто где стоит; подтверждённые данные — только первые три */
  var TENANTS = {
    1: {
      A10: { name: 'VLADART STUDIO', cat: 'Декоративно-отделочные материалы' },
      A12: { name: 'ПРЕМЬЕР ДЕКОР', cat: 'Декоративно-отделочные материалы' },
      A13: { name: 'COMPANION DECOR', cat: 'Декоративно-отделочные материалы' }
    },
    2: {
      B7: { name: 'Хорошие двери', cat: 'Двери, перегородки, фурнитура' }
    },
    3: {}
  };

  /* ориентиры: лифт, эскалатор, туалет. ЗАГЛУШКИ — точное расположение
     уточнить у заказчика; координаты в системе плана (viewBox 474×276) */
  var MARKS = {
    1: [[34, 133, 'lift'], [190, 133, 'esc'], [440, 133, 'wc']],
    2: [[34, 139, 'lift'], [190, 139, 'esc'], [440, 139, 'wc']],
    3: [[76, 100, 'lift'], [96, 100, 'esc'], [398, 100, 'wc']]
  };
  var MARK_NAMES = { lift: 'Лифт', esc: 'Эскалатор', wc: 'Туалет' };

  /* реальные этажи (floors-real.js) заменяют схематичные: свои контуры
     и арендаторы с действующего сайта */
  var REAL = typeof REAL_FLOORS !== 'undefined' ? REAL_FLOORS : {};
  Object.keys(REAL).forEach(function (f) {
    TENANTS[f] = {};
    REAL[f].rooms.forEach(function (r) { if (r[1]) TENANTS[f][r[0]] = { name: r[1], cat: '' }; });
  });

  var floor = 1;
  var selected = null;

  var tabs = document.getElementById('floorTabs');
  var search = document.getElementById('planSearch');
  var hint = document.getElementById('planHint');
  var roomPanel = document.getElementById('roomPanel');
  var roomNum = document.getElementById('roomNum');
  var roomBody = document.getElementById('roomBody');
  var listBox = document.getElementById('floorList');
  var linkedCount = document.getElementById('linkedCount');
  var freeCount = document.getElementById('freeCount');

  /* секции в общем виде [x, y, w, h, номер, занято] — и для схематичных, и для реальных */
  function rooms(n) {
    if (REAL[n]) return REAL[n].rooms.filter(function (r) { return r[0]; }).map(function (r) { return [r[3], r[4], r[5], r[6], r[0], 1]; });
    return FLOORS[n].rooms;
  }

  /* значки на реальной схеме: глифы в квадрате 20×20 с центром в 0 */
  var MARK_GLYPH = {
    wc: '<text class="pl-mark__t" y="3.2" text-anchor="middle">WC</text>',
    stairs: '<path class="pl-mark__s" d="M-6 5h3.5V1.5H1V-2h3.5v-3.5H7"/>',
    esc: '<path class="pl-mark__s" d="M-7 5h4l7-9h3"/><circle class="pl-mark__g" cx="-1" cy="-4" r="1.6"/>',
    lift: '<path class="pl-mark__g" d="M-4-1.5 0-6l4 4.5zM-4 1.5 0 6l4-4.5z"/>',
    info: '<circle class="pl-mark__g" cy="-4.6" r="1.4"/><path class="pl-mark__s" d="M0-1.5v7"/>',
    mother: '<path class="pl-mark__s" d="M-6-1h11a5.5 5.5 0 0 1-11 0zM-6-1a5.5 5.5 0 0 1 5.5-5.5V-1"/><circle class="pl-mark__g" cx="-3.5" cy="6" r="1.3"/><circle class="pl-mark__g" cx="3" cy="6" r="1.3"/>',
    'in-down': '<path class="pl-mark__s" d="M0-6v11M-4.5 1 0 5.5 4.5 1"/>',
    'in-left': '<path class="pl-mark__s" d="M6 0H-5M-1-4.5-5.5 0-1 4.5"/>'
  };
  var MARK_LABEL = { wc: 'Туалет', stairs: 'Лестница', esc: 'Эскалатор', lift: 'Лифт',
    info: 'Информация', mother: 'Комната матери и ребёнка', 'in-down': 'Вход', 'in-left': 'Вход' };

  /* значок — квадрат, как на исходной схеме; глиф масштабируется под размер */
  function markSvg(type, half) {
    return '<rect class="pl-mark__box" x="' + (-half) + '" y="' + (-half) + '" width="' + half * 2 + '" height="' + half * 2 + '" rx="2"/>' +
      '<g transform="scale(' + (half / 11).toFixed(2) + ')">' + MARK_GLYPH[type] + '</g>';
  }

  function renderReal(d) {
    var vb = d.viewBox;
    var s = '<svg class="pl-real" viewBox="' + vb.join(' ') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема ' + floor + ' этажа">';
    if (d.outline) s += '<path class="pl-outline" d="' + d.outline + '"/>';
    d.rooms.forEach(function (r) {
      var code = r[0], x = r[3], y = r[4], w = r[5], h = r[6];
      /* секция без номера — просто контур, не кликается */
      if (!code) { s += '<path class="pl-room pl-room--blank" d="' + r[2] + '"/>'; return; }
      var isSel = code === selected;
      s += '<path class="pl-room pl-room--hit pl-room--busy' + (r[1] ? ' pl-room--tenant' : '') + (isSel ? ' pl-room--here' : '') +
        '" data-room="' + code + '" d="' + r[2] + '"><title>' + esc(code + ' — ' + (r[1] || 'арендатор не указан')) + '</title></path>';
      var here = isSel ? ' pl-txt--here' : '';
      var lines = r[1] ? fitName(r[1], w - 8, h - 14, 10) : null;
      if (lines) {
        s += '<text class="pl-code pl-code--real' + here + '" x="' + (x + 4) + '" y="' + (y + 10) + '" pointer-events="none">' + code + '</text>';
        var y0 = y + h / 2 + 6 - (lines.length - 1) * 5.5;
        lines.forEach(function (ln, i) {
          s += '<text class="pl-name pl-name--real' + here + '" x="' + (x + w / 2) + '" y="' + (y0 + i * 11.5) +
            '" text-anchor="middle" pointer-events="none">' + esc(ln) + '</text>';
        });
      } else {
        s += '<text class="pl-txt pl-txt--real' + here + '" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 3.5) +
          '" text-anchor="middle" pointer-events="none">' + code + '</text>';
      }
    });
    (d.marks || []).forEach(function (m) {
      s += '<g class="pl-mark" transform="translate(' + m[0] + ' ' + m[1] + ')"><title>' + MARK_LABEL[m[2]] + '</title>' + markSvg(m[2], 18) + '</g>';
    });
    return s + '</svg>';
  }

  /* легенда значков — по тем, что есть на этаже */
  function legendMarks(d) {
    var ul = document.querySelector('.legend');
    if (!ul) return;
    [].slice.call(ul.querySelectorAll('[data-mark]')).forEach(function (li) { li.remove(); });
    if (!d) return;
    var seen = {};
    (d.marks || []).forEach(function (m) {
      var label = MARK_LABEL[m[2]];
      if (seen[label]) return;
      seen[label] = 1;
      var li = document.createElement('li');
      li.setAttribute('data-mark', '');
      li.innerHTML = '<svg class="legend__mark" viewBox="-12 -12 24 24" aria-hidden="true"><g class="pl-mark">' + markSvg(m[2], 11) + '</g></svg>' + label;
      ul.appendChild(li);
    });
  }

  /* название целиком по словам в прямоугольник секции; не влезает — null,
     тогда в секции только номер, а название — по клику и в подсказке */
  function fitName(name, width, height, fs) {
    var max = Math.floor(width / (fs * 0.62));
    var rows = Math.min(3, Math.floor(height / (fs * 1.15)));
    if (max < 3 || rows < 1) return null;
    var words = name.split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      if (words[i].length > max) return null;
      var next = cur ? cur + ' ' + words[i] : words[i];
      if (next.length <= max) cur = next;
      else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines.length <= rows ? lines : null;
  }

  function render() {
    planBox.classList.toggle('is-real', !!REAL[floor]);
    if (REAL[floor]) planBox.style.setProperty('--plan-ar', REAL[floor].viewBox[2] + ' / ' + REAL[floor].viewBox[3]);
    /* у реального этажа в выгрузке только занятые секции — легенда схемы не к месту */
    document.querySelectorAll('[data-schem]').forEach(function (li) { li.hidden = !!REAL[floor]; });
    legendMarks(REAL[floor]);
    if (REAL[floor]) {
      planBox.innerHTML = renderReal(REAL[floor]);
      var h = document.querySelector('.legend__sw--here');
      if (h) h.parentNode.hidden = !selected;
      return;
    }
    var d = FLOORS[floor];
    var s = '<svg viewBox="0 0 474 276" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема ' + floor + ' этажа">';

    d.serv.forEach(function (r) {
      s += '<rect class="pl-serv" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
      s += '<text class="pl-txt" x="' + (r[0] + r[2] / 2) + '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle">' + r[4] + '</text>';
    });

    d.rooms.forEach(function (r) {
      var code = r[4], busy = r[5], isSel = code === selected;
      var t = TENANTS[floor][code];
      var cls = 'pl-room pl-room--hit' + (busy ? ' pl-room--busy' : ' pl-room--free') +
        (t ? ' pl-room--tenant' : '') + (isSel ? ' pl-room--here' : '');
      s += '<rect class="' + cls + '" data-room="' + code + '" x="' + r[0] + '" y="' + r[1] +
        '" width="' + r[2] + '" height="' + r[3] + '"><title>' + label(code, busy) + '</title></rect>';
      if (t) {
        /* известный арендатор: номер мелко в углу, название по центру */
        s += '<text class="pl-code' + (isSel ? ' pl-txt--here' : '') + '" x="' + (r[0] + 5) + '" y="' + (r[1] + 9) +
          '" pointer-events="none">' + code + '</text>';
        var lines = wrap(t.name, r[2] - 8, 7.5);
        var y0 = r[1] + r[3] / 2 + 5 - (lines.length - 1) * 4.5;
        lines.forEach(function (ln, i) {
          s += '<text class="pl-name' + (isSel ? ' pl-txt--here' : '') + '" x="' + (r[0] + r[2] / 2) + '" y="' + (y0 + i * 9) +
            '" text-anchor="middle" pointer-events="none">' + esc(ln) + '</text>';
        });
      } else {
        s += '<text class="pl-txt' + (isSel ? ' pl-txt--here' : '') + '" x="' + (r[0] + r[2] / 2) +
          '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle" pointer-events="none">' + code + '</text>';
      }
    });

    (MARKS[floor] || []).forEach(function (m) {
      s += '<g class="pl-mark" transform="translate(' + m[0] + ' ' + m[1] + ')"><title>' + MARK_NAMES[m[2]] + '</title>' +
        '<circle r="7"/>' + markGlyph(m[2]) + '</g>';
    });

    s += '</svg>';
    planBox.innerHTML = s;

    /* «Выбрано» в легенде — только когда что-то выбрано */
    var here = document.querySelector('.legend__sw--here');
    if (here) here.parentNode.hidden = !selected;
  }

  function markGlyph(type) {
    if (type === 'lift') return '<path class="pl-mark__g" d="M-3-1 0-4.5 3-1zM-3 1 0 4.5 3 1z"/>';
    if (type === 'esc') return '<path class="pl-mark__s" d="M-4.5 3.5h2.5l4.5-6h2"/>';
    return '<text class="pl-mark__g pl-mark__t" y="2" text-anchor="middle">WC</text>';
  }

  /* перенос названия по словам в ширину секции: не больше двух строк */
  function wrap(name, width, fs) {
    var max = Math.max(4, Math.floor(width / (fs * 0.62)));
    var words = name.split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) {
      var next = cur ? cur + ' ' + w : w;
      if (next.length <= max || !cur) cur = next;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (lines.length > 2) lines = [lines[0], lines.slice(1).join(' ')];
    return lines.map(function (l) { return l.length > max ? l.slice(0, max - 1) + '…' : l; });
  }

  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function label(code, busy) {
    var t = TENANTS[floor][code];
    if (t) return code + ' — ' + t.name;
    return code + (busy ? ' — арендатор' : ' — свободно');
  }

  function select(code) {
    selected = code;
    render();

    var r = rooms(floor).filter(function (x) { return x[4] === code; })[0];
    if (!r) { roomPanel.hidden = true; return; }

    var t = TENANTS[floor][code];
    roomNum.textContent = code;
    roomPanel.hidden = false;

    if (t) {
      roomBody.innerHTML =
        '<p class="room__name">' + t.name + '</p>' +
        (t.cat ? '<p class="room__cat">' + t.cat + '</p>' : '') +
        '<p class="room__place">' + floor + ' этаж</p>' +
        '<a href="shop.html" class="btn btn--ghost btn--full">Карточка магазина</a>';
    } else if (r[5]) {
      roomBody.innerHTML =
        '<p class="room__name ph-mark">Арендатор не привязан</p>' +
        '<p class="room__cat">Секция занята, но связи с карточкой в данных нет.</p>' +
        '<a href="shops.html" class="btn btn--ghost btn--full">Все магазины</a>';
    } else {
      roomBody.innerHTML =
        '<p class="room__name">Свободно</p>' +
        '<p class="room__cat">Помещение доступно для аренды.</p>' +
        '<a href="rent.html" class="btn btn--primary btn--full">Условия аренды</a>';
    }
  }

  function buildList() {
    var t = TENANTS[floor];
    /* один магазин в нескольких секциях — одной строкой: «Manders — А3, А4, А6а» */
    var byName = {}, order = [];
    Object.keys(t).forEach(function (code) {
      var n = t[code].name;
      if (!byName[n]) { byName[n] = []; order.push(n); }
      byName[n].push(code);
    });
    function key(n) { return n.replace(/^[«"'\s]+/, ''); }
    order.sort(function (a, b) { return key(a).localeCompare(key(b), 'ru'); });
    listBox.innerHTML = order.length
      ? order.map(function (n) {
          return '<li><button type="button" class="floorlist__i" data-go="' + byName[n][0] + '">' +
            '<span class="floorlist__n">' + esc(n) + '</span>' +
            '<span class="floorlist__s">' + byName[n].join(', ') + '</span></button></li>';
        }).join('')
      : '<li class="floorlist__empty ph-mark">' + (REAL[floor] ? 'Список арендаторов этажа уточняется' : 'Привязок к секциям на этом этаже нет') + '</li>';

    linkedCount.textContent = order.length;
    if (REAL[floor]) {
      freeCount.textContent = 'уточняется';
    } else {
      var busy = rooms(floor).filter(function (r) { return r[5]; }).length;
      freeCount.textContent = rooms(floor).length - busy;
    }
  }

  function setFloor(n, keepSelection) {
    floor = String(n);
    if (!keepSelection) { selected = null; roomPanel.hidden = true; }
    tabs.querySelectorAll('.floors__tab').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.floor === floor);
    });
    buildList();
    render();
  }

  /* ---------- события ---------- */
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.floors__tab');
    if (b) setFloor(b.dataset.floor);
  });

  planBox.addEventListener('click', function (e) {
    var r = e.target.closest('[data-room]');
    if (r) select(r.dataset.room);
  });

  listBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (b) select(b.dataset.go);
  });

  /* поиск сам находит нужный этаж */
  search.addEventListener('input', function () {
    var q = normCode(search.value.trim());
    if (!q) { hint.textContent = 'Поиск переключит этаж и подсветит секцию'; return; }

    var found = null;
    ['1', '2', '3'].forEach(function (f) {
      if (found) return;
      /* по номеру секции */
      var byCode = rooms(f).filter(function (r) {
        var code = normCode(r[4]);
        return code === q || code.indexOf(q) === 0;
      })[0];
      if (byCode) { found = { floor: f, code: byCode[4] }; return; }
      /* по названию магазина */
      Object.keys(TENANTS[f]).forEach(function (code) {
        if (found) return;
        if (normCode(TENANTS[f][code].name).indexOf(q) > -1) found = { floor: f, code: code };
      });
    });

    if (found) {
      selected = found.code;
      setFloor(found.floor, true);
      hint.textContent = 'Найдено: секция ' + found.code + ', ' + found.floor + ' этаж';
      select(found.code);
    } else {
      hint.textContent = 'Ничего не найдено — проверьте написание';
    }
  });

  /* приход с карточки арендатора: floors.html?room=A10&floor=1 */
  var qs = new URLSearchParams(location.search);
  var room = qs.get('room');
  if (room) {
    setFloor(qs.get('floor') || 1, true);
    select(room);
  } else {
    setFloor(1);
  }
})();
