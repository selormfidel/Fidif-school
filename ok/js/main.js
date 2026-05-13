/* =========================================================
   Fidif School Complex — Main JS
========================================================= */

(function () {
  'use strict';

  // ---------- Theme toggle ----------
  const root = document.documentElement;
  const stored = localStorage.getItem('fidif-theme');
  if (stored) root.setAttribute('data-theme', stored);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) { root.removeAttribute('data-theme'); localStorage.setItem('fidif-theme', 'light'); }
    else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('fidif-theme', 'dark'); }
  });

  // ---------- Mobile nav ----------
  document.addEventListener('click', (e) => {
    const burger = e.target.closest('.hamburger');
    if (burger) {
      const links = document.querySelector('.nav-links');
      burger.classList.toggle('active');
      links && links.classList.toggle('open');
      return;
    }
    if (e.target.closest('.nav-links a')) {
      const links = document.querySelector('.nav-links');
      const burger = document.querySelector('.hamburger');
      links && links.classList.remove('open');
      burger && burger.classList.remove('active');
    }
  });

  // ---------- Navbar shadow on scroll ----------
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    const top = document.querySelector('.float-top');
    if (top) {
      if (window.scrollY > 500) top.classList.add('visible');
      else top.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Scroll to top ----------
  document.addEventListener('click', (e) => {
    if (e.target.closest('.float-top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));

  // ---------- Counters ----------
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const duration = 1600;
      const start = performance.now();
      const animate = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = Number.isInteger(target) ? Math.round(value).toLocaleString() : value.toFixed(1);
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => counterObs.observe(c));

  // ---------- Testimonials carousel ----------
  const track = document.querySelector('.testimonial-track');
  if (track) {
    const slides = track.children;
    const dotsWrap = document.querySelector('.dots');
    let idx = 0;

    if (dotsWrap) {
      for (let i = 0; i < slides.length; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        b.addEventListener('click', () => go(i));
        dotsWrap.appendChild(b);
      }
    }
    const dots = dotsWrap ? dotsWrap.children : [];

    const go = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      track.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
      Array.from(dots).forEach((d, j) => d.classList.toggle('active', j === idx));
    };
    go(0);
    setInterval(() => go(idx + 1), 6500);
  }

  // ---------- Lightbox (works for image-grid + gallery) ----------
  const lb = document.querySelector('.lightbox');
  if (lb) {
    const lbImg = lb.querySelector('img');
    const items = Array.from(document.querySelectorAll('[data-lightbox] img'));
    let pos = 0;
    const open = (i) => { pos = i; lbImg.src = items[pos].src; lb.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };
    const next = () => { pos = (pos + 1) % items.length; lbImg.src = items[pos].src; };
    const prev = () => { pos = (pos - 1 + items.length) % items.length; lbImg.src = items[pos].src; };
    items.forEach((img, i) => img.parentElement.addEventListener('click', () => open(i)));
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-next').addEventListener('click', next);
    lb.querySelector('.lb-prev').addEventListener('click', prev);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  // ---------- Gallery filter ----------
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.gallery-item').forEach(item => {
        const cat = item.getAttribute('data-cat');
        item.classList.toggle('hidden', !(f === 'all' || f === cat));
      });
    });
  }

  // ---------- Active nav link by current page ----------
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // ---------- Contact form ----------
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = document.querySelector('.toast');
      if (toast) {
        toast.textContent = '✓ Message sent. We\'ll get back to you soon.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
      form.reset();
    });
  }

  // ---------- Footer year ----------
  const yr = document.querySelector('.year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
