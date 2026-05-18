/* =========================================
   JORDAN — BEYOND THE HORIZON
   script.js — Premium Tourism Website
   ========================================= */

'use strict';

/* ---- SCROLL PROGRESS BAR ---- */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ---- NAVBAR: scroll-shrink + active link ---- */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateNavbar() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

window.addEventListener('scroll', () => {
  updateNavbar();
  updateActiveLink();
}, { passive: true });

updateNavbar();

/* ---- HAMBURGER MOBILE MENU ---- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobLinks = document.querySelectorAll('.mob-link');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---- SMOOTH SCROLL for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- INTERSECTION OBSERVER: reveal-block animations ---- */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal-block').forEach(el => revealObserver.observe(el));

/* ---- COUNTER ANIMATION ---- */
function animateCounter(el, target, duration = 1800) {
  const suffix = el.nextElementSibling?.classList.contains('stat-suffix')
    ? el.nextElementSibling
    : el.parentElement.querySelector('.city-stat-suf');
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = isDecimal
      ? (ease * target).toFixed(1)
      : Math.floor(ease * target);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

// Hero stat counters
const heroStats = document.querySelectorAll('.hero-stat .stat-num');
const cityStats = document.querySelectorAll('.city-stat-num.counter');

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

heroStats.forEach(el => counterObserver.observe(el));
cityStats.forEach(el => counterObserver.observe(el));

/* ---- PARALLAX: fullscreen background layers ---- */
const parallaxEls = document.querySelectorAll('.parallax-bg');

function updateParallax() {
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 0.3;
    const rect = el.parentElement.getBoundingClientRect();
    const offset = -(rect.top * speed);
    el.style.transform = `translateY(${offset}px)`;
  });
}

window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

/* ---- HERO LAYER PARALLAX ---- */
const heroLayers = document.querySelectorAll('.hero-bg-layer');
function updateHeroParallax() {
  const scrollY = window.scrollY;
  heroLayers.forEach((layer, i) => {
    const speed = (i + 1) * 0.06;
    layer.style.transform = `translateY(${scrollY * speed}px)`;
  });
}
window.addEventListener('scroll', updateHeroParallax, { passive: true });

/* ---- 3D TILT EFFECT on hover ---- */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 6;
      const rotY = dx * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

initTiltCards();

/* ---- FOOD SECTION: drag-to-scroll ---- */
const foodScroll = document.getElementById('food-scroll');
if (foodScroll) {
  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let velocity = 0;
  let lastX = 0;
  let animFrame;

  foodScroll.addEventListener('mousedown', e => {
    isDown = true;
    foodScroll.classList.add('grabbing');
    startX = e.pageX - foodScroll.offsetLeft;
    scrollLeftStart = foodScroll.scrollLeft;
    lastX = e.pageX;
    velocity = 0;
    cancelAnimationFrame(animFrame);
  });

  foodScroll.addEventListener('mouseleave', () => {
    if (!isDown) return;
    isDown = false;
    foodScroll.classList.remove('grabbing');
    startMomentum();
  });

  foodScroll.addEventListener('mouseup', () => {
    isDown = false;
    foodScroll.classList.remove('grabbing');
    startMomentum();
  });

  foodScroll.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - foodScroll.offsetLeft;
    const walk = (x - startX) * 1.4;
    velocity = e.pageX - lastX;
    lastX = e.pageX;
    foodScroll.scrollLeft = scrollLeftStart - walk;
  });

  // Touch support
  let touchStartX = 0;
  let touchScrollLeft = 0;
  foodScroll.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = foodScroll.scrollLeft;
    velocity = 0;
    cancelAnimationFrame(animFrame);
  }, { passive: true });

  foodScroll.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    velocity = -(e.touches[0].pageX - touchStartX);
    foodScroll.scrollLeft = touchScrollLeft + dx;
  }, { passive: true });

  foodScroll.addEventListener('touchend', startMomentum, { passive: true });

  function startMomentum() {
    cancelAnimationFrame(animFrame);
    function step() {
      if (Math.abs(velocity) < 0.5) return;
      foodScroll.scrollLeft += velocity * 0.85;
      velocity *= 0.85;
      animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
  }
}

/* ---- MAP: tooltip on pin hover ---- */
const mapPins = document.querySelectorAll('.map-pin');
const mapTooltip = document.getElementById('map-tooltip');

if (mapTooltip) {
  const cityData = {
    Amman:    { desc: 'Jordan\'s vibrant capital — ancient hills meet modern life' },
    Petra:    { desc: 'The Rose-Red City, carved 2000 years ago by the Nabataeans' },
    'Wadi Rum': { desc: 'Valley of the Moon — otherworldly desert landscapes' },
    'Dead Sea': { desc: 'Lowest point on Earth — float effortlessly in salty waters' },
    Jerash:   { desc: 'One of the best-preserved Roman cities in the world' },
    Aqaba:    { desc: 'Jordan\'s window to the Red Sea — world-class diving' },
  };

  mapPins.forEach(pin => {
    pin.addEventListener('mouseenter', e => {
      const city = pin.dataset.city;
      const data = cityData[city] || {};
      mapTooltip.innerHTML = `<strong>${city}</strong><p>${data.desc || ''}</p>`;
      mapTooltip.classList.add('visible');
    });

    pin.addEventListener('mousemove', e => {
      const rect = pin.closest('svg')?.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
      mapTooltip.style.left = (e.clientX - rect.left + 14) + 'px';
      mapTooltip.style.top  = (e.clientY - rect.top  - 10) + 'px';
    });

    pin.addEventListener('mouseleave', () => {
      mapTooltip.classList.remove('visible');
    });
  });
}

/* ---- NAV CTA: scroll to footer ---- */
const navCta = document.querySelector('.nav-cta');
if (navCta) {
  navCta.addEventListener('click', () => {
    const footer = document.getElementById('footer');
    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---- SECTION TAG: staggered letter reveal on intersection ---- */
function initRevealLetters() {
  document.querySelectorAll('.reveal-letter').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((char, i) =>
      `<span style="display:inline-block;opacity:0;transform:translateY(20px);
       animation:none;transition:opacity 0.4s ${i * 0.04}s, transform 0.4s ${i * 0.04}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('span').forEach(span => {
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    obs.observe(el);
  });
}

initRevealLetters();

/* ---- CULTURE QUOTE: fade-in on scroll ---- */
const cultureQuote = document.querySelector('.culture-quote');
if (cultureQuote) {
  cultureQuote.style.opacity = '0';
  cultureQuote.style.transform = 'translateY(20px)';
  cultureQuote.style.transition = 'opacity 0.8s 0.3s, transform 0.8s 0.3s';

  const qObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cultureQuote.style.opacity = '1';
      cultureQuote.style.transform = 'translateY(0)';
      qObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  qObs.observe(cultureQuote);
}

/* ---- FLOATING BADGES: pop-in animation ---- */
document.querySelectorAll('.floating-badge').forEach((badge, i) => {
  badge.style.opacity = '0';
  badge.style.transform = 'scale(0.7) translateY(10px)';
  badge.style.transition = `opacity 0.6s ${0.3 + i * 0.15}s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s ${0.3 + i * 0.15}s cubic-bezier(0.34,1.56,0.64,1)`;

  const bObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      badge.style.opacity = '1';
      badge.style.transform = 'scale(1) translateY(0)';
      bObs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  bObs.observe(badge);
});

/* ---- FACT PILLS: staggered reveal ---- */
document.querySelectorAll('.landmark-facts').forEach(container => {
  const pills = container.querySelectorAll('.fact-pill');
  pills.forEach((pill, i) => {
    pill.style.opacity = '0';
    pill.style.transform = 'translateX(-12px)';
    pill.style.transition = `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`;
  });

  const pObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      pills.forEach(pill => {
        pill.style.opacity = '1';
        pill.style.transform = 'translateX(0)';
      });
      pObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  pObs.observe(container);
});

/* ---- EXP CARDS: stagger on scroll ---- */
document.querySelectorAll('.exp-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `opacity 0.6s ${i * 0.12}s, transform 0.6s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1)`;

  const eObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      eObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  eObs.observe(card);
});

/* ---- FOOTER: social icon pop-in ---- */
document.querySelectorAll('.social-icon').forEach((icon, i) => {
  icon.style.opacity = '0';
  icon.style.transform = 'translateY(10px)';
  icon.style.transition = `opacity 0.4s ${i * 0.08}s, transform 0.4s ${i * 0.08}s`;

  const sObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      icon.style.opacity = '1';
      icon.style.transform = 'translateY(0)';
      sObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  sObs.observe(icon);
});

/* ---- FOOTER LINKS: stagger reveal ---- */
document.querySelectorAll('.footer-col li').forEach((li, i) => {
  li.style.opacity = '0';
  li.style.transform = 'translateX(-8px)';
  li.style.transition = `opacity 0.4s ${i * 0.07}s, transform 0.4s ${i * 0.07}s`;

  const fObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      li.style.opacity = '1';
      li.style.transform = 'translateX(0)';
      fObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  fObs.observe(li);
});

/* ---- TIMELINE DOTS: pulse ring on scroll ---- */
document.querySelectorAll('.timeline-dot').forEach(dot => {
  const ring = document.createElement('div');
  ring.style.cssText = `
    position:absolute; width:28px; height:28px;
    border-radius:50%; border:1px solid var(--gold);
    top:50%; left:50%; transform:translate(-50%,-50%) scale(0);
    opacity:0; pointer-events:none;
    transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s;
  `;
  dot.style.position = 'relative';
  dot.appendChild(ring);

  const dObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        ring.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.opacity = '0.5';
      }, 300);
      dObs.unobserve(entry.target);
    });
  }, { threshold: 0.8 });

  dObs.observe(dot);
});

/* ---- MOSAIC ITEMS: subtle rotate-in ---- */
document.querySelectorAll('.mosaic-item').forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'scale(0.94) translateY(20px)';
  item.style.transition = `opacity 0.7s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1)`;

  const mObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      item.style.opacity = '1';
      item.style.transform = 'scale(1) translateY(0)';
      mObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  mObs.observe(item);
});

/* ---- SECTION: background parallax glow follow mouse ---- */
const petra = document.getElementById('petra');
if (petra) {
  petra.addEventListener('mousemove', e => {
    const rect = petra.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    petra.style.setProperty('--glow-x', x + '%');
    petra.style.setProperty('--glow-y', y + '%');
  });
}

/* ---- FOOD CARDS: auto-scroll hint (once) ---- */
const foodTrack = document.querySelector('.food-scroll-track');
if (foodTrack && foodScroll) {
  const hintObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Gentle auto-nudge to signal draggability
      let start = null;
      const distance = 80;
      function nudge(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 600, 1);
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        foodScroll.scrollLeft = ease * distance * (p < 1 ? 1 : 0);
        if (p < 1) requestAnimationFrame(nudge);
        else {
          // Bounce back
          let s2 = null;
          function bounce(ts2) {
            if (!s2) s2 = ts2;
            const p2 = Math.min((ts2 - s2) / 400, 1);
            foodScroll.scrollLeft = distance * (1 - p2);
            if (p2 < 1) requestAnimationFrame(bounce);
          }
          requestAnimationFrame(bounce);
        }
      }
      setTimeout(() => requestAnimationFrame(nudge), 600);
      hintObs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  hintObs.observe(foodTrack);
}

/* ---- INIT ---- */
updateActiveLink();
console.log('%c🇯🇴 Jordan — Beyond the Horizon', 'color:#c9a84c;font-size:16px;font-weight:bold;');