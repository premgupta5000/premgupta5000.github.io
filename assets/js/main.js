/* =============================================================
   Hotel Shera & Restaurant — interactions
   ============================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- loader ---------- */
  var loader = $('#loader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-done');
    document.body.classList.remove('is-locked');
    var t = $('.hero__title');
    if (t) t.classList.add('is-in');
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
  }
  document.body.classList.add('is-locked');
  window.addEventListener('load', function () { setTimeout(hideLoader, reduce ? 0 : 550); });
  setTimeout(hideLoader, 3500); // safety net if an asset stalls

  /* ---------- year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- header: solid + hide on scroll down ---------- */
  var nav = $('#nav');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 60);
    if (!$('#navLinks').classList.contains('is-open')) {
      nav.classList.toggle('is-hidden', y > 420 && y > lastY + 6);
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = $('#burger');
  var links  = $('#navLinks');
  function closeMenu() {
    links.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
  }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) closeMenu();
  });

  /* ---------- scroll reveal ---------- */
  var revealables = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero slideshow (lazy-loads each image, gradient stays as fallback) ---------- */
  var slides = $$('.hero__slide');
  var dotWrap = $('#heroDots');
  var heroIdx = 0;
  var heroTimer;

  slides.forEach(function (slide, i) {
    var src = slide.getAttribute('data-img');
    if (src) {
      var probe = new Image();
      probe.onload = function () { slide.style.backgroundImage = 'url("' + src + '"), ' + slide.style.getPropertyValue('--g'); };
      probe.src = src;
    }
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Show image ' + (i + 1));
    dot.className = i === 0 ? 'is-active' : '';
    dot.addEventListener('click', function () { goHero(i); restartHero(); });
    dotWrap.appendChild(dot);
  });

  function goHero(i) {
    heroIdx = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === heroIdx); });
    $$('button', dotWrap).forEach(function (d, n) {
      d.classList.toggle('is-active', n === heroIdx);
      d.setAttribute('aria-selected', String(n === heroIdx));
    });
  }
  function restartHero() {
    clearInterval(heroTimer);
    if (slides.length > 1 && !reduce) heroTimer = setInterval(function () { goHero(heroIdx + 1); }, 6500);
  }
  restartHero();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(heroTimer); else restartHero();
  });

  /* ---------- gallery lightbox ---------- */
  var gals = $$('.gal');
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var lbIdx = 0, lastFocus = null;

  lbImg.addEventListener('error', function () { lbImg.style.visibility = 'hidden'; });
  lbImg.addEventListener('load',  function () { lbImg.style.visibility = 'visible'; });

  function openLb(i) {
    lbIdx = (i + gals.length) % gals.length;
    var g = gals[lbIdx];
    lbImg.src = g.getAttribute('data-full');
    lbImg.alt = (g.querySelector('img') && g.querySelector('img').alt) || '';
    lbCap.textContent = (g.querySelector('.gal__cap') || {}).textContent || '';
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    $('#lbClose').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 340);
    if (lastFocus) lastFocus.focus();
  }
  gals.forEach(function (g, i) { g.addEventListener('click', function () { openLb(i); }); });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { openLb(lbIdx - 1); });
  $('#lbNext').addEventListener('click', function () { openLb(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbIdx + 1);
  });

  /* ---------- WhatsApp handoff ---------- */
  var WA_NUMBER = '918959999936';

  /* Opens a chat with the message written out. Returns false only when the popup
     was blocked and we had to send this tab there instead. */
  var openWhatsApp = function (lines) {
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    /* Passing 'noopener' in the features string makes window.open return null even
       when the tab did open, so sever the opener on the handle instead. */
    var win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (err) {} return true; }
    window.location.href = url;
    return false;
  };

  /* ---------- booking form ---------- */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

  var checkin = $('#checkin'), checkout = $('#checkout');
  var today = new Date();
  var tomorrow = new Date(today.getTime() + 86400000);
  var dayAfter = new Date(today.getTime() + 3 * 86400000);

  checkin.min = iso(today);
  checkin.value = iso(tomorrow);
  checkout.min = iso(dayAfter);
  checkout.value = iso(dayAfter);

  checkin.addEventListener('change', function () {
    var next = new Date(checkin.value);
    if (isNaN(next)) return;
    next.setDate(next.getDate() + 1);
    checkout.min = iso(next);
    if (!checkout.value || checkout.value <= checkin.value) checkout.value = iso(next);
  });

  var bookNote = $('#bookNote');

  /* "Sat, 4 Oct 2026" — spelled out by hand so the message reads the same everywhere */
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var pretty = function (value) {
    var d = new Date(value + 'T00:00:00');
    if (isNaN(d)) return value;
    return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  };

  $('#bookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    bookNote.classList.remove('is-err');
    if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
      bookNote.textContent = 'Please choose a departure date after your arrival.';
      bookNote.classList.add('is-err');
      return;
    }
    var nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / 86400000);
    var lines = [
      'Hi Hotel Shera, I would like to check room availability. My details are below.',
      '',
      'Check-in: ' + pretty(checkin.value),
      'Check-out: ' + pretty(checkout.value),
      'Nights: ' + nights,
      'Guests: ' + $('#guests').value,
      'Room type: ' + $('#rtype').value,
      '',
      'Please let me know the availability and tariff. Thank you.'
    ];
    if (!openWhatsApp(lines)) return;

    bookNote.textContent = 'Opening WhatsApp with your ' + nights + '-night request for ' +
      $('#guests').value.toLowerCase() + ' — send the message and we will confirm availability.';
  });

  /* ---------- contact form ---------- */
  var cForm = $('#contactForm'), status = $('#formStatus');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  cForm.addEventListener('submit', function (e) {
    e.preventDefault();
    status.classList.remove('is-err');
    var bad = [];
    $$('.field', cForm).forEach(function (f) { f.classList.remove('is-invalid'); });

    [['#cname', function (v) { return v.trim().length > 1; }],
     ['#cemail', function (v) { return emailRe.test(v.trim()); }],
     ['#cmsg', function (v) { return v.trim().length > 5; }]
    ].forEach(function (pair) {
      var input = $(pair[0]);
      if (!pair[1](input.value)) { input.closest('.field').classList.add('is-invalid'); bad.push(input); }
    });

    if (bad.length) {
      status.textContent = 'Please check the highlighted fields.';
      status.classList.add('is-err');
      bad[0].focus();
      return;
    }
    var phone = $('#cphone').value.trim();
    var lines = ['Hi Hotel Shera, I have a message from your website.', ''];
    lines.push('Name: ' + $('#cname').value.trim());
    lines.push('Email: ' + $('#cemail').value.trim());
    if (phone) lines.push('Phone: ' + phone);
    lines.push('About: ' + $('#csubject').value, '', $('#cmsg').value.trim());

    /* Deliberately no reset(): nothing has been sent until the guest presses send
       in WhatsApp, so their words stay on the page in case the handoff fails. */
    if (!openWhatsApp(lines)) return;
    status.textContent = 'Opening WhatsApp with your message — press send there and we will reply.';
  });

  /* ---------- newsletter ---------- */
  var newsForm = $('#newsForm'), newsStatus = $('#newsStatus'), newsEmail = $('#newsEmail');
  newsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!emailRe.test(newsEmail.value.trim())) {
      newsStatus.textContent = 'That email doesn’t look right.';
      newsEmail.focus();
      return;
    }
    newsStatus.textContent = 'Welcome to the Shera Letter.';
    newsForm.reset();
  });

  /* ---------- scrollspy ---------- */
  var spyLinks = $$('#navLinks a[href^="#"]').filter(function (a) { return a.getAttribute('href').length > 1; });
  var sections = spyLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }
})();
