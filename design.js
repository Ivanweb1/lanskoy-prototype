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

    /* ---- панель «Дизайнерам» ----
       В Ч/Б-прототипе (partials.js, заморожен) «Дизайнерам» — простая
       ссылка. В дизайне у раздела три страницы: лендинг, каталог и анкета,
       поэтому пункт становится выпадающим, как «О комплексе». Вторая
       колонка — то, что лендинг называет «для работы». Обработчик клика —
       тот же closeMega из app.js, который к новой кнопке не привязан. */
    var dLink = document.querySelector('.menu__list a.menu__link[href="designers.html"]');
    var aboutPanel = document.getElementById('mega-about');
    if (dLink && aboutPanel && !document.getElementById('mega-designers')) {
      var dItem = dLink.closest('.menu__item');
      dItem.classList.add('menu__item--has');
      dItem.innerHTML = '<button type="button" class="menu__link" data-mega="designers">' +
        'Дизайнерам<span class="caret"></span></button>';
      aboutPanel.insertAdjacentHTML('afterend',
        '<div class="mega" id="mega-designers" hidden>' +
        '  <div class="wrap mega__in">' +
        '    <div class="mega__col">' +
        '      <p class="mega__title">Специалистам</p>' +
        '      <ul class="mega__links">' +
        '        <li><a href="designers.html">Дизайнерам</a></li>' +
        '        <li><a href="designers.html#catalog">Каталог дизайнеров</a></li>' +
        '        <li><a href="designer-form.html">Анкета дизайнера</a></li>' +
        '      </ul>' +
        '    </div>' +
        '    <div class="mega__col">' +
        '      <p class="mega__title">Для работы</p>' +
        '      <ul class="mega__links">' +
        '        <li><a href="shops.html">Каталог магазинов</a></li>' +
        '        <li><a href="events.html?aud=pro">Профессиональные события</a></li>' +
        '        <li><a href="journal.html">Журнал</a></li>' +
        '      </ul>' +
        '    </div>' +
        '  </div>' +
        '</div>');
      var dPanel = document.getElementById('mega-designers');
      dPanel.querySelector('.mega__in').insertAdjacentHTML('beforeend', prevCard('megaPrevDesigners', ''));
      var dc = document.getElementById('megaPrevDesigners');
      dc.setAttribute('href', 'designers.html#catalog');
      dc.querySelector('img').src = 'img/designers/litvyakova/1.webp';
      dc.querySelector('.mprev__kicker').textContent = 'Специалистам';
      dc.querySelector('.mprev__t').textContent = 'Каталог дизайнеров';
      dc.querySelector('.mprev__c').textContent = 'Дизайнеры интерьеров, архитекторы и светодизайнеры с портфолио и контактами';
      var dBtn = dItem.querySelector('[data-mega]');
      dBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = dPanel.hidden;
        if (typeof closeMega === 'function') closeMega();
        var sb = document.getElementById('searchbar');
        if (sb) sb.hidden = true;
        if (willOpen) {
          dPanel.hidden = false;
          dItem.classList.add('is-open');
        }
      });
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
    '500.html': 'design-500.html',
    'lk-login.html': 'design-lk-login.html',
    'lk-code.html': 'design-lk-code.html',
    'lk-reset.html': 'design-lk-reset.html',
    'lk-newpass.html': 'design-lk-newpass.html',
    'lk-first.html': 'design-lk-first.html'
  };
  [].forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var h = a.getAttribute('href');
    var m = h.match(/^([a-z0-9-]+\.html)(.*)$/);
    /* «Каталог дизайнеров» в меню и подвале вёл на блок лендинга — ведём на страницу каталога */
    if (h === 'designers.html#catalog') { a.setAttribute('href', 'design-designers-catalog.html'); return; }
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
    /* фотоотчёт события ведёт просмотр альбомов — кадр ставит он */
    if (!lb || lb.hidden || !cur || cur.hasAttribute('data-album')) return;
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

/* ---------- «Обсудить проект» на странице дизайнера ----------
   Кнопка раскрывает каналы связи; клик мимо и Esc закрывают */
(function () {
  var btn = document.querySelector('.dask__btn');
  if (!btn) return;
  var menu = document.getElementById(btn.getAttribute('aria-controls'));
  function set(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(menu.hidden); });
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
})();

/* ---------- указатель брендов ----------
   Буква, категория и поиск работают вместе. Буквы, под которыми после
   фильтра пусто, гаснут. «Найдено N» — общий счётчик списков (ниже). */
(function () {
  var list = document.getElementById('brandList');
  if (!list || !list.querySelector('.dbitem')) return;
  var nav = document.getElementById('alphaNav');
  var q = document.getElementById('brandSearch');
  var empty = document.getElementById('brandEmpty');
  var cnt = document.getElementById('brandCount');
  var word = document.getElementById('brandCountWord');
  var chips = [].slice.call(document.querySelectorAll('#brandFilters .chip[data-cat]'));
  var groups = [].slice.call(list.querySelectorAll('.dbgroup'));
  var letter = 'all', cat = 'all';
  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'бренд';
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'бренда';
    return 'брендов';
  }
  function match(it, s) {
    return (cat === 'all' || it.dataset.cat === cat) &&
           (!s || it.dataset.name.toLowerCase().indexOf(s) > -1);
  }
  function apply() {
    var s = q.value.trim().toLowerCase(), total = 0, last = null, has = {};
    groups.forEach(function (g) {
      var shown = 0;
      [].forEach.call(g.querySelectorAll('.dbitem'), function (it) {
        var ok = match(it, s);
        if (ok) has[g.dataset.letter] = true;
        ok = ok && (letter === 'all' || g.dataset.letter === letter);
        it.hidden = !ok;
        if (ok) shown++;
      });
      g.hidden = !shown;
      g.classList.remove('is-last');
      if (shown) last = g;
      total += shown;
    });
    if (last) last.classList.add('is-last');
    empty.hidden = total > 0;
    cnt.textContent = total;
    word.textContent = plural(total);
    [].forEach.call(nav.querySelectorAll('[data-letter]'), function (b) {
      if (b.dataset.letter === 'all') return;
      var off = !has[b.dataset.letter];
      b.classList.toggle('alpha__i--off', off);
      b.disabled = off;
    });
  }
  function setLetter(l) {
    letter = l;
    [].forEach.call(nav.querySelectorAll('.alpha__i'), function (b) {
      b.classList.toggle('is-active', b.dataset.letter === l);
    });
  }
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('[data-letter]');
    if (!b || b.disabled) return;
    setLetter(b.dataset.letter);
    apply();
    /* к началу списка, если указатель уже прилип */
    var top = list.getBoundingClientRect().top - nav.offsetHeight - (parseInt(getComputedStyle(nav).top, 10) || 0) - 16;
    if (top < 0) window.scrollBy({ top: top, behavior: 'smooth' });
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.toggle('is-active', x === c); });
      cat = c.dataset.cat;
      /* буква могла опустеть в новой категории — снимаем её */
      setLetter('all');
      apply();
    });
  });
  q.addEventListener('input', apply);
  [].forEach.call(document.querySelectorAll('[data-brandreset]'), function (b) {
    b.addEventListener('click', function () {
      q.value = '';
      if (chips[0]) chips[0].click(); else { setLetter('all'); apply(); }
    });
  });
  apply();
})();

/* ---------- схема этажей: несколько секций сразу ----------
   floors.html?rooms=А10,А12&brand=Албес — со страницы бренда: подсвечиваем
   все его магазины. floors.js (общий с Ч/Б) умеет только одну секцию,
   поэтому отмечаем здесь и повторяем после каждой перерисовки плана */
(function () {
  var box = document.getElementById('bigPlan');
  var m = location.search.match(/[?&]rooms=([^&]+)/);
  if (!box || !m) return;
  var codes = decodeURIComponent(m[1]).split(',');
  var brand = (location.search.match(/[?&]brand=([^&]+)/) || [])[1];
  function mark() {
    codes.forEach(function (c) {
      var el = box.querySelector('[data-room="' + c + '"]');
      if (el && !el.classList.contains('pl-room--here')) el.classList.add('pl-room--here');
    });
  }
  new MutationObserver(mark).observe(box, { childList: true });
  mark();
  var hint = document.getElementById('planHint');
  if (hint) hint.textContent = (brand ? decodeURIComponent(brand) + ': ' : '') + 'секции ' + codes.join(', ');
})();

/* ---------- афиша по ссылке с фильтром «Кому» ----------
   events.html?aud=pro — сразу события для дизайнеров (пункт «Профессиональные
   события» в меню «Дизайнерам»). Жмём чип — список фильтра подхватит сам */
(function () {
  var aud = (location.search.match(/[?&]aud=(\w+)/) || [])[1];
  if (!aud) return;
  var chip = document.querySelector('.chip[data-aud="' + aud + '"]');
  if (chip && !chip.classList.contains('is-active')) chip.click();
})();

/* ---------- выпадающие списки в стиле сайта ----------
   Раскрытый список у <select> рисует браузер/ОС (системный шрифт, синяя
   подсветка) — стилями его не изменить. Поэтому поверх каждого списка
   строим свой: кнопка + список вариантов. Настоящий <select> остаётся
   скрытым и синхронным: фильтры и формы работают с ним как раньше.
   Клавиатура: Enter/Пробел/↓ — открыть, ↑↓ — выбор, Enter — подтвердить,
   Esc — закрыть; клик вне списка закрывает */
(function () {
  function enhance(sel, host) {
    if (sel.dataset.dd) return;
    sel.dataset.dd = '1';
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    host.classList.add('dd');
    var list = document.createElement('ul');
    list.className = 'dd__list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    var lab = host.querySelector('.dselect__lab, .fld__lab');
    btn.setAttribute('aria-label', (lab ? lab.textContent + ': ' : '') + 'выбрать');
    host.appendChild(btn);
    host.appendChild(list);
    var cur = 0;

    function build() {
      list.innerHTML = '';
      [].forEach.call(sel.options, function (o, i) {
        if (o.hidden) return;
        var li = document.createElement('li');
        li.className = 'dd__opt';
        li.setAttribute('role', 'option');
        li.textContent = o.textContent;
        li.dataset.i = i;
        list.appendChild(li);
      });
    }
    function mark() {
      [].forEach.call(list.children, function (li) {
        var i = +li.dataset.i;
        li.classList.toggle('is-sel', i === sel.selectedIndex);
        li.classList.toggle('is-cur', i === cur);
        li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false');
      });
    }
    function open() {
      document.dispatchEvent(new CustomEvent('dd:close'));
      cur = sel.selectedIndex;
      mark();
      list.hidden = false;
      host.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      list.hidden = true;
      host.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function pick(i) {
      if (i !== sel.selectedIndex) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      close();
      btn.focus();
    }
    build();
    /* поле — по ширине раскрытого списка (самого длинного варианта),
       чтобы список не выступал из-под него */
    function fit() {
      if (!host.classList.contains('dselect')) return;
      list.style.visibility = 'hidden';
      list.hidden = false;
      var w = list.offsetWidth;
      list.hidden = true;
      list.style.visibility = '';
      if (w > host.offsetWidth) host.style.minWidth = w + 'px';
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      list.hidden ? open() : close();
    });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li) pick(+li.dataset.i);
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li && +li.dataset.i !== cur) { cur = +li.dataset.i; mark(); }
    });
    function step(d) {
      var n = sel.options.length;
      do { cur = (cur + d + n) % n; } while (sel.options[cur].hidden);
      mark();
    }
    btn.addEventListener('keydown', function (e) {
      if (list.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cur); }
      else if (e.key === 'Escape' || e.key === 'Tab') close();
    });
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) close(); });
    document.addEventListener('dd:close', close);
    /* «label» вокруг списка фильтра: клик по подписи открывает список */
    host.addEventListener('click', function (e) {
      if (e.target === btn || btn.contains(e.target) || list.contains(e.target)) return;
      e.preventDefault();
      list.hidden ? open() : close();
    });
  }
  [].forEach.call(document.querySelectorAll('.dselect'), function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  });
  [].forEach.call(document.querySelectorAll('.dform__sel, .sortbox'), function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  });
  /* для полей, добавленных после загрузки (объекты в анкете дизайнера) */
  window.lnsEnhanceSelect = function (w) {
    var s = w.querySelector('select'); if (s) enhance(s, w);
  };
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

/* ---------- анкета: маска телефона, счётчик символов, превью фото ---------- */
(function () {
  [].forEach.call(document.querySelectorAll('input[data-mask="phone"]'), function (inp) {
    function fmt(v) {
      var d = v.replace(/\D/g, '');
      /* первая 7 — из «+7 (»; вставленный «+7…»/«8…» номер даёт ещё одну лишнюю */
      if (d.charAt(0) === '7') d = d.slice(1);
      if (d.length > 10 && /^[78]/.test(d)) d = d.slice(1);
      d = d.slice(0, 10);
      var out = '+7 (' + d.slice(0, 3);
      if (d.length >= 3) out += ') ' + d.slice(3, 6);
      if (d.length >= 6) out += '-' + d.slice(6, 8);
      if (d.length >= 8) out += '-' + d.slice(8, 10);
      return out;
    }
    inp.addEventListener('input', function (e) {
      if (e.inputType && e.inputType.indexOf('delete') === 0) return;
      inp.value = fmt(inp.value);
    });
    inp.addEventListener('focus', function () { if (!inp.value) inp.value = '+7 ('; });
    inp.addEventListener('blur', function () { if (inp.value.replace(/\D/g, '').length <= 1) inp.value = ''; });
  });

  /* поле «лет»: только цифры, без стрелок у type=number */
  document.addEventListener('input', function (e) {
    if (e.target.matches && e.target.matches('input[data-digits]')) e.target.value = e.target.value.replace(/\D/g, '');
  });

  [].forEach.call(document.querySelectorAll('textarea[data-count]'), function (ta) {
    var box = ta.parentNode.querySelector('.fld__count');
    if (!box) return;
    var n = box.querySelector('span'), max = +ta.getAttribute('maxlength');
    function upd() {
      n.textContent = ta.value.length;
      box.classList.toggle('is-near', ta.value.length > max * 0.9);
    }
    ta.addEventListener('input', upd); upd();
  });

  /* фото: копим выбранные файлы, показываем плитками с крестиком;
     лишние сверх 10 и тяжелее 5 МБ не берём и пишем почему */
  function initUpload(zone) {
    var inp = zone.querySelector('input[type=file]');
    var wrap = zone.parentNode, list = wrap.querySelector('.dthumbs'), msg = wrap.querySelector('.dthumbs__msg');
    var t = zone.querySelector('.dupload__t'), t0 = t.innerHTML;
    var MAX = +zone.getAttribute('data-max') || 10, MB = 5, files = [], caps = [];
    function sync() {
      if (window.DataTransfer) {
        var dt = new DataTransfer();
        files.forEach(function (f) { dt.items.add(f); });
        inp.files = dt.files;
      }
      list.innerHTML = '';
      files.forEach(function (f, i) {
        var li = document.createElement('li');
        var img = document.createElement('img');
        img.src = URL.createObjectURL(f); img.alt = '';
        /* подпись к работе — уйдёт на страницу дизайнера под фото */
        var cap = document.createElement('input');
        cap.type = 'text'; cap.name = 'cap' + i; cap.maxLength = 60; cap.value = caps[i] || '';
        cap.placeholder = 'Квартира, 86 м²';
        cap.setAttribute('aria-label', 'Подпись к фото ' + f.name);
        cap.dataset.i = i;
        var x = document.createElement('button');
        x.type = 'button'; x.className = 'dthumbs__x'; x.dataset.i = i;
        x.setAttribute('aria-label', 'Убрать ' + f.name);
        li.appendChild(img); li.appendChild(cap); li.appendChild(x); list.appendChild(li);
      });
      list.hidden = !files.length;
      zone.classList.toggle('has-files', files.length > 0);
      zone.hidden = files.length >= MAX;
      t.innerHTML = files.length ? 'Добавить ещё <u>фото</u> — ' + files.length + ' из ' + MAX : t0;
    }
    inp.addEventListener('change', function () {
      var picked = [].slice.call(inp.files), skipped = [];
      picked.forEach(function (f) {
        if (!/^image\/(jpeg|png)$/.test(f.type)) skipped.push(f.name + ' — не JPG и не PNG');
        else if (f.size > MB * 1024 * 1024) skipped.push(f.name + ' — больше ' + MB + ' МБ');
        else if (files.length >= MAX) skipped.push(f.name + ' — уже ' + MAX + ' фото');
        else { files.push(f); caps.push(''); }
      });
      msg.textContent = skipped.length ? 'Не добавлены: ' + skipped.join('; ') : '';
      msg.hidden = !skipped.length;
      sync();
    });
    list.addEventListener('input', function (e) {
      if (e.target.dataset.i) caps[+e.target.dataset.i] = e.target.value;
    });
    list.addEventListener('click', function (e) {
      var x = e.target.closest('.dthumbs__x');
      if (!x) return;
      files.splice(+x.dataset.i, 1);
      caps.splice(+x.dataset.i, 1);
      msg.hidden = true;
      sync();
    });
  }
  [].forEach.call(document.querySelectorAll('[data-upload]'), initUpload);

  /* портфолио анкеты: объекты добавляются из <template>, до 6;
     у единственного объекта кнопки «Удалить» нет */
  var objs = document.querySelector('[data-objs]');
  var add = document.querySelector('[data-obj-add]');
  var tpl = document.getElementById('objTpl');
  if (objs && add && tpl) {
    var MAXO = 6;
    var renum = function () {
      var list = objs.querySelectorAll('.dobj');
      [].forEach.call(list, function (o, i) {
        o.querySelector('.dobj__n').textContent = 'Объект ' + (i + 1);
        o.querySelector('.dobj__del').hidden = list.length < 2;
      });
      add.hidden = list.length >= MAXO;
    };
    add.addEventListener('click', function () {
      if (objs.querySelectorAll('.dobj').length >= MAXO) return;
      objs.appendChild(tpl.content.cloneNode(true));
      var o = objs.lastElementChild;
      initUpload(o.querySelector('[data-upload]'));
      [].forEach.call(o.querySelectorAll('.dform__sel'), function (w) {
        if (window.lnsEnhanceSelect) window.lnsEnhanceSelect(w);
      });
      renum();
      o.querySelector('input[type=text]').focus();
    });
    objs.addEventListener('click', function (e) {
      var del = e.target.closest('.dobj__del');
      if (!del) return;
      del.closest('.dobj').remove();
      renum();
    });
    renum();
  }
})();

/* ---------- лайтбокс альбомов: снимки, подписи, лента миниатюр ----------
   У альбома в разметке одна обложка, список кадров — в data-photos,
   подписи кадров — в data-caps (через «|»). Номер кадра берём из
   счётчика лайтбокса «N / M»; пока в альбоме нет полного набора,
   кадры и подписи идут по кругу. Под кадром — строка «подпись · альбом»
   и счётчик, ниже лента миниатюр: текущая подсвечена, клик — переход */
(function () {
  var list = null, caps = null, album = '', meta = '', built = -1, vids = null;
  var lb = document.querySelector('.lightbox');
  if (!lb) return;
  var stage = lb.querySelector('.lightbox__stage');
  var counter = lb.querySelector('.lightbox__counter');
  var bar = document.createElement('div');
  bar.className = 'lightbox__bar';
  bar.innerHTML = '<p class="lightbox__cap"><b></b><span></span></p>';
  stage.appendChild(bar);
  var thumbs = document.createElement('div');
  thumbs.className = 'lightbox__thumbs';
  lb.appendChild(thumbs);

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-photos]');
    if (a) {
      list = a.getAttribute('data-photos').split(',');
      caps = (a.getAttribute('data-caps') || '').split('|').filter(Boolean);
      var h = a.querySelector('.album__h'), m = a.querySelector('.album__m');
      album = h ? h.textContent : '';
      meta = m ? m.textContent.split(' · ')[0] : '';
      built = -1;
    } else if (e.target.closest('.dgallery[data-album] .gallery__item')) {
      /* фотоотчёт события — тот же просмотр, что у альбомов галереи:
         кадры — все снимки плитки, подписи — data-caps, «альбом» — событие */
      var box = e.target.closest('.dgallery');
      list = [].map.call(box.querySelectorAll('.gallery__item img'), function (i) { return i.getAttribute('src'); });
      caps = (box.getAttribute('data-caps') || '').split('|').filter(Boolean);
      album = box.getAttribute('data-album') || '';
      meta = box.getAttribute('data-meta') || '';
      built = -1;
    } else if (e.target.closest('.gallery__item')) list = null;
    else if (e.target.closest('.vid')) {
      list = null;
      vids = [].filter.call(document.querySelectorAll('#vidGrid .vid'), function (v) { return !v.hidden; });
    }
  }, true);

  function sync() {
    var on = !lb.hidden && !!list;
    lb.classList.toggle('lightbox--album', on);
    /* видео: обложка ролика под кнопкой воспроизведения, подпись —
       название и «Видео · длительность · дата» */
    var isVid = !lb.hidden && !list && vids && lb.classList.contains('lightbox--video');
    lb.classList.toggle('lightbox--vposter', !!isVid);
    if (isVid) {
      var k = (parseInt(counter.textContent, 10) || 1) - 1, v = vids[k];
      if (v) {
        var img = v.querySelector('img');
        lb.querySelector('.lightbox__ph').style.backgroundImage = img ? 'url("' + img.getAttribute('src') + '")' : '';
        var m = v.querySelector('.vid__m');
        var note = lb.querySelector('.lightbox__note');
        note.hidden = !m; if (m) note.textContent = m.textContent.replace(/\s+/g, ' ').trim();
      }
      return;
    }
    if (!on) return;
    var parts = counter.textContent.split('/');
    var n = parseInt(parts[0], 10) - 1, total = parseInt(parts[1], 10) || list.length;
    lb.querySelector('.lightbox__ph').style.backgroundImage = 'url("' + list[n % list.length] + '")';
    lb.querySelector('.lightbox__label').style.display = 'none';
    bar.querySelector('b').textContent = caps.length ? caps[n % caps.length] : album;
    bar.querySelector('span').textContent = album + (meta ? ' · ' + meta : '');
    bar.appendChild(counter);
    if (built !== total) {
      thumbs.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var t = document.createElement('button');
        t.type = 'button';
        t.className = 'lightbox__thumb';
        t.style.backgroundImage = 'url("' + list[i % list.length] + '")';
        t.setAttribute('aria-label', 'Фото ' + (i + 1));
        t.dataset.i = i;
        thumbs.appendChild(t);
      }
      built = total;
    }
    [].forEach.call(thumbs.children, function (t, i) {
      var cur = i === n;
      t.classList.toggle('is-active', cur);
      if (cur) {
        t.setAttribute('aria-current', 'true');
        var l = t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2;
        thumbs.scrollTo({ left: l, behavior: 'smooth' });
      } else t.removeAttribute('aria-current');
    });
  }
  thumbs.addEventListener('click', function (e) {
    var t = e.target.closest('.lightbox__thumb');
    if (t && window.lnsLightboxGo) window.lnsLightboxGo(+t.dataset.i);
  });
  /* sync сам меняет DOM лайтбокса — на время отключаем наблюдение */
  var opts = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] };
  var mo = new MutationObserver(function () { mo.disconnect(); sync(); mo.takeRecords(); mo.observe(lb, opts); });
  mo.observe(lb, opts);
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

/* ---------- снимок под тему ----------
   Как первый экран главной: у картинки с data-src-dark в тёмной теме —
   вечерний кадр, в светлой — исходный */
(function () {
  var imgs = [].slice.call(document.querySelectorAll('img[data-src-dark]'));
  if (!imgs.length) return;
  imgs.forEach(function (i) { i.setAttribute('data-src-light', i.getAttribute('src')); });
  function sync() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    imgs.forEach(function (i) {
      var want = i.getAttribute(dark ? 'data-src-dark' : 'data-src-light');
      if (i.getAttribute('src') !== want) i.setAttribute('src', want);
    });
  }
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
})();

/* ---------- подкатегории на странице категорий — одной строкой ----------
   Сколько влезает в ширину карточки, остальное сворачиваем в «ещё N».
   N = скрытые здесь + те, что изначально не выведены (число из «ещё 7»). */
(function () {
  var lists = [].slice.call(document.querySelectorAll('.dcats__subs'));
  if (!lists.length) return;

  lists.forEach(function (ul) {
    var more = ul.querySelector('.dcats__more');
    ul._extra = more ? parseInt(more.textContent.replace(/\D/g, ''), 10) || 0 : 0;
    if (!more) {
      more = document.createElement('li');
      more.className = 'dcats__more';
      ul.appendChild(more);
    }
    ul._more = more;
    ul._items = [].slice.call(ul.children).filter(function (li) { return li !== more; });
  });

  function fit(ul) {
    var items = ul._items, more = ul._more, hidden = 0;
    items.forEach(function (li) { li.hidden = false; });
    ul.appendChild(more);
    var top = items[0].offsetTop;
    function update() { more.textContent = 'ещё ' + (hidden + ul._extra); }
    update();
    for (var i = items.length - 1; i > 0 && more.offsetTop > top; i--) {
      items[i].hidden = true;
      hidden++;
      update();
    }
    /* убираем из DOM, а не прячем: иначе у последнего пункта осталась бы точка */
    if (!hidden && !ul._extra) ul.removeChild(more);
  }

  function fitAll() { lists.forEach(fit); }
  fitAll();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fitAll, 100); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
})();


/* ---------- счётчик списков только при фильтре ----------
   Без фильтров «12 акций» дублирует сетку и путает с «Показать ещё 12»:
   читается как «всего», а значит «на экране». Показываем «Найдено: N»
   только когда выбран фильтр или введён запрос; при нуле его заменяет
   блок «не найдено». На поиске число результатов нужно всегда. */
(function () {
  [].forEach.call(document.querySelectorAll('.dfilters__count'), function (p) {
    if (p.querySelector('#srchCount')) return;
    var box = p.closest('.dfilters');
    var num = p.querySelector('b');
    var pre = document.createElement('span');
    pre.className = 'dfilters__found';
    pre.textContent = 'Найдено ';
    p.insertBefore(pre, p.firstChild);
    /* «Сбросить» — все списки на первый пункт, поиск пустой */
    var rst = document.createElement('button');
    rst.type = 'button';
    rst.className = 'dfilters__reset';
    rst.textContent = 'Сбросить';
    rst.addEventListener('click', function () {
      [].forEach.call(box.querySelectorAll('.dfilters__row'), function (row) {
        var first = row.querySelector('.chip');
        if (first && !first.classList.contains('is-active')) first.click();
      });
      var q = box.querySelector('input[type=search]');
      if (q && q.value) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    p.appendChild(rst);
    function upd() {
      var on = [].some.call(box.querySelectorAll('.dfilters__row'), function (row) {
        var chips = row.querySelectorAll('.chip');
        return chips.length && !chips[0].classList.contains('is-active');
      });
      var q = box.querySelector('input[type=search]');
      if (q && q.value.trim()) on = true;
      p.hidden = !on || parseInt(num.textContent, 10) === 0;
    }
    ['click', 'input', 'change'].forEach(function (ev) {
      document.addEventListener(ev, function () { setTimeout(upd, 0); });
    });
    upd();
  });
})();

/* ---------- пагинация под «Показать ещё» ----------
   <nav class="dpager" data-pages="N">. «Показать ещё» дописывает следующую
   страницу к текущей (подсвечен диапазон), номер — переход на страницу.
   Карточки в прототипе не подгружаются, меняется только состояние. */
(function () {
  [].forEach.call(document.querySelectorAll('.dpager[data-pages]'), function (nav) {
    var total = parseInt(nav.getAttribute('data-pages'), 10);
    var more = nav.closest('.results__more');
    var btn = more && more.querySelector('.dbtn');
    var hint = more && more.querySelector('.results__hint');
    var hm = hint && hint.textContent.match(/^(\D*)(\d+)(.*)$/);
    var from = 1, to = 1;
    var arrow = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

    function render() {
      var pages = [];
      for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= from - 1 && i <= to + 1)) pages.push(i);
      }
      var h = '<button type="button" class="dpager__arr" data-go="' + (from - 1) + '" aria-label="Предыдущая страница"' + (from === 1 ? ' disabled' : '') + '>' + arrow + '</button>';
      pages.forEach(function (n, k) {
        if (k && n - pages[k - 1] > 1) h += '<span class="dpager__gap">…</span>';
        var cur = n >= from && n <= to;
        h += '<button type="button" class="dpager__n' + (cur ? ' is-current' : '') + '" data-go="' + n + '"' + (n === from ? ' aria-current="page"' : '') + '>' + n + '</button>';
      });
      h += '<button type="button" class="dpager__arr dpager__arr--next" data-go="' + (to + 1) + '" aria-label="Следующая страница"' + (to === total ? ' disabled' : '') + '>' + arrow + '</button>';
      nav.innerHTML = h;
      if (btn) btn.hidden = to === total;
      if (hm) hint.textContent = hm[1] + (to - from + 1) * hm[2] + hm[3];
    }

    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]');
      if (!b || b.disabled) return;
      from = to = parseInt(b.getAttribute('data-go'), 10);
      render();
      var top = more.parentElement.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
    if (btn) btn.addEventListener('click', function () {
      if (to < total) { to++; render(); }
    });
    render();
  });
})();

/* ---------- «Скопировать ссылку» ---------- */
(function () {
  [].forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    var label = b.textContent;
    b.addEventListener('click', function () {
      try { navigator.clipboard.writeText(location.href); } catch (e) {}
      if (b.classList.contains('dshare')) {
        b.classList.add('is-done');
        b.setAttribute('title', 'Ссылка скопирована');
        setTimeout(function () { b.classList.remove('is-done'); b.setAttribute('title', 'Скопировать ссылку'); }, 2000);
        return;
      }
      b.textContent = 'Ссылка скопирована';
      setTimeout(function () { b.textContent = label; }, 2000);
    });
  });
})();

/* ---------- оглавление статьи на планшете и телефоне ----------
   Пункты собирает content.js в боковой колонке (#tocNav), здесь они копируются
   в свёрнутый блок над текстом. По нажатию на пункт блок закрывается */
(function () {
  var box = document.getElementById('tocM');
  var src = document.getElementById('tocNav');
  if (!box || !src) return;
  var nav = box.querySelector('.dtocm__nav');
  var links = src.querySelectorAll('a');
  if (!links.length) { box.hidden = true; return; }
  [].forEach.call(links, function (a) {
    var c = document.createElement('a');
    c.href = a.getAttribute('href');
    c.textContent = a.textContent;
    nav.appendChild(c);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) box.open = false;
  });
})();

/* ---------- страница поиска ----------
   Вкладки с числами (фильтрует content.js по data-kind), группы по типам
   во вкладке «Все» (до 3 строк + «Все N»), подсказки при вводе, крестик,
   пустая выдача. Демо: «Найти» с запросом не про плитку или ?empty=1 */
(function () {
  var form = document.getElementById('bigSearchForm');
  if (!form) return;
  var inp = document.getElementById('bigSearch');
  var clear = document.getElementById('bigClear');
  var sug = document.getElementById('bigSug');
  var list = document.getElementById('srchGrid');
  var tabs = document.getElementById('srchFilters');
  var results = document.getElementById('srchResults');
  var none = document.getElementById('srchNone');

  /* группы */
  function groups() {
    var act = tabs.querySelector('.is-active');
    var all = !act || act.getAttribute('data-kind') === 'all';
    list.classList.toggle('is-all', all);
    [].forEach.call(list.querySelectorAll('.dsrchgroup'), function (g) {
      var items = [].filter.call(g.querySelectorAll('.dsrch'), function (el) { return !el.hidden; });
      g.hidden = !items.length;
      /* режем до 3 строк, только если прячется 3 и больше —
         кнопка ради одной-двух строк не нужна, их проще показать */
      var cut = items.length - 3 >= 3;
      items.forEach(function (el, i) { el.classList.toggle('is-over', cut && i >= 3); });
      var more = g.querySelector('.dsrchgroup__more');
      if (more) {
        more.hidden = !cut;
        if (cut) {
          var n = items.length - 3, w = (more.getAttribute('data-words') || 'результат,результата,результатов').split(',');
          var d10 = n % 10, d100 = n % 100;
          var word = d10 === 1 && d100 !== 11 ? w[0] : (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14) ? w[1] : w[2]);
          more.textContent = 'Ещё ' + n + ' ' + word;
        }
      }
    });
  }
  tabs.addEventListener('click', function () { setTimeout(groups, 0); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-srchreset]')) setTimeout(groups, 0);
    var more = e.target.closest('.dsrchgroup__more');
    if (more) {
      var t = tabs.querySelector('[data-kind="' + more.getAttribute('data-tab') + '"]');
      if (t) t.click();
      tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  groups();

  /* мобильные вкладки: затухание справа убираем, когда долистали до конца */
  var row = tabs.querySelector('.dsrchtabs__row');
  function edge() { row.classList.toggle('is-end', row.scrollLeft + row.clientWidth >= row.scrollWidth - 2); }
  row.addEventListener('scroll', edge, { passive: true });
  window.addEventListener('resize', edge);
  edge();

  /* подсказки: магазины, категории, бренды, секции */
  var DATA = [
    ['Магазины', 'Ленплитка', 'А1 · 1 этаж', 'shop.html'],
    ['Магазины', 'Керамолл', 'А45 · 1 этаж', 'shop.html'],
    ['Магазины', 'Стиль Керамики', 'А29 · 1 этаж', 'shop.html'],
    ['Магазины', 'VLADART STUDIO', 'А10 · 1 этаж', 'shop.html'],
    ['Магазины', 'Премьер декор', 'А12 · 1 этаж', 'shop.html'],
    ['Категории', 'Плитка', '17 магазинов', 'category.html'],
    ['Категории', 'Двери, перегородки, фурнитура', '14 магазинов', 'category.html'],
    ['Категории', 'Сантехника', '12 магазинов', 'category.html'],
    ['Бренды', 'Kerama Marazzi', '4 магазина', 'brand.html'],
    ['Секции', 'А10', 'VLADART STUDIO · на схеме', 'floors.html?room=А10&floor=1']
  ];
  var hl = -1;
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mark(t, q) {
    var i = t.toLowerCase().indexOf(q);
    return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length));
  }
  function showSug() {
    var q = inp.value.trim().toLowerCase();
    clear.hidden = !inp.value;
    hl = -1;
    if (q.length < 2) { sug.hidden = true; return; }
    var hits = DATA.filter(function (d) { return d[1].toLowerCase().indexOf(q) > -1 || d[2].toLowerCase().indexOf(q) > -1; }).slice(0, 7);
    if (!hits.length) { sug.hidden = true; return; }
    var h = '', g = '';
    hits.forEach(function (d) {
      if (d[0] !== g) { g = d[0]; h += '<p class="dsrchsug__g">' + g + '</p>'; }
      h += '<a class="dsrchsug__i" href="' + d[3] + '"><span>' + mark(d[1], q) + '</span><span class="dsrchsug__m">' + esc(d[2]) + '</span></a>';
    });
    sug.innerHTML = h;
    sug.hidden = false;
  }
  inp.addEventListener('input', showSug);
  inp.addEventListener('focus', showSug);
  inp.addEventListener('keydown', function (e) {
    var items = sug.hidden ? [] : sug.querySelectorAll('.dsrchsug__i');
    if (e.key === 'Escape') { sug.hidden = true; return; }
    if (!items.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter')) return;
    if (e.key === 'Enter') { if (hl > -1) { e.preventDefault(); items[hl].click(); } return; }
    e.preventDefault();
    hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    [].forEach.call(items, function (it, i) { it.classList.toggle('is-hl', i === hl); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#bigSearchForm')) sug.hidden = true; });
  clear.addEventListener('click', function () { inp.value = ''; showSug(); inp.focus(); });
  clear.hidden = !inp.value;

  /* «Найти»: в демо результаты есть только по плитке и керамике */
  function run(q) {
    var ok = /плит|керам/i.test(q);
    sug.hidden = true;
    results.hidden = !ok;
    tabs.hidden = !ok;
    none.hidden = ok;
    if (ok) document.getElementById('srchQ').textContent = q;
    else document.getElementById('srchNoneQ').textContent = q || '…';
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); run(inp.value.trim()); });
  if (/[?&]empty=1/.test(location.search)) { inp.value = 'ламинатт дуб'; clear.hidden = false; run(inp.value); }
})();

/* ---------- афиша: сортировка по дате ----------
   Ближайшие — от ранних к поздним, архив — от новых к старым.
   Дата берётся из data-date (ГГГГ-ММ-ДД) у строки события */
(function () {
  [['viewUpcoming', 1], ['viewArchive', -1]].forEach(function (v) {
    var box = document.getElementById(v[0]);
    if (!box) return;
    var rows = [].slice.call(box.querySelectorAll(':scope > .evrow[data-date]'));
    rows.sort(function (a, b) { return a.getAttribute('data-date') < b.getAttribute('data-date') ? -v[1] : v[1]; });
    var tail = box.querySelector(':scope > .results__more');
    rows.forEach(function (r) { box.insertBefore(r, tail); });
  });
})();

/* ---------- страница события: состояние из адреса ----------
   Панель справа: open (регистрация), full (мест нет), free (вход
   свободный), past. Афиша ведёт сюда с ?state=…, чтобы «Подробнее»
   у события без регистрации не открывало форму регистрации */
(function () {
  if (!document.getElementById('regForm')) return;
  var box = document.querySelector('aside[data-states]');
  var st = (location.search.match(/[?&]state=(\w+)/) || [])[1];
  /* архив афиши ведёт с ?past=1 — это то же состояние past */
  if (!st && /[?&]past=1/.test(location.search)) st = 'past';
  if (!box || !st || !box.querySelector('.st-' + st)) return;
  /* состояние меняет и правую панель, и блоки в тексте (отчёт «Как прошло») */
  [].forEach.call(document.querySelectorAll('main [class*="st-"]'), function (el) {
    var m = el.className.match(/\bst-(\w+)/);
    if (m) el.hidden = m[1] !== st;
  });
  var part = document.querySelector('[data-part]');
  if (part && st === 'free') part.textContent = 'Свободный вход, без регистрации';
  if (part && st === 'full') part.textContent = 'По регистрации — мест нет';
  if (part && st === 'past') part.textContent = 'Событие прошло';
})();

/* ---------- журнал: фильтр по тегу ----------
   Тег подставляется в поиск по статьям — content.js ищет и по тексту,
   и по data-tags. Повторное нажатие на активный тег снимает фильтр */
(function () {
  var q = document.getElementById('postSearch');
  if (!q) return;
  function mark() {
    var v = q.value.trim().toLowerCase();
    [].forEach.call(document.querySelectorAll('.jtag'), function (t) {
      t.classList.toggle('is-active', !!v && t.getAttribute('data-tag') === v);
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.jtag');
    if (!t) return;
    var tag = t.getAttribute('data-tag');
    q.value = q.value.trim().toLowerCase() === tag ? '' : tag;
    q.dispatchEvent(new Event('input', { bubbles: true }));
    mark();
    if (t.closest('.jtags--post')) document.getElementById('postFilters').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  q.addEventListener('input', mark);
})();

/* ---------- карточка магазина: режим работы и «Открыто сейчас» ----------
   Режим задаётся в кабинете по 7 дням: data-hours="пн,вт,…,вс", значение
   «10:00-20:00» или пусто (выходной). Одинаковые дни подряд сворачиваются
   в одну строку, сегодняшний выделен. Статус в первом экране считается от
   текущего времени; для показа в прототипе — ?time=21:30 и ?day=1…7. */
(function () {
  /* расписание есть в первом экране и в боковой колонке — данные берём из первого */
  var boxes = [].slice.call(document.querySelectorAll('[data-hours]'));
  if (!boxes.length) return;
  var box = boxes[0];
  var DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  var NEXT = ['в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу', 'в воскресенье'];
  var hours = box.getAttribute('data-hours').split(',').map(function (s) {
    var m = s.trim().match(/^(\d\d):(\d\d)-(\d\d):(\d\d)$/);
    return m ? { a: m[1] + ':' + m[2], b: m[3] + ':' + m[4], from: +m[1] * 60 + +m[2], to: +m[3] * 60 + +m[4] } : null;
  });
  var q = new URLSearchParams(location.search);
  var now = new Date();
  var day = q.get('day') ? (+q.get('day') - 1) % 7 : (now.getDay() + 6) % 7;
  var t = q.get('time') ? q.get('time').split(':') : [now.getHours(), now.getMinutes()];
  var min = +t[0] * 60 + +(t[1] || 0);
  function label(h) { return h ? h.a + ' — ' + h.b : 'выходной'; }

  /* расписание: группы одинаковых дней подряд */
  var groups = [];
  hours.forEach(function (h, i) {
    var g = groups[groups.length - 1];
    if (g && label(g.h) === label(h)) g.to = i;
    else groups.push({ from: i, to: i, h: h });
  });
  if (groups.length > 1) {
    var rows = groups.map(function (g) {
      var d = DAYS[g.from] + (g.to > g.from ? '—' + DAYS[g.to] : '');
      var today = day >= g.from && day <= g.to;
      return '<span class="dhours__r' + (today ? ' is-today' : '') + '"><span>' + d + '</span><span>' + label(g.h) + '</span></span>';
    }).join('');
    boxes.forEach(function (b) { b.innerHTML = rows; });
  }

  /* статус */
  var el = document.querySelector('[data-open]');
  if (!el) return;
  var h = hours[day];
  if (h && min >= h.from && min < h.to) {
    el.textContent = 'Открыто до ' + h.b;
    el.classList.remove('is-closed');
    return;
  }
  el.classList.add('is-closed');
  if (h && min < h.from) { el.textContent = 'Закрыто · откроется в ' + h.a; return; }
  for (var k = 1; k <= 7; k++) {
    var n = (day + k) % 7;
    if (hours[n]) {
      el.textContent = 'Закрыто · откроется ' + (k === 1 ? 'завтра' : NEXT[n]) + ' в ' + hours[n].a;
      return;
    }
  }
  el.textContent = 'Временно закрыто';
})();

/* ---------- мини-схема этажа: карточка магазина и «Аренда» ----------
   Мини-схема из сетки-заглушки не читалась. Берём настоящий этаж
   (floors-real.js) целиком, без увеличения. o.here — секция магазина
   (медью, номер рядом: внутри при таком масштабе не помещается);
   o.free — свободные секции (медью, каждая — ссылка на неё на схеме). */
function lnsNormRoom(c) { return String(c).replace(/A/g, 'А').replace(/B/g, 'В').replace(/C/g, 'С'); }
function lnsMiniPlan(n, o) {
  var f = typeof REAL_FLOORS !== 'undefined' && REAL_FLOORS[n];
  if (!f) return '';
  var vb = f.viewBox, here = null, free = o.free || [];
  var s = '<svg viewBox="' + vb.join(' ') + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path class="pl-outline" d="' + f.outline + '"/>', top = '';
  f.rooms.forEach(function (r) {
    if (o.here && r[0] === o.here) { here = r; return; }
    var isFree = r[0] && free.indexOf(r[0]) > -1;
    var path = '<path class="pl-room' + (r[0] ? '' : ' pl-room--blank') + (isFree ? ' pl-room--here' : '') + '" d="' + r[2] + '"/>';
    if (isFree) top += '<a href="floors.html?room=' + encodeURIComponent(r[0]) + '&amp;floor=' + n + '"><title>' + r[0] + ' — свободно</title>' + path + '</a>';
    else s += path;
  });
  s += top;
  /* o.named — секции с подписью арендатора: первая подписана над, вторая под */
  (o.named || []).forEach(function (c, i) {
    var r = f.rooms.filter(function (x) { return x[0] === c; })[0];
    if (!r) return;
    s += '<path class="pl-room pl-room--here" d="' + r[2] + '"/>';
    var y = i % 2 ? r[4] + r[6] + 40 : r[4] - 18;
    s += '<text class="pl-txt pl-txt--label" x="' + (r[3] + r[5] / 2) + '" y="' + y + '" text-anchor="middle" style="font-size:30px">' + r[1] + '</text>';
  });
  if (here) {
    s += '<path class="pl-room pl-room--here" d="' + here[2] + '"/>';
    var right = here[3] + here[5] + 120 < vb[0] + vb[2];
    s += '<text class="pl-txt pl-txt--label" x="' + (right ? here[3] + here[5] + 12 : here[3] - 12) + '" y="' + (here[4] + here[6] / 2 + 12) +
         '" text-anchor="' + (right ? 'start' : 'end') + '" style="font-size:36px">' + here[0] + '</text>';
  }
  return s + '</svg>';
}

/* карточка магазина: этаж с секцией магазина, ссылка — вся плашка */
(function () {
  var el = document.getElementById('shopPlan');
  if (!el) return;
  el.innerHTML = lnsMiniPlan(el.getAttribute('data-floor'), { here: lnsNormRoom(el.getAttribute('data-room')) });
})();

/* «Аренда»: липкая «Оставить заявку» на телефоне — пока не видно
   ни первого экрана (там свои кнопки), ни самой формы */
(function () {
  var bar = document.getElementById('rentSticky');
  var hero = document.querySelector('.drent-hero');
  var form = document.getElementById('form');
  if (!bar || !hero || !form) return;
  function upd() {
    var h = hero.getBoundingClientRect(), f = form.getBoundingClientRect();
    bar.hidden = h.bottom > 0 || f.top < window.innerHeight;
  }
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();


/* «Аренда»: доводы вкладками — клик, наведение или стрелки меняют панель справа */
(function () {
  var box = document.querySelector('.drwhy');
  if (!box) return;
  var tabs = [].slice.call(box.querySelectorAll('.drwhy__tab'));
  var plan = document.getElementById('whyPlan');
  if (plan) plan.innerHTML = lnsMiniPlan(plan.getAttribute('data-floor'), { named: plan.getAttribute('data-rooms').split(',') });
  /* на телефоне вкладок нет: каждый довод раскрыт и сразу со своим кадром —
     копия панели встаёт под текстом пункта (показывается только в узкой вёрстке) */
  tabs.forEach(function (t) {
    var p = document.getElementById(t.getAttribute('aria-controls'));
    var m = p.cloneNode(true);
    m.className = 'drwhy__mob';
    ['id', 'role', 'aria-labelledby', 'aria-hidden'].forEach(function (a) { m.removeAttribute(a); });
    [].forEach.call(m.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); });
    t.parentNode.insertBefore(m, t.nextSibling);
  });
  function show(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      var p = document.getElementById(t.getAttribute('aria-controls'));
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-hidden', String(!on));
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t); });
    /* наведение — только там, где есть мышь */
    t.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) show(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      var n = tabs[(i + k + tabs.length) % tabs.length];
      n.focus(); show(n);
    });
  });
})();


/* ---------- категория на карточке магазина ----------
   Подпись режется в одну строку с многоточием; полный текст — в подсказке */
(function () {
  [].forEach.call(document.querySelectorAll('.shopcard__cat'), function (c) {
    if (!c.title) c.title = c.textContent.trim();
  });
})();

/* ---------- схема этажей: правки 12.10 ----------
   floors.js общий с замороженным Ч/Б, поэтому всё — здесь, поверх его разметки:
   номера по ширине секции, фирменная подсказка вместо <title>, тексты и ссылки
   карточки секции, шторка на телефоне, масштаб и прокрутка к выбранной секции */
(function () {
  var page = document.querySelector('.dfloor');
  var box = document.getElementById('bigPlan');
  if (!page || !box) return;
  var panel = document.getElementById('roomPanel');
  var body = document.getElementById('roomBody');
  var legend = page.querySelector('.dlegend');

  /* одна панель вместо двух: поиск (floors.js: этаж + секция) встаёт в «Магазины на этаже»
     и заодно фильтрует список; выбранная секция — над ней */
  var side = page.querySelector('.floorside');
  var listEl = document.getElementById('floorList');
  var findPanel = listEl && listEl.closest('.dpanel');
  var searchInput = document.getElementById('planSearch');
  if (side && findPanel && searchInput) {
    var oldPanel = searchInput.closest('.dpanel');
    var head = findPanel.querySelector('.dpanel__head');
    var hintEl = document.getElementById('planHint');
    head.parentNode.insertBefore(searchInput.closest('.field'), head.nextSibling);
    if (hintEl) head.parentNode.insertBefore(hintEl, listEl);
    if (oldPanel && oldPanel !== findPanel) oldPanel.remove();
    findPanel.classList.add('dfloor__find');
    if (panel) side.insertBefore(panel, findPanel);
  }

  /* крестик шторки на телефоне */
  if (panel) {
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'droom__x';
    x.setAttribute('aria-label', 'Закрыть');
    x.textContent = '×';
    x.addEventListener('click', function () { panel.hidden = true; });
    panel.insertBefore(x, panel.firstChild);
  }

  /* ---- подсказка ---- */
  var tip = document.createElement('div');
  tip.className = 'dtip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);
  function tipText(el) {
    var t = el.getAttribute('data-tip') || '';
    var m = t.match(/^(\S+) — (.+)$/);
    return m ? '<b>' + m[1] + '</b>' + m[2].replace('арендатор не указан', 'магазин уточняется') : t;
  }
  page.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) { tip.classList.remove('is-on'); return; }
    tip.innerHTML = tipText(el);
    var tx = e.clientX + 14, ty = e.clientY + 18;
    if (tx + tip.offsetWidth > innerWidth - 8) tx = e.clientX - tip.offsetWidth - 14;
    tip.style.left = tx + 'px';
    tip.style.top = ty + 'px';
    tip.classList.add('is-on');
  });
  page.addEventListener('mouseleave', function () { tip.classList.remove('is-on'); });

  /* ---- после каждой перерисовки плана ---- */
  function fitLabels() {
    [].forEach.call(box.querySelectorAll('.pl-txt--real'), function (t) {
      var r = box.querySelector('[data-room="' + t.textContent + '"]');
      if (!r) return;
      t.style.fontSize = '';
      var bb = r.getBBox();
      var w = bb.width - 6, tw = t.getBBox().width, fs = 14;
      if (tw > w) fs = Math.max(8, Math.floor(14 * w / tw));
      if (fs > bb.height * 0.6) fs = Math.max(8, Math.floor(bb.height * 0.6));
      if (fs !== 14) t.style.fontSize = fs + 'px';
    });
  }
  function moveTitles() {
    [].forEach.call(box.querySelectorAll('title'), function (ti) {
      ti.parentNode.setAttribute('data-tip', ti.textContent);
      ti.remove();
    });
  }
  function afterRender() {
    moveTitles();
    fitLabels();
    applyZoom();
  }

  /* ---- легенда: значки без подписей, название — в подсказке ---- */
  function fixLegend() {
    if (!legend) return;
    var first = legend.querySelector('li[data-mark]');
    var br = legend.querySelector('.dlegend__br');
    if (first && (!br || br.nextElementSibling !== first)) {
      if (br) br.remove();
      br = document.createElement('li');
      br.className = 'dlegend__br';
      br.setAttribute('aria-hidden', 'true');
      legend.insertBefore(br, first);
    }
    [].forEach.call(legend.querySelectorAll('li[data-mark]'), function (li) {
      if (li.hasAttribute('data-tip')) return;
      var name = li.textContent.trim();
      li.setAttribute('data-tip', name);
      li.setAttribute('aria-label', name);
    });
  }

  /* ---- карточка секции: без статусов, ссылки на дизайн-страницы ---- */
  var fixing = false;
  function fixRoom() {
    if (fixing || !body) return;
    fixing = true;
    var name = body.querySelector('.room__name');
    if (name && /не привязан/.test(name.textContent)) {
      var fl = page.querySelector('.floors__tab.is-active b');
      body.innerHTML = '<p class="room__name">Магазин уточняется</p>' +
        '<p class="room__place">' + (fl ? fl.textContent : '') + ' этаж</p>' +
        '<a href="design-shops.html" class="btn btn--ghost btn--full">Все магазины</a>';
    }
    [].forEach.call(body.querySelectorAll('a[href]'), function (a) {
      var h = a.getAttribute('href');
      if (/^(shop|shops|rent)\.html/.test(h)) a.setAttribute('href', 'design-' + h);
    });
    fixing = false;
    focusRoom();
  }

  /* ---- масштаб ---- */
  var LEVELS = [1, 1.5, 2, 2.5, 3];
  var z = matchMedia('(max-width:760px)').matches ? 2.5 : 1;
  var wrap = document.createElement('div');
  wrap.className = 'dplanwrap';
  box.parentNode.insertBefore(wrap, box);
  wrap.appendChild(box);
  var zoom = document.createElement('div');
  zoom.className = 'dzoom';
  zoom.innerHTML = '<button type="button" data-z="1" aria-label="Приблизить">+</button>' +
    '<button type="button" data-z="-1" aria-label="Отдалить">−</button>';
  wrap.appendChild(zoom);
  function applyZoom() {
    var svg = box.querySelector('svg');
    if (!svg) return;
    svg.style.width = z === 1 ? '' : (z * 100) + '%';
    svg.style.height = z === 1 ? '' : 'auto';
    box.classList.toggle('is-zoomed', z > 1);
    zoom.querySelector('[data-z="1"]').disabled = z === LEVELS[LEVELS.length - 1];
    zoom.querySelector('[data-z="-1"]').disabled = z === LEVELS[0];
  }
  zoom.addEventListener('click', function (e) {
    var b = e.target.closest('[data-z]');
    if (!b) return;
    /* центр видимой части сохраняем */
    var cx = (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth;
    var cy = (box.scrollTop + box.clientHeight / 2) / box.scrollHeight;
    var i = LEVELS.indexOf(z) + (+b.dataset.z);
    z = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, i))];
    applyZoom();
    box.scrollLeft = cx * box.scrollWidth - box.clientWidth / 2;
    box.scrollTop = cy * box.scrollHeight - box.clientHeight / 2;
  });

  /* выбранная секция — в видимую часть плана; при загрузке — середина этажа */
  function focusRoom() {
    var r = box.querySelector('.pl-room--here');
    if (!r || box.scrollWidth <= box.clientWidth + 2) return;
    var br = box.getBoundingClientRect(), rr = r.getBoundingClientRect();
    box.scrollLeft += rr.left + rr.width / 2 - (br.left + br.width / 2);
    box.scrollTop += rr.top + rr.height / 2 - (br.top + br.height / 2);
  }

  /* то же поле фильтрует список этажа: название или номер секции.
     Поиск может переключить этаж — список перерисуется, фильтр применяем заново */
  if (listEl && searchInput) {
    var none = document.createElement('p');
    none.className = 'dfloorlist__none';
    none.textContent = 'На этом этаже не найдено';
    none.hidden = true;
    listEl.parentNode.insertBefore(none, listEl.nextSibling);
    var filterList = function () {
      var v = searchInput.value.trim().toLowerCase(), n = 0;
      [].forEach.call(listEl.querySelectorAll('li'), function (li) {
        var ok = !v || li.textContent.toLowerCase().indexOf(v) > -1;
        li.hidden = !ok;
        if (ok) n++;
      });
      none.hidden = !v || n > 0;
      findPanel.classList.toggle('has-q', !!v);
    };
    searchInput.addEventListener('input', function () { setTimeout(filterList, 0); });
    new MutationObserver(filterList).observe(listEl, { childList: true });
  }

  new MutationObserver(afterRender).observe(box, { childList: true });
  if (legend) new MutationObserver(fixLegend).observe(legend, { childList: true });
  if (body) new MutationObserver(fixRoom).observe(body, { childList: true });
  afterRender();
  fixLegend();
  fixRoom();
  if (!box.querySelector('.pl-room--here')) box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
})();

/* ---------- сортировка каталога на телефоне — квадратом справа от «Фильтров» ----------
   До 1000px строка с сортировкой над карточками скрыта; рядом с кнопкой
   «Фильтры» — квадратная кнопка, по нажатию список вариантов в стиле сайта.
   Выбор меняет тот же select — сортирует по-прежнему catalog.js */
(function () {
  var sel = document.getElementById('sortSelect');
  var tog = document.getElementById('filtersToggle');
  if (!sel || !tog) return;
  var row = document.createElement('div');
  row.className = 'dfilt-row';
  tog.parentNode.insertBefore(row, tog);
  row.appendChild(tog);
  var box = document.createElement('div');
  box.className = 'dsortbtn';
  box.innerHTML = '<button type="button" class="dsortbtn__b" aria-haspopup="listbox" aria-expanded="false" aria-label="Сортировка"><span class="dsortbtn__ic" aria-hidden="true"></span></button>' +
    '<ul class="dd__list" role="listbox" hidden></ul>';
  row.appendChild(box);
  var btn = box.querySelector('button'), list = box.querySelector('ul');
  function build() {
    list.innerHTML = '';
    [].forEach.call(sel.options, function (o, i) {
      var li = document.createElement('li');
      li.className = 'dd__opt' + (i === sel.selectedIndex ? ' is-sel' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false');
      li.dataset.i = i;
      li.textContent = o.textContent;
      list.appendChild(li);
    });
  }
  function open(v) {
    if (v) build();
    list.hidden = !v;
    box.classList.toggle('is-open', v);
    btn.setAttribute('aria-expanded', String(v));
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); open(list.hidden); });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('.dd__opt');
    if (!li) return;
    sel.selectedIndex = +li.dataset.i;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    open(false);
  });
  document.addEventListener('click', function (e) { if (!box.contains(e.target)) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !list.hidden) { open(false); btn.focus(); } });
})();

/* ---------- переключатель вида каталога: иконки на одной линии ----------
   Сегменты равной ширины, а подписи разной длины: при центровке каждого
   сегмента иконки стояли на разном расстоянии от края («прыгали»).
   Содержимое ставим по левому краю с общим отступом — по самой длинной подписи */
(function () {
  var lists = [].slice.call(document.querySelectorAll('.dviews'));
  if (!lists.length) return;
  function fit(ul) {
    var items = [].slice.call(ul.querySelectorAll('.dviews__item'));
    items.forEach(function (a) { a.style.paddingLeft = a.style.paddingRight = a.style.justifyContent = ''; });
    var max = 0;
    items.forEach(function (a) {
      var ic = a.querySelector('.dviews__ic');
      var lab = [].filter.call(a.querySelectorAll('.dviews__full, .dviews__short'), function (x) { return getComputedStyle(x).display !== 'none'; })[0];
      if (!lab) return;
      var l = ic && getComputedStyle(ic).display !== 'none' ? ic.getBoundingClientRect().left : lab.getBoundingClientRect().left;
      max = Math.max(max, lab.getBoundingClientRect().right - l);
    });
    var w = items[0].getBoundingClientRect().width;
    var pad = Math.max(4, Math.floor((w - max) / 2));
    items.forEach(function (a) {
      a.style.justifyContent = 'flex-start';
      /* правый отступ тот же: ширину сегментов (1fr) задаёт самая длинная подпись */
      a.style.paddingLeft = a.style.paddingRight = pad + 'px';
    });
  }
  function all() { lists.forEach(fit); }
  all();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(all, 100); });
})();

/* ---------- ширина полосы прокрутки ----------
   Кадры «до правого края» считаются от 100vw, а в Windows 100vw включает
   полосу прокрутки (17px) — страница уезжала вбок. --sbw вычитается в CSS */
(function () {
  function upd() {
    document.documentElement.style.setProperty('--sbw', (window.innerWidth - document.documentElement.clientWidth) + 'px');
  }
  upd();
  window.addEventListener('resize', upd);
  window.addEventListener('load', upd);
})();

/* ---------- топ-акции: слайдер над списком ----------
   Наплыв раз в 7 секунд; пауза при наведении, фокусе внутри и когда
   вкладка скрыта. Свайп на телефоне. Без reduce-motion — без автосмены. */
(function () {
  var box = document.getElementById('promoTop');
  if (!box) return;
  var slides = [].slice.call(box.querySelectorAll('.ptop__slide'));
  var root = box.closest('.ptop');   /* навигация — под плашкой, вне box */
  var bars = [].slice.call(root.querySelectorAll('.ptop__bars i'));
  var cur = root.querySelector('.ptop__cur');
  var n = slides.length, i = 0, T = 7000, timer = null, left = T, started = 0;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.style.setProperty('--ptop-t', T / 1000 + 's');
  if (n < 2) { root.querySelector('.ptop__nav').hidden = true; return; }

  function pad(k) { return (k < 10 ? '0' : '') + k; }
  function go(k) {
    i = (k + n) % n;
    slides.forEach(function (s, j) {
      var on = j === i;
      s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      /* ссылки скрытых слайдов не должны ловить Tab */
      [].forEach.call(s.querySelectorAll('.ptop__text a'), function (a) { a.tabIndex = on ? 0 : -1; });
    });
    bars.forEach(function (b, j) {
      b.classList.remove('is-run');
      b.classList.toggle('is-done', j < i);
    });
    cur.textContent = pad(i + 1);
    restart();
  }
  function restart() {
    clearTimeout(timer); left = T;
    if (still) return;
    var b = bars[i];
    if (b) { void b.offsetWidth; b.classList.add('is-run'); }
    if (!root.classList.contains('is-paused')) run();
  }
  function run() { started = Date.now(); clearTimeout(timer); timer = setTimeout(function () { go(i + 1); }, left); }
  function pause() {
    if (root.classList.contains('is-paused')) return;
    root.classList.add('is-paused'); clearTimeout(timer); left -= Date.now() - started;
  }
  function resume() {
    if (root.matches(':hover') || root.contains(document.activeElement) || document.hidden) return;
    root.classList.remove('is-paused'); if (!still) run();
  }

  root.querySelector('.ptop__arr--prev').addEventListener('click', function () { go(i - 1); });
  root.querySelector('.ptop__arr--next').addEventListener('click', function () { go(i + 1); });
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', function () { setTimeout(resume, 0); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else resume(); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(i - 1); } else if (e.key === 'ArrowRight') { go(i + 1); }
  });

  var x0 = null, y0 = 0;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? i + 1 : i - 1);
  }, { passive: true });

  go(0);
})();
