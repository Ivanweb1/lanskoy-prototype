/* ТК «Ланской» — дизайн главной. Переключатель темы и подмена медиа под тему.
   ТЗ п. 9.7: тёмная тема обязательна. Способ выбора темы в ТЗ не описан —
   реализовано: системная настройка по умолчанию + ручной переключатель в шапке,
   выбор запоминается. Вопрос про тему по умолчанию открыт для заказчика. */

(function () {
  var KEY = 'lns-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);

    // логотип: шапка тёмно-синяя в обеих темах — бело-золотая версия.
    // Брендбук стр. 08 на тёмном фоне рекомендует медную версию, белую
    // только допускает.
    // logo-gold.png обрезан по артворку из brandbook/logo/PNG/Горизонтальный
    // вариант/Торговый центр/Без фона/«Логотип_ТЦ_Бело-золотой.png».
    var logo = document.querySelector('.nav .logo__img');
    if (logo) logo.src = 'logo-gold.png';

    // подвал тёмно-синий в обеих темах — всегда бело-золотая версия
    var flogo = document.querySelector('.footer .logo__img--inv');
    if (flogo) flogo.src = 'logo-gold.png';

    // фотография первого экрана: светлая — просторный светлый интерьер (стр. 39),
    // тёмная — вечерний шоурум с тёплым светом (стр. 38)
    var photo = document.getElementById('heroPhoto');
    if (photo) photo.src = theme === 'dark' ? 'img/hero-dark.webp' : 'img/hero-light.webp';

    // в покое превью мегаменю показывает тот же снимок комплекса
    var mshops = document.getElementById('mega-shops');
    if (mshops && mshops.megaPrevReset) mshops.megaPrevReset();

    var tog = document.getElementById('themeTog');
    if (tog) {
      tog.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      tog.querySelector('.themetog__t').textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
    }
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  }

  // кнопку добавляем в готовую утилитарную строку, чтобы не трогать partials.js прототипа
  function mount() {
    var host = document.querySelector('.utility__actions');
    if (!host || document.getElementById('themeTog')) return;
    var li = document.createElement('li');
    li.className = 'themetog-li';
    li.innerHTML = '<button type="button" class="themetog" id="themeTog" aria-pressed="false">' +
                   '<span class="themetog__ic" aria-hidden="true"></span>' +
                   '<span class="themetog__sun" aria-hidden="true"></span>' +
                   '<span class="themetog__moon" aria-hidden="true"></span>' +
                   '<span class="themetog__t">Тёмная тема</span></button>';
    host.appendChild(li);   // служебный элемент — в самый край, после «Войти в кабинет»
    li.querySelector('button').addEventListener('click', toggle);
  }

  mount();
  apply(current());

  // пока фотографии нет — остаётся подложка-паттерн, а сам <img> спрятан,
  // чтобы не показывать alt-текст битой картинки
  function watch(img) {
    if (!img) return;
    var show = function () { img.style.visibility = 'visible'; };
    var hide = function () { img.style.visibility = 'hidden'; };
    img.addEventListener('load', show);
    img.addEventListener('error', hide);
    if (img.complete) { img.naturalWidth ? show() : hide(); }
  }

  watch(document.getElementById('heroPhoto'));
  [].forEach.call(document.querySelectorAll('.cat__img, .ecard__img, .pcard__img, .jimg, .fimg, .rimg'), watch);


  /* ---------- меню по центру строки навигации ----------
     Иконку поиска и бургер собираем в одну группу, чтобы строка стала
     сеткой «1fr — меню — 1fr»: тогда меню центрируется по контейнеру,
     а не по остатку между логотипом и иконкой. */
  (function () {
    var navIn = document.querySelector('.nav__in');
    if (!navIn || navIn.querySelector('.nav__side')) return;
    var side = document.createElement('div');
    side.className = 'nav__side';
    var ic = navIn.querySelector('.ic-search');
    var bg = navIn.querySelector('.burger');
    if (ic) side.appendChild(ic);   // обработчики app.js остаются: узлы те же
    if (bg) side.appendChild(bg);
    navIn.appendChild(side);
  })();

  /* ---------- на телефоне утилитарная строка уезжает в бургер ----------
     Решение Ивана: «Аренда», «Войти в кабинет» и переключатель темы на
     узком экране занимали целую полосу над шапкой ради трёх элементов.
     Узлы переносятся, а не клонируются: обработчики (переключатель темы)
     остаются рабочими, а дублей в разметке не возникает. При возврате на
     широкий экран они встают обратно в утилитарную строку. */
  (function () {
    var acts = document.querySelector('.utility__actions');
    var utilIn = document.querySelector('.utility__in');
    var menu = document.getElementById('menu');
    if (!acts || !utilIn || !menu) return;

    var mq = window.matchMedia('(max-width:760px)');
    function place() {
      if (mq.matches) {
        if (acts.parentNode !== menu) {
          acts.classList.add('utility__actions--inmenu');
          menu.insertBefore(acts, menu.querySelector('.mcontacts'));
        }
      } else if (acts.parentNode !== utilIn) {
        acts.classList.remove('utility__actions--inmenu');
        utilIn.appendChild(acts);
      }
    }
    place();
    if (mq.addEventListener) mq.addEventListener('change', place);
    else if (mq.addListener) mq.addListener(place);
  })();

  /* ---------- мегаменю: оглавление категорий и панель-превью ----------
     Разметку шапки даёт partials.js, общий для всего Ч/Б-прототипа, —
     трогать его нельзя, иначе фотографии уедут и на чёрно-белые страницы.
     Поэтому панели пересобираются здесь, на странице дизайна.

     Числа магазинов и снимки — те же, что в блоке «Направления» ниже.
     Шесть категорий (28, 17, 7, 11, 10, 28) — данные заказчика, остальные
     восемь подставные: пунктирных пометок заказчик просил не ставить, а
     голые нули выглядели сломанными. Заменить на фактические перед сдачей. */
  (function () {
    var CATDATA = {
      'Декоративно-отделочные материалы': ['img/cat-dekor.webp', '28'],
      'Плитка':                           ['img/cat-plitka.webp', '17'],
      'Обои':                             ['img/cat-oboi.webp', '7'],
      'Шторы, карнизы, ткани':            ['img/cat-tekstil.webp', '11'],
      'Лакокрасочные и клеящие материалы':['img/cat-lkm.webp', '10'],
      'Напольные покрытия':               ['img/cat-pol.webp', '28'],
      'Потолки':                          ['img/cat-potolki.webp', '6'],
      'Двери, перегородки, фурнитура':    ['img/cat-dveri.webp', '14'],
      'Остекление и оконная фурнитура':   ['img/cat-osteklenie.webp', '7'],
      'Стекло и зеркала':                 ['img/cat-steklo.webp', '5'],
      'Сантехника':                       ['img/cat-santeh.webp', '12'],
      'Свет':                             ['img/cat-svet.webp', '9'],
      'Лестницы':                         [null, '3'],
      'Отопление и кондиционирование':    [null, '4']
    };

    /* Линейные значки на сетке 24 со штрихом 1.1 — та же манера, что у
       иконок полосы услуг. Нужны, чтобы строки не сливались: линейки
       между ними убраны, и якорь у строки остался только один — значок. */
    var CATICON = {
      // мастерок — отделочные работы
      'Декоративно-отделочные материалы':
        '<path d="M3 10 12 3.5l9 6.5-9 5z"/><path d="M12 15v3.5"/><rect x="10.3" y="18.5" width="3.4" height="3"/>',
      'Плитка':
        '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/>' +
        '<rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>',
      // полотна со швами
      'Обои':
        '<rect x="3.5" y="3" width="17" height="18"/><path d="M9.2 3v18M14.8 3v18"/>',
      // драпировка — три волны ткани
      'Шторы, карнизы, ткани':
        '<path d="M3 6.5c3-3 6 3 9 0s6-3 9 0"/><path d="M3 12c3-3 6 3 9 0s6-3 9 0"/>' +
        '<path d="M3 17.5c3-3 6 3 9 0s6-3 9 0"/>',
      'Лакокрасочные и клеящие материалы':
        '<ellipse cx="12" cy="6.5" rx="7" ry="2.5"/><path d="M5 6.5v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-12"/>',
      'Напольные покрытия':
        '<rect x="3" y="5" width="18" height="14"/><path d="M3 9.7h18M3 14.3h18M12 5v4.7M8 9.7v4.6M15.5 14.3V19"/>',
      // потолок и подвес
      'Потолки':
        '<path d="M3 4.5h18"/><path d="M12 4.5v6"/><path d="M7 17.5a5 5 0 0 1 10 0z"/>',
      'Двери, перегородки, фурнитура':
        '<rect x="5.5" y="2.5" width="13" height="19"/><circle cx="15" cy="12" r="1.1"/>',
      // рама с импостом и подоконником
      'Остекление и оконная фурнитура':
        '<rect x="3.5" y="3" width="17" height="14"/><path d="M12 3v14M3.5 10h17"/><path d="M2.5 20.5h19"/>',
      'Стекло и зеркала':
        '<ellipse cx="12" cy="11" rx="6.5" ry="8"/><path d="M9 6.5c-1.3 1.3-2 3.2-2 5"/>',
      'Сантехника':
        '<path d="M3 11.5h18v2.5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z"/><path d="M12 11.5V7a3 3 0 0 1 3-3h2.5"/>',
      'Свет':
        '<path d="M12 2.5v4"/><path d="M5 14.5a7 7 0 0 1 14 0z"/><path d="M9 18.5h6"/>',
      'Лестницы':
        '<path d="M2.5 20.5h5v-5h5v-5h5v-5h4"/>',
      'Отопление и кондиционирование':
        '<rect x="4.5" y="5" width="15" height="14"/><path d="M8.25 5v14M12 5v14M15.75 5v14"/>' +
        '<path d="M4.5 8.5H2.5M21.5 15.5h-2"/>'
    };

    function icon(name) {
      var g = CATICON[name];
      if (!g) return '<span class="mcats__ic" aria-hidden="true"></span>';
      return '<span class="mcats__ic" aria-hidden="true">' +
             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" ' +
             'stroke-linecap="round" stroke-linejoin="round">' + g + '</svg></span>';
    }

    function plural(n) {
      var d = n % 100, u = n % 10;
      if (d > 10 && d < 20) return 'магазинов';
      if (u === 1) return 'магазин';
      if (u > 1 && u < 5) return 'магазина';
      return 'магазинов';
    }

    function prevCard(id, cls) {
      return '<div class="mega__col mega__col--prev">' +
             '  <a class="mprev" id="' + id + '" href="shops.html">' +
             '    <span class="mprev__media"><img alt="" loading="lazy" ' + cls + '></span>' +
             '    <span class="mprev__body">' +
             '      <span class="mprev__kicker"></span>' +
             '      <span class="mprev__t"></span>' +
             '      <span class="mprev__c"></span>' +
             '      <span class="mprev__go">Смотреть</span>' +
             '    </span>' +
             '  </a>' +
             '</div>';
    }

    /* ---- панель «Магазины» ---- */
    var shops = document.getElementById('mega-shops');
    if (shops && !shops.querySelector('.mcats')) {
      var inS  = shops.querySelector('.mega__in');
      var cats = [].map.call(shops.querySelectorAll('.mega__cats a'), function (a) {
        return { name: a.textContent.trim(), href: a.getAttribute('href') };
      });
      var navHTML = shops.querySelector('.mega__links').innerHTML;
      var field   = shops.querySelector('.field--sm');   // переносим узел, а не копируем

      var rows = cats.map(function (c) {
        var d = CATDATA[c.name] || [null, null];
        var cnt = '<span class="mcats__c">' + (d[1] || '') + '</span>';
        return '<li><a href="' + c.href + '"' +
               ' data-img="' + (d[0] || '') + '"' +
               ' data-count="' + (d[1] || '') + '">' +
               icon(c.name) +
               '<span class="mcats__n">' + c.name + '</span>' + cnt + '</a></li>';
      }).join('');

      inS.innerHTML =
        '<div class="mega__col mega__col--wide">' +
        '  <p class="mega__title">Категории · число магазинов</p>' +
        '  <ul class="mcats">' + rows + '</ul>' +
        '</div>' +
        '<div class="mega__col">' +
        '  <p class="mega__title">Навигация</p>' +
        '  <ul class="mega__links">' + navHTML + '</ul>' +
        '  <div class="mroom">' +
        '    <p class="mroom__t">Знаете номер помещения?</p>' +
        '    <div class="mroom__field"></div>' +
        '    <p class="mega__hint">Секции 1—3 этажей: А, B, C</p>' +
        '  </div>' +
        '</div>' +
        prevCard('megaPrev', 'id="megaPrevImg"');

      if (field) inS.querySelector('.mroom__field').appendChild(field);

      /* превью: в покое — весь каталог, при наведении на строку — категория.
         Фотография комплекса остаётся и для категорий без своего снимка:
         подставлять чужой кадр вместо отсутствующего нельзя. */
      var card = document.getElementById('megaPrev');
      var cimg = document.getElementById('megaPrevImg');
      var ck   = card.querySelector('.mprev__kicker');
      var ct   = card.querySelector('.mprev__t');
      var cc   = card.querySelector('.mprev__c');

      function heroSrc() {
        return root.getAttribute('data-theme') === 'dark'
          ? 'img/hero-dark.webp' : 'img/hero-light.webp';
      }
      function reset() {
        cimg.src = heroSrc();
        ck.textContent = 'Каталог';
        ct.textContent = 'Все направления';
        cc.textContent = 'Более 150 магазинов на трёх этажах';
        card.setAttribute('href', 'shops.html');
      }
      shops.megaPrevReset = reset;        // чтобы переключатель темы обновил снимок
      reset();

      [].forEach.call(inS.querySelectorAll('.mcats a'), function (a) {
        a.addEventListener('mouseenter', function () {
          var img = a.getAttribute('data-img');
          var n   = a.getAttribute('data-count');
          cimg.src = img || heroSrc();
          ck.textContent = 'Направление';
          ct.textContent = a.querySelector('.mcats__n').textContent;
          cc.textContent = n ? n + ' ' + plural(+n) : '';
          card.setAttribute('href', a.getAttribute('href'));
        });
        a.addEventListener('focus', function () {
          a.dispatchEvent(new Event('mouseenter'));
        });
      });
      inS.querySelector('.mcats').addEventListener('mouseleave', reset);

      // снимки подгружаем один раз при первом раскрытии — чтобы превью
      // не мигало белым на каждом наведении
      var warmed = false;
      new MutationObserver(function () {
        if (warmed || shops.hidden) return;
        warmed = true;
        Object.keys(CATDATA).forEach(function (k) {
          if (CATDATA[k][0]) { var i = new Image(); i.src = CATDATA[k][0]; }
        });
      }).observe(shops, { attributes: true, attributeFilter: ['hidden'] });
    }

    /* ---- панель «О комплексе»: та же карточка, но постоянная ---- */
    var about = document.getElementById('mega-about');
    if (about && !about.querySelector('.mprev')) {
      about.querySelector('.mega__in').insertAdjacentHTML('beforeend', prevCard('megaPrevAbout', ''));
      var ac = document.getElementById('megaPrevAbout');
      ac.setAttribute('href', 'floors.html');
      ac.querySelector('img').src = 'img/find.webp';
      ac.querySelector('.mprev__kicker').textContent = 'Навигация по комплексу';
      ac.querySelector('.mprev__t').textContent = 'Схема этажей';
      ac.querySelector('.mprev__c').textContent = 'Три этажа, секции А, B и C — найти магазин на плане';
    }
  })();

  /* ---------- подвал: ведущая строка и одна линейка колонок ----------
     Было: логотип с адресом слева и четыре колонки ссылок справа. Левый
     блок не имел заголовка, поэтому выпадал из линейки остальных, а сами
     колонки шли 5-3-3-4 — правый край получался рваным, под короткими
     колонками зияла пустота.

     Стало: ведущая строка (логотип и соцсети по краям), под ней медная
     линия и одна линейка из пяти равных колонок — контакты встали такой
     же колонкой с заголовком, и все заголовки сели на общую строку.
     Ссылки перераспределены на 4-4-3-4: «Журнал» ушёл к событиям как
     контентный раздел, «Аренда» — к профессионалам, «Схема этажей» — к
     комплексу. Состав ссылок прежний, ничего не добавлено.

     Разметку даёт partials.js, общий для Ч/Б-прототипа, — пересобираем
     здесь, на странице дизайна. */
  (function () {
    var foot = document.querySelector('.footer');
    if (!foot || foot.querySelector('.footer__nav')) return;
    var inner = foot.querySelector('.footer__in');
    if (!inner) return;

    var logo = inner.querySelector('.logo__img');
    var cols = [
      ['Контакты', [
        ['Санкт-Петербург,<br>ул. Студенческая, 10', null],
        ['+7 (812) 363-00-07', 'tel:+78123630007'],
        ['10:00 — 20:00 ежедневно', null],
        ['Как добраться', 'contacts.html']
      ]],
      ['Покупателям', [
        ['Магазины', 'shops.html'], ['Категории', 'categories.html'],
        ['Бренды', 'brands.html'], ['Акции', 'promos.html']
      ]],
      ['События', [
        ['Афиша', 'events.html'], ['Архив событий', 'events.html'],
        ['Галерея и видео', 'gallery.html'], ['Журнал', 'journal.html']
      ]],
      /* «Войти в кабинет» переехало из «Комплекса»: кабинет арендатора
         — для бизнеса. Колонки стали 4-4-4-4-3 вместо 4-4-4-3-4:
         короткая теперь одна и последняя, рваного низа посередине нет */
      ['Профессионалам', [
        ['Дизайнерам', 'designers.html'], ['Каталог дизайнеров', 'designers.html#catalog'],
        ['Аренда площадей', 'rent.html'], ['Войти в кабинет', 'lk-login.html']
      ]],
      ['Комплекс', [
        ['О комплексе', 'about.html'], ['Схема этажей', 'floors.html'],
        ['Контакты и реквизиты', 'contacts.html']
      ]]
    ];

    var navHTML = cols.map(function (c) {
      var items = c[1].map(function (it) {
        return '<li>' + (it[1]
          ? '<a href="' + it[1] + '">' + it[0] + '</a>'
          : '<span>' + it[0] + '</span>') + '</li>';
      }).join('');
      return '<div class="footer__col"><p class="footer__title">' + c[0] + '</p>' +
             '<ul>' + items + '</ul></div>';
    }).join('');

    inner.className = 'wrap footer__in';
    inner.innerHTML =
      '<div class="footer__lead">' +
      '  <a class="footer__logo" href="index.html"></a>' +
      /* Решение Ивана: в подвале только две площадки комплекса. Отметка на
     будущее — п. 13.5 ТЗ перечисляет ВКонтакте, Дзен, MAX, TenChat,
     VK Видео, RuTube, Pinterest, TikTok; YouTube в этот набор не входит
     (сам набор продублирован в карточке арендатора, lk-card). */
'  <ul class="footer__soc">' +
'    <li><a href="#">' +
'      <img class="soc__mark" src="logo-vk-mono.svg?v=2" alt="ВКонтакте" width="138" height="24" loading="lazy">' +
'      <img class="soc__mark soc__mark--color" src="logo-vk.svg" alt="" aria-hidden="true" width="138" height="24" loading="lazy">' +
'    </a></li>' +
'    <li><a href="#">' +
'      <img class="soc__mark" src="logo-youtube-mono.svg?v=2" alt="YouTube" width="111" height="24" loading="lazy">' +
'      <img class="soc__mark soc__mark--color" src="logo-youtube.svg" alt="" aria-hidden="true" width="111" height="24" loading="lazy">' +
'    </a></li>' +
'  </ul>' +
      '</div>' +
      '<div class="footer__nav">' + navHTML + '</div>';

    if (logo) inner.querySelector('.footer__logo').appendChild(logo);
  })();

  /* ---------- шапка: липкая + компактное состояние ---------- */
  var header = document.querySelector('.header');
  if (header) {
    // затемнение под раскрытой шапкой
    var scrim = document.createElement('div');
    scrim.className = 'hscrim';
    document.body.appendChild(scrim);

    /* Шапка фиксированная (design.css, разд. 18), поэтому её высоту надо
       отдать потоку отступом body. Меряем в покое: в сжатом состоянии
       шапка ниже на утилитарную строку и на 28px строки навигации. */
    var root = document.documentElement;
    var restH = 0;

    function measure() {
      var was = document.body.classList.contains('is-sticky');
      if (was) {
        document.body.classList.add('no-anim');
        document.body.classList.remove('is-sticky');
      }
      restH = header.offsetHeight;
      if (was) {
        document.body.classList.add('is-sticky');
        void header.offsetHeight;          // применяем без анимации
        document.body.classList.remove('no-anim');
      }
      root.style.setProperty('--hdr-h', restH + 'px');
    }

    /* Порог с гистерезисом: сжимаем после 48px, разжимаем только ниже 12px.
       С одним порогом состояние дребезжало при мелкой прокрутке у границы. */
    var compact = false;
    function onScroll() {
      var y = window.scrollY;
      var next = compact ? y > 12 : y > 48;
      if (next !== compact) {
        compact = next;
        document.body.classList.toggle('is-sticky', compact);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(measure, 150);
    });
    measure();
    onScroll();
    // шрифты Google меняют высоту строки навигации уже после первого кадра
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    // подсветка иконки и затемнение страницы, пока открыт поиск или мегаменю.
    // Обработчики прототипа (app.js) сами открывают панели — мы только следим
    // за их состоянием, чтобы не дублировать логику.
    var bar = document.getElementById('searchbar');
    function syncPanels() {
      var searchOpen = bar && !bar.hidden;
      var megaOpen = !![].filter.call(document.querySelectorAll('.mega'), function (m) { return !m.hidden; }).length;
      document.body.classList.toggle('is-search-open', !!searchOpen);
      document.body.classList.toggle('is-mega-open', megaOpen);
    }
    var mo = new MutationObserver(syncPanels);
    [].forEach.call(document.querySelectorAll('.mega, #searchbar'), function (el) {
      mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
    });
    syncPanels();

    scrim.addEventListener('click', function () {
      if (bar) bar.hidden = true;
      [].forEach.call(document.querySelectorAll('.mega'), function (m) { m.hidden = true; });
      [].forEach.call(document.querySelectorAll('.menu__item--has'), function (i) { i.classList.remove('is-open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') scrim.click();
    });
  }

  // состояние «событий нет» — п. 6.8 ТЗ. Показывается по адресу ?events=0,
  // панели состояний в прототипе нет, как и на страницах кабинета.
  if (/[?&]events=0(&|$)/.test(location.search)) {
    var grid = document.getElementById('eventsGrid');
    var empty = document.getElementById('eventsEmpty');
    if (grid && empty) { grid.hidden = true; empty.hidden = false; }
  }
})();

  /* ---------- появление снизу по скроллу ----------
     Скрытие делает CSS по классу js-rv на <html> (ставится инлайн-скриптом
     в <head>), здесь только наблюдение. IntersectionObserver, а не
     animation-timeline: второе работает не во всех браузерах, а прототип
     смотрят с разных машин.
     Наблюдение снимается после первого показа: повторное появление при
     прокрутке вверх раздражает сильнее, чем радует. */
  (function () {
    var root = document.documentElement;
    if (!root.classList.contains('js-rv')) return;

    var sel = '.sect__head, .cgrid > *, .cmore, .eposter > *, .eempty, .pgrid > *,' +
              '.rblock__media, .rblock__text, .jgrid > *, .fgrid > *, .sblock__in > *,' +
              '.footer__lead > *, .footer__nav > *';
    var items = [].slice.call(document.querySelectorAll(sel));

    /* без IntersectionObserver показываем всё сразу — сайт не должен остаться пустым */
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    /* задержка по порядку внутри своего родителя, но не больше четырёх
       шагов: дальше последняя плитка ряда догоняет слишком долго */
    items.forEach(function (el) {
      var i = [].indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--rv-d', Math.min(i, 4) * 70 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });

    /* Страховка. В скрытой вкладке IntersectionObserver не считает
       пересечения вообще, и если страницу открыли в фоне, а потом
       сохранили страницу или распечатали — контент останется прозрачным.
       Через четыре секунды показываем всё, что уже в кадре, независимо от
       наблюдателя. То же самое при печати. */
    function showVisible() {
      items.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }
    setTimeout(showVisible, 4000);
    window.addEventListener('beforeprint', function () {
      items.forEach(function (el) { el.classList.add('is-in'); });
    });
  })();

/* ---------- мобильное меню: подменю аккордеоном, крестик, контакты ----------
   На телефоне выпадающие панели десктопа (#mega-shops, #mega-about) открывались
   под панелью бургера, и пункты со стрелкой ничего не делали. Подменю
   собираются из ссылок тех же панелей и раскрываются на месте. */
(function () {
  var menu = document.getElementById('menu');
  var burger = document.getElementById('burger');
  var nav = document.querySelector('.nav');
  if (!menu || !burger || !nav) return;
  var mq = window.matchMedia('(max-width:760px)');
  var root = document.documentElement;

  function group(title, anchors) {
    if (!anchors.length) return '';
    return (title ? '<p class="msub__t">' + title + '</p>' : '') + '<ul>' +
      [].map.call(anchors, function (a) {
        var n = a.querySelector('.mcats__n');
        var c = a.getAttribute('data-count');
        return '<li><a href="' + a.getAttribute('href') + '"><span>' +
          (n ? n.textContent : a.textContent).trim() + '</span>' +
          (c ? '<span class="msub__c">' + c + '</span>' : '') + '</a></li>';
      }).join('') + '</ul>';
  }

  [].forEach.call(menu.querySelectorAll('[data-mega]'), function (btn) {
    var key = btn.getAttribute('data-mega');
    var panel = document.getElementById('mega-' + key);
    if (!panel) return;
    var html = '';
    if (key === 'shops') {
      html = group('', panel.querySelectorAll('.mega__links a')) +
             group('Категории', panel.querySelectorAll('.mcats a, .mega__cats a'));
    } else {
      [].forEach.call(panel.querySelectorAll('.mega__col'), function (col) {
        var t = col.querySelector('.mega__title');
        html += group(t ? t.textContent.trim() : '', col.querySelectorAll('.mega__links a'));
      });
    }
    var sub = document.createElement('div');
    sub.className = 'msub';
    sub.id = 'msub-' + key;
    sub.hidden = true;
    sub.innerHTML = html;
    btn.closest('.menu__item').appendChild(sub);
    btn.setAttribute('aria-controls', sub.id);
    btn.setAttribute('aria-expanded', 'false');
  });

  // контакты из утилитарной строки — на телефоне она скрыта целиком
  var info = document.querySelector('.utility__info');
  if (info) {
    var tel = info.querySelector('a[href^="tel:"]');
    var way = info.querySelector('a[href*="contacts"]');
    var plain = [].filter.call(info.querySelectorAll('li'), function (li) { return !li.querySelector('a'); });
    var box = document.createElement('div');
    box.className = 'mcontacts';
    box.innerHTML =
      (tel ? '<a class="mcontacts__tel" href="' + tel.getAttribute('href') + '">' + tel.textContent + '</a>' : '') +
      plain.map(function (li) { return '<p>' + li.innerHTML + '</p>'; }).join('') +
      (way ? '<p><a class="mcontacts__way" href="' + way.getAttribute('href') + '">' + way.textContent + '</a></p>' : '');
    menu.appendChild(box);
  }

  function close() { menu.classList.remove('is-open'); }
  function fit() {
    menu.style.setProperty('--mnav-h', (window.innerHeight - nav.getBoundingClientRect().bottom) + 'px');
  }

  // аккордеон: перехватываем клик раньше обработчика мегаменю из app.js
  menu.addEventListener('click', function (e) {
    if (!mq.matches) return;
    var btn = e.target.closest('[data-mega]');
    if (btn) {
      e.stopPropagation();
      e.preventDefault();
      var li = btn.closest('.menu__item');
      var open = !li.classList.contains('is-sub-open');
      [].forEach.call(menu.querySelectorAll('.menu__item--has'), function (o) {
        var on = o === li && open;
        o.classList.toggle('is-sub-open', on);
        o.querySelector('[data-mega]').setAttribute('aria-expanded', String(on));
        var s = o.querySelector('.msub');
        if (s) s.hidden = !on;
      });
      return;
    }
    if (e.target.closest('a')) close();
  }, true);

  // бургер переключает класс в app.js — здесь только следим за состоянием
  function sync() {
    var open = menu.classList.contains('is-open');
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
    root.classList.toggle('is-menu-open', open);
    if (open) {
      fit();
      var bar = document.getElementById('searchbar');
      if (bar) bar.hidden = true;
      [].forEach.call(document.querySelectorAll('.mega'), function (m) { m.hidden = true; });
    }
  }
  burger.setAttribute('aria-controls', 'menu');
  new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
  sync();

  var st = document.getElementById('searchToggle');
  if (st) st.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (menu.classList.contains('is-open')) fit(); });
  function onMq() { if (!mq.matches) close(); }
  if (mq.addEventListener) mq.addEventListener('change', onMq);
  else if (mq.addListener) mq.addListener(onMq);
})();


/* ---------- ссылки на дизайн-версии страниц ----------
   Шапку и подвал даёт partials.js, общий с Ч/Б-прототипом, и ссылки там
   ведут на прототипы. Пока страница не перерисована, ведём на прототип;
   как только дизайн-версия готова — дописываем её сюда. */
(function () {
  var DESIGN_PAGES = {
    'index.html': 'design.html',
    'shops.html': 'design-shops.html',
    'categories.html': 'design-categories.html',
    'category.html': 'design-category.html',
    'shop.html': 'design-shop.html',
    'brands.html': 'design-brands.html',
    'brand.html': 'design-brand.html',
    'floors.html': 'design-floors.html',
    'promos.html': 'design-promos.html',
    'promo.html': 'design-promo.html',
    'events.html': 'design-events.html',
    'event.html': 'design-event.html',
    'journal.html': 'design-journal.html',
    'article.html': 'design-article.html',
    'designers.html': 'design-designers.html',
    'designer.html': 'design-designer.html',
    'designer-form.html': 'design-designer-form.html',
    'about.html': 'design-about.html',
    'gallery.html': 'design-gallery.html',
    'contacts.html': 'design-contacts.html',
    'rent.html': 'design-rent.html',
    'search.html': 'design-search.html',
    'privacy.html': 'design-privacy.html',
    'terms.html': 'design-terms.html',
    'cookie.html': 'design-cookie.html',
    '404.html': 'design-404.html',
    '500.html': 'design-500.html'
  };
  [].forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var h = a.getAttribute('href');
    var m = h.match(/^([a-z0-9-]+\.html)(.*)$/);
    if (m && DESIGN_PAGES[m[1]]) a.setAttribute('href', DESIGN_PAGES[m[1]] + m[2]);
  });
})();

/* ---------- фильтры каталога на телефоне ----------
   Четырнадцать категорий списком занимали два экрана до первой карточки.
   До 1000px фильтры свёрнуты под кнопку, на ней — число выбранных. */
(function () {
  var btn = document.getElementById('filtersToggle');
  var box = document.getElementById('filters');
  if (!btn || !box) return;
  var n = document.getElementById('filtersN');
  btn.addEventListener('click', function () {
    var open = box.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  function count() {
    var k = box.querySelectorAll('[data-filter]:checked').length;
    var q = box.querySelector('input[type=search]');
    if (q && q.value.trim()) k++;
    n.textContent = k;
    n.hidden = !k;
  }
  box.addEventListener('change', count);
  box.addEventListener('input', count);
  box.addEventListener('click', function () { setTimeout(count, 0); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset], .chip--rm')) setTimeout(count, 0);
  });
})();

/* ---------- лайтбокс показывает настоящие снимки ----------
   Лайтбокс прототипа (app.js) рисует только подпись «Фото N». Если в плитке
   галереи есть снимок, кладём его фоном в окно лайтбокса и меняем при
   листании — номер кадра берём из счётчика «N из M». */
(function () {
  var cur = null;
  document.addEventListener('click', function (e) {
    var tile = e.target.closest('.gallery__item');
    if (tile) cur = tile.closest('.gallery');
  }, true);
  function sync() {
    var lb = document.querySelector('.lightbox');
    if (!lb || lb.hidden || !cur) return;
    var n = parseInt(lb.querySelector('.lightbox__counter').textContent || '1', 10) - 1;
    var tile = cur.querySelectorAll('.gallery__item')[n];
    var img = tile && tile.querySelector('img');
    var ok = img && img.naturalWidth;
    lb.querySelector('.lightbox__ph').style.backgroundImage = ok ? 'url(' + JSON.stringify(img.currentSrc) + ')' : '';
    lb.querySelector('.lightbox__label').style.display = ok ? 'none' : '';
  }
  var lb = document.querySelector('.lightbox');
  if (lb) new MutationObserver(sync).observe(lb, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
})();

/* ---------- фильтры списков выпадающими списками ----------
   Логика фильтрации прототипа (content.js, events.js) работает по чипам.
   Чипы остаются в разметке скрытыми, а из каждой строки собирается список
   «Категория: Любая ▾»: выбор пункта нажимает соответствующий чип, сброс
   фильтров (тоже через чипы) возвращает значение списка. */
(function () {
  [].forEach.call(document.querySelectorAll('.dfilters'), function (box) {
    var bar = document.createElement('div');
    bar.className = 'dfilters__selects';
    [].forEach.call(box.querySelectorAll('.dfilters__row'), function (row) {
      var lab = row.querySelector('.dfilters__label');
      var chips = [].slice.call(row.querySelectorAll('.chip'));
      if (!chips.length) return;
      var wrap = document.createElement('label');
      wrap.className = 'dselect';
      var cap = document.createElement('span');
      cap.className = 'dselect__lab';
      cap.textContent = lab ? lab.textContent : '';
      var sel = document.createElement('select');
      chips.forEach(function (c, i) {
        var o = document.createElement('option');
        o.value = i;
        o.textContent = c.childNodes[0].textContent.trim();
        if (c.classList.contains('is-active')) o.selected = true;
        sel.appendChild(o);
      });
      var val = document.createElement('span');
      val.className = 'dselect__val';
      function show() { val.textContent = sel.options[sel.selectedIndex].textContent; }
      sel.addEventListener('change', function () { chips[sel.value].click(); show(); });
      new MutationObserver(function () {
        chips.forEach(function (c, i) { if (c.classList.contains('is-active')) sel.value = i; });
        show();
      }).observe(row, { subtree: true, attributes: true, attributeFilter: ['class'] });
      show();
      wrap.appendChild(cap);
      wrap.appendChild(val);
      wrap.appendChild(sel);
      bar.appendChild(wrap);
    });
    box.insertBefore(bar, box.firstChild);
    box.classList.add('is-selects');
  });
})();

/* ---------- экран «отправлено» у форм ----------
   В прототипе состояния переключала служебная панель, в дизайне её нет:
   если проверка (events.js) прошла без ошибок, прячем форму и показываем
   соседний блок .st-done внутри того же контейнера с data-states */
(function () {
  [].forEach.call(document.querySelectorAll('[data-states] .jsform'), function (form) {
    form.addEventListener('submit', function () {
      setTimeout(function () {
        if (form.querySelector('.is-invalid')) return;
        var box = form.closest('[data-states]');
        [].forEach.call(box.querySelectorAll('.st-open'), function (el) { el.hidden = true; });
        [].forEach.call(box.querySelectorAll('.st-done'), function (el) { el.hidden = false; });
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    });
  });
})();

/* ---------- лайтбокс альбомов показывает снимки ----------
   У альбома в разметке одна обложка, список кадров — в data-photos.
   Номер кадра берём из счётчика лайтбокса «N из M» и показываем
   кадры по кругу, пока в альбоме нет полного набора */
(function () {
  var list = null;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-photos]');
    if (a) list = a.getAttribute('data-photos').split(',');
    else if (e.target.closest('.gallery__item')) list = null;
  }, true);
  var lb = document.querySelector('.lightbox');
  if (!lb) return;
  new MutationObserver(function () {
    if (lb.hidden || !list) return;
    var n = parseInt(lb.querySelector('.lightbox__counter').textContent || '1', 10) - 1;
    lb.querySelector('.lightbox__ph').style.backgroundImage = 'url("' + list[n % list.length] + '")';
    lb.querySelector('.lightbox__label').style.display = 'none';
  }).observe(lb, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
})();

/* ---------- экраны подписки ----------
   [data-flow] — набор экранов .st-*: после отправки формы — «проверьте
   почту» с введённым адресом, кнопки data-state-go переключают экраны,
   ?state=done|off|bad открывает экран напрямую (как ссылки из письма) */
(function () {
  var box = document.querySelector('[data-flow]');
  if (!box) return;
  function show(st) {
    [].forEach.call(box.querySelectorAll('[class*="st-"]'), function (el) {
      var m = el.className.match(/\bst-(\w+)/);
      if (m) el.hidden = m[1] !== st;
    });
  }
  var want = (location.search.match(/[?&]state=(\w+)/) || [])[1];
  if (want && box.querySelector('.st-' + want)) show(want);
  [].forEach.call(box.querySelectorAll('[data-state-go]'), function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-state-go')); });
  });
  var form = box.querySelector('form');
  if (form) form.addEventListener('submit', function () {
    setTimeout(function () {
      if (form.querySelector('.is-invalid')) return;
      var mail = form.querySelector('[type=email]').value;
      [].forEach.call(box.querySelectorAll('[data-email]'), function (e) { e.textContent = mail; });
      show('sent');
    }, 0);
  });
})();

/* ---------- подписка на главной ----------
   Отдельной страницы подписки пока нет (решение Ивана 06.10): форма внизу
   главной проверяет адрес и обе галочки и прямо на месте сменяется
   экраном «Проверьте почту» — первый шаг double opt-in (ТЗ п. 6.15) */
(function () {
  [].forEach.call(document.querySelectorAll('.sblock .sform'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = form.querySelector('[type=email]');
      var ok = !!(mail.checkValidity() && mail.value.trim());
      form.querySelector('.sform__row').classList.toggle('is-invalid', !ok);
      [].forEach.call(form.querySelectorAll('.scheck input[required]'), function (c) {
        c.closest('.scheck').classList.toggle('is-invalid', !c.checked);
        if (!c.checked) ok = false;
      });
      if (!ok) return;
      var done = form.parentNode.querySelector('.sdone');
      done.querySelector('[data-email]').textContent = mail.value.trim();
      form.hidden = true;
      done.hidden = false;
    });
    form.addEventListener('change', function (e) {
      var s = e.target.closest('.scheck');
      if (s && e.target.checked) s.classList.remove('is-invalid');
    });
    form.addEventListener('input', function (e) {
      if (e.target.type === 'email') form.querySelector('.sform__row').classList.remove('is-invalid');
    });
  });
  [].forEach.call(document.querySelectorAll('[data-sub-again]'), function (b) {
    b.addEventListener('click', function () {
      var box = b.closest('.sblock');
      box.querySelector('.sdone').hidden = true;
      box.querySelector('.sform').hidden = false;
    });
  });
})();
