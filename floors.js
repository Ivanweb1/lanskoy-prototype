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

  function rooms(n) { return FLOORS[n].rooms; }

  function render() {
    var d = FLOORS[floor];
    var s = '<svg viewBox="0 0 474 276" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема ' + floor + ' этажа">';

    d.serv.forEach(function (r) {
      s += '<rect class="pl-serv" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
      s += '<text class="pl-txt" x="' + (r[0] + r[2] / 2) + '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle">' + r[4] + '</text>';
    });

    d.rooms.forEach(function (r) {
      var code = r[4], busy = r[5], isSel = code === selected;
      var cls = 'pl-room pl-room--hit' + (busy ? ' pl-room--busy' : ' pl-room--free') + (isSel ? ' pl-room--here' : '');
      s += '<rect class="' + cls + '" data-room="' + code + '" x="' + r[0] + '" y="' + r[1] +
        '" width="' + r[2] + '" height="' + r[3] + '"><title>' + label(code, busy) + '</title></rect>';
      s += '<text class="pl-txt' + (isSel ? ' pl-txt--here' : '') + '" x="' + (r[0] + r[2] / 2) +
        '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle" pointer-events="none">' + code + '</text>';
    });

    s += '</svg>';
    planBox.innerHTML = s;
  }

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
        '<p class="room__cat">' + t.cat + '</p>' +
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
    var names = Object.keys(t);
    listBox.innerHTML = names.length
      ? names.map(function (code) {
          return '<li><button type="button" class="floorlist__i" data-go="' + code + '">' +
            '<span class="floorlist__n">' + t[code].name + '</span>' +
            '<span class="floorlist__s">' + code + '</span></button></li>';
        }).join('')
      : '<li class="floorlist__empty ph-mark">Привязок к секциям на этом этаже нет</li>';

    var busy = rooms(floor).filter(function (r) { return r[5]; }).length;
    linkedCount.textContent = names.length;
    freeCount.textContent = rooms(floor).length - busy;
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
      var byCode = FLOORS[f].rooms.filter(function (r) {
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
