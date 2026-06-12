(function() {
  'use strict';

  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  document.body.classList.add('loading');
  // Save scroll position and block scrolling
  const scrollY = window.scrollY;
  function hidePreloader() {
    if (preloader) {
      preloader.classList.add('hide');
      document.body.classList.remove('loading');
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      window.scrollTo(0, 0);
      setTimeout(() => preloader.remove(), 400);
    }
  }
  window.addEventListener('load', () => setTimeout(hidePreloader, 300));
  setTimeout(hidePreloader, 2500);

  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ===== SCROLL ANIMATIONS (CYCLIC) =====
  function initAnimations() {
    const animElements = document.querySelectorAll('.anim');
    if (!animElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-show');
        } else {
          entry.target.classList.remove('anim-show');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animElements.forEach(el => observer.observe(el));
  }

  // ===== COUNTER ANIMATION =====
  function initCounters() {
    // Hero counters — start immediately after DOM ready
    const heroCounters = document.querySelectorAll('.hero-stat-number .counter');
    if (heroCounters.length) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.animated) return; // prevent re-animation
            el.dataset.animated = '1';
            const target = parseInt(el.dataset.target) || 0;
            animateCounter(el, target, 1500);
          }
        });
      }, { threshold: 0.1 });
      heroCounters.forEach(el => heroObserver.observe(el));
    }

    // Section counters (scroll-triggered, cyclic)
    const scrollCounters = document.querySelectorAll('.counter-scroll');
    if (scrollCounters.length) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (el.dataset.animated) return; // prevent re-animation while visible
            el.dataset.animated = '1';
            const target = parseInt(el.dataset.target) || 0;
            animateCounter(el, target, 1200);
          } else {
            el.textContent = '0';
            el.dataset.animated = '';
          }
        });
      }, { threshold: 0.2 });
      scrollCounters.forEach(el => counterObserver.observe(el));
    }
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      if (target >= 1000) {
        el.textContent = current.toLocaleString('ru-RU');
      } else {
        el.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ===== CATALOG FILTERS =====
  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.tour-card');
    const grid = document.getElementById('catalogGrid');

    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        cards.forEach(card => {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
        });

        setTimeout(() => {
          let visibleCount = 0;
          cards.forEach(card => {
            const category = card.dataset.category;
            const show = filter === 'all' || category === filter;

            card.style.display = show ? '' : 'none';
            if (show) {
              visibleCount++;
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, visibleCount * 60);
            }
          });

          let noResults = grid ? grid.querySelector('.no-results') : null;
          if (visibleCount === 0 && grid) {
            if (!noResults) {
              noResults = document.createElement('div');
              noResults.className = 'no-results';
              noResults.innerHTML = 'Туры не найдены. Попробуйте другой фильтр.';
              grid.appendChild(noResults);
            }
          } else if (noResults) {
            noResults.remove();
          }
        }, 250);
      });
    });
  }

  // ===== CONTACT FORM =====
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Заявка отправлена! Мы свяжемся с вами в течение 30 минут.', 'success');
      form.reset();
    });
  }

  // ===== TOAST =====
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ===== TOUR PAGE DYNAMIC CONTENT =====
  function initTourPage() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');
    if (!tourId) return;

    const tours = {
      bali: {
        title: 'Бали', badge: 'Хит сезона', location: 'Индонезия',
        nights: '10 ночей / 11 дней', temp: '+28°C', rating: '4.9 / 5.0',
        price: '89 900', hotel: '4-5 звёзд', meal: 'Завтрак + ужин',
        departure: '20 июня 2026',
        heroImg: 'images/bali.jpg',
        gallery: [
          'images/bali.jpg',
          'images/thailand.jpg',
          'images/maldives.jpg',
          'images/turkey.jpg'
        ],
        description: [
          'Бали — остров богов, где древние храмы соседствуют с тропическими джунглями и бескрайними рисовыми террасами. Это место силы и вдохновения, куда возвращаются снова и снова.',
          'Здесь вы найдёте всё: серфинг на рассвете, медитации в храмах, прогулки по джунглям с водопадами, и конечно — потрясающие пляжи с чёрным и белым песком.',
          'Мы предлагаем проживание в лучших отелях Убуда и Семиньяка, экскурсии на вулкан Батур, в храм Танах Лот и на рисовые террасы Тегаллаланг.'
        ],
        program: [
          '<strong>День 1:</strong> Прилёт в Денпасар, трансфер в отель. Приветственный ужин с видом на закат.',
          '<strong>Дни 2-4:</strong> Свободное время. Пляжный отдых, серфинг, SPA. По желанию — экскурсия на вулкан Батур на рассвете.',
          '<strong>Дни 5-7:</strong> Переезд в Убуд — культурную столицу Бали. Рисовые террасы, храмы, традиционные церемонии.',
          '<strong>Дни 8-10:</strong> Возвращение на побережье. Водные развлечения, шоппинг, прощальный ужин на пляже.'
        ]
      },
      maldives: {
        title: 'Мальдивы', badge: 'Премиум', location: 'Мальдивская Республика',
        nights: '7 ночей / 8 дней', temp: '+30°C', rating: '5.0 / 5.0',
        price: '149 900', hotel: '5 звёзд', meal: 'Полный пансион',
        departure: '15 июня 2026',
        heroImg: 'images/maldives.jpg',
        gallery: [
          'images/maldives.jpg',
          'images/bali.jpg',
          'images/thailand.jpg',
          'images/turkey.jpg'
        ],
        description: [
          'Мальдивы — это архипелаг из 1190 коралловых островов в Индийском океане. Кристально чистая вода, белоснежные пляжи и роскошные виллы на воде создают атмосферу абсолютного рая на земле.',
          'Каждый остров-курорт — это отдельный мир с уникальной атмосферой. Здесь нет суеты мегаполисов, только шум прибоя и шёпот пальм. Подводный мир Мальдив поражает разнообразием.',
          'Идеальное место для медового месяца, романтического путешествия или просто незабываемого отпуска.'
        ],
        program: [
          '<strong>День 1:</strong> Прилёт в Мале, трансфер на катере. Размещение в вилле на воде.',
          '<strong>Дни 2-5:</strong> Пляжный отдых, снорклинг на домашнем рифе, SPA-процедуры, водные виды спорта.',
          '<strong>День 6:</strong> Экскурсия на местный остров — знакомство с мальдивской культурой.',
          '<strong>День 7:</strong> Последний день на острове. Трансфер в аэропорт.'
        ]
      },
      dubai: {
        title: 'Дубай', badge: 'Шик и роскошь', location: 'ОАЭ',
        nights: '5 ночей / 6 дней', temp: '+33°C', rating: '4.8 / 5.0',
        price: '74 900', hotel: '5 звёзд', meal: 'Завтрак',
        departure: '10 июня 2026',
        heroImg: 'images/dubai.jpg',
        gallery: [
          'images/dubai.jpg',
          'images/maldives.jpg',
          'images/bali.jpg',
          'images/thailand.jpg'
        ],
        description: [
          'Дубай — город будущего, где ультрасовременные небоскрёбы соседствуют с традиционными восточными базарами. Один из самых безопасных и гостеприимных мегаполисов мира.',
          'Бурдж-Халифа, Пальма Джумейра, золотой рынок и бесконечные торговые центры. А ещё — пустынное сафари на джипах и ужин под звёздами.',
          'Мы предлагаем проживание в отелях на первой линии JBR и Palm Jumeirah.'
        ],
        program: [
          '<strong>День 1:</strong> Прилёт, трансфер в отель. Вечером — прогулка по Dubai Marina.',
          '<strong>Дни 2-3:</strong> Бурдж-Халифа, Dubai Mall, шоу фонтанов. Круиз по заливу на дау.',
          '<strong>День 4:</strong> Пустынное сафари — гонки на джипах по дюнам, барбекю под звёздами.',
          '<strong>День 5:</strong> Свободный день. Пляж, SPA, золотой рынок.'
        ]
      },
      turkey: {
        title: 'Стамбул и Анталья', badge: 'Хит', location: 'Турция',
        nights: '7 ночей / 8 дней', temp: '+31°C', rating: '4.7 / 5.0',
        price: '54 900', hotel: '4-5 звёзд', meal: 'Всё включено',
        departure: '12 июня 2026',
        heroImg: 'images/turkey.jpg',
        gallery: [
          'images/turkey.jpg',
          'images/maldives.jpg',
          'images/bali.jpg',
          'images/dubai.jpg'
        ],
        description: [
          'Турция — идеальное сочетание восточной экзотики и европейского комфорта. Анталья порадует тёплым морем и отелями «всё включено», а Стамбул ошеломит архитектурой.',
          'Пляжи Средиземноморья, горные панорамы, аквапарки при отелях и знаменитый турецкий сервис.',
          'Комбинированные туры: 3 дня в Стамбуле + 4 дня в Анталье.'
        ],
        program: [
          '<strong>Дни 1-3:</strong> Стамбул — Голубая мечеть, Айя-София, Гранд-базар, круиз по Босфору.',
          '<strong>Дни 4-7:</strong> Анталья — пляжный отдых «всё включено», экскурсия в Памуккале.',
          '<strong>День 8:</strong> Трансфер в аэропорт, вылет.'
        ]
      },
      thailand: {
        title: 'Пхукет и Самуи', badge: 'Экзотика', location: 'Таиланд',
        nights: '12 ночей / 13 дней', temp: '+32°C', rating: '4.8 / 5.0',
        price: '97 900', hotel: '4-5 звёзд', meal: 'Завтрак',
        departure: '18 июня 2026',
        heroImg: 'images/thailand.jpg',
        gallery: [
          'images/thailand.jpg',
          'images/bali.jpg',
          'images/maldives.jpg',
          'images/turkey.jpg'
        ],
        description: [
          'Таиланд — страна улыбок, где древние храмы соседствуют с современными мегаполисами. Пхукет и Самуи — два жемчужных острова.',
          'Белоснежные пляжи, лазурная вода, экзотические фрукты, тайский массаж и знаменитая уличная еда.',
          'Комбинированный тур: 6 ночей на Пхукете + 6 ночей на Самуи.'
        ],
        program: [
          '<strong>Дни 1-6:</strong> Пхукет — пляжный отдых, острова Пхи-Пхи, ночные рынки.',
          '<strong>Дни 7-12:</strong> Самуи — расслабленный отдых, храм Большого Будды, водопады.',
          '<strong>День 13:</strong> Вылет в Москву.'
        ]
      },
      egypt: {
        title: 'Шарм-эль-Шейх', badge: 'Выгодно', location: 'Египет',
        nights: '7 ночей / 8 дней', temp: '+35°C', rating: '4.6 / 5.0',
        price: '42 900', hotel: '4-5 звёзд', meal: 'Всё включено',
        departure: '8 июня 2026',
        heroImg: 'images/egypt.jpg',
        gallery: [
          'images/egypt.jpg',
          'images/maldives.jpg',
          'images/dubai.jpg',
          'images/turkey.jpg'
        ],
        description: [
          'Шарм-эль-Шейх — жемчужина Красного моря, где круглый год светит солнце, а вода прозрачна до 40 метров. Одно из лучших мест для дайвинга.',
          'Коралловые рифы, тёплое море, отели «всё включено» и доступные цены.',
          'Прямые перелёты, проверенные отели на первой линии и бесплатные экскурсии в подарок.'
        ],
        program: [
          '<strong>Дни 1-5:</strong> Пляжный отдых «всё включено». Снорклинг, водные развлечения, SPA.',
          '<strong>День 6:</strong> Экскурсия в национальный парк Рас-Мохаммед.',
          '<strong>День 7:</strong> Свободный день. Шоппинг в Олд Маркете.'
        ]
      },
      srilanka: {
        title: 'Шри-Ланка', badge: 'Открытие', location: 'Шри-Ланка',
        nights: '10 ночей / 11 дней', temp: '+29°C', rating: '4.7 / 5.0',
        price: '78 900', hotel: '4-5 звёзд', meal: 'Завтрак + ужин',
        departure: '25 июня 2026',
        heroImg: 'https://images.unsplash.com/photo-1586613835341-52b442e0d8e1?w=1920&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1567606404338-3e061a4a3e25?w=600&q=80',
          'https://images.unsplash.com/photo-1590123575938-82dcecf10235?w=600&q=80',
          'https://images.unsplash.com/photo-1573788496867-5e2966efb8c0?w=600&q=80',
          'https://images.unsplash.com/photo-1585108447614-27771e8621f7?w=600&q=80'
        ],
        description: [
          'Шри-Ланка — тропический остров в Индийском океане, где чайные плантации переходят в джунгли, а древние буддийские храмы соседствуют с колониальными крепостями.',
          'Крепость Сигирия, священный город Канди, тропические пляжи Унаватуны и знаменитые чайные плантации.',
          'Комбинированные туры: экскурсии + пляжный отдых.'
        ],
        program: [
          '<strong>Дни 1-4:</strong> Сигирия, Дамбулла, Канди, чайная плантация.',
          '<strong>Дни 5-10:</strong> Пляжный отдых. Серфинг, черепаховая ферма, китовое сафари.',
          '<strong>День 11:</strong> Вылет в Москву.'
        ]
      }
    };

    const tour = tours[tourId];
    if (!tour) return;

    document.title = `${tour.title} — Солнечный Тур`;

    const heroImg = document.querySelector('.tour-hero img');
    const heroTitle = document.querySelector('.tour-hero-title');
    const heroBadge = document.querySelector('.tour-hero-badge');
    const heroMeta = document.querySelector('.tour-hero-meta');

    if (heroImg) heroImg.src = tour.heroImg;
    if (heroTitle) heroTitle.textContent = tour.title;
    if (heroBadge) {
      heroBadge.textContent = tour.badge;
      if (tour.badge === 'Хит' || tour.badge === 'Хит сезона') heroBadge.style.background = 'var(--red)';
    }
    if (heroMeta) {
      heroMeta.innerHTML = `
        <div class="tour-hero-meta-item"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;opacity:.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg> ${tour.location}</div>
        <div class="tour-hero-meta-item"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;opacity:.8"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg> ${tour.nights}</div>
        <div class="tour-hero-meta-item"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;opacity:.8"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM4 10.5H1v2h3zm9-9.95h-2V3.5h2zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5v2h3v-2zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41z"/></svg> ${tour.temp}</div>
        <div class="tour-hero-meta-item"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;opacity:.8"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ${tour.rating}</div>
      `;
    }

    // Sidebar
    const bookingPrice = document.querySelector('.tour-booking-price');
    if (bookingPrice) bookingPrice.innerHTML = `${tour.price} ₽ <span>/ чел</span>`;

    const bookingInfo = document.querySelector('.tour-booking-info');
    if (bookingInfo) {
      bookingInfo.innerHTML = `
        <div class="tour-booking-info-item"><span class="tour-booking-info-label">Длительность</span><span class="tour-booking-info-value">${tour.nights.split(' ')[0]} ночей</span></div>
        <div class="tour-booking-info-item"><span class="tour-booking-info-label">Питание</span><span class="tour-booking-info-value">${tour.meal}</span></div>
        <div class="tour-booking-info-item"><span class="tour-booking-info-label">Отель</span><span class="tour-booking-info-value">${tour.hotel}</span></div>
        <div class="tour-booking-info-item"><span class="tour-booking-info-label">Следующий вылет</span><span class="tour-booking-info-value">${tour.departure}</span></div>
      `;
    }

    // Description
    const tourSections = document.querySelectorAll('.tour-section');
    if (tourSections[0]) {
      const descEl = tourSections[0].querySelector('.tour-description');
      if (descEl) descEl.innerHTML = tour.description.map(p => `<p>${p}</p>`).join('');
    }

    // Gallery
    const gallery = document.querySelector('.tour-gallery');
    if (gallery && tour.gallery) {
      gallery.innerHTML = tour.gallery.map((img, i) =>
        `<div class="tour-gallery-img"><img src="${img}" alt="${tour.title} ${i+1}" loading="lazy"></div>`
      ).join('');
    }

    // Program
    if (tourSections[3]) {
      const progEl = tourSections[3].querySelector('.tour-description');
      if (progEl && tour.program) progEl.innerHTML = tour.program.map(p => `<p>${p}</p>`).join('');
    }
  }

  // ===== BOTTOM NAVIGATION ACTIVE STATE =====
  function initBottomNav() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const pageMap = {
      'index.html': 'home',
      'about.html': 'about',
      'catalog.html': 'catalog',
      'tour.html': 'catalog',
      'contacts.html': 'contacts'
    };

    bottomNavItems.forEach(item => {
      const page = item.dataset.page;
      if (pageMap[currentPage] === page) {
        item.classList.add('active');
      }
    });
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initCounters();
    initFilters();
    initContactForm();
    initTourPage();
    initBottomNav();
  });

})();
