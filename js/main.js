// ===== Mobile menu toggle =====
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  const closeBtn = menu.querySelector('.menu-close');
  let scrollY = 0;

  // Both buttons hold an inline SVG. Do NOT write to textContent here —
  // that would delete the icon.
  const setOpen = (isOpen) => {
    menu.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    // Locks the page behind the overlay. Restoring scrollTop is needed
    // because overflow:hidden on body drops the scroll position on iOS.
    if (isOpen) {
      scrollY = window.scrollY;
      document.body.classList.add('menu-open');
    } else if (document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      window.scrollTo(0, scrollY);
    }
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

  // Expandable "Case-studies" group. Pure show/hide — the CSS animates the
  // 0fr/1fr row, so nothing here needs to measure heights.
  const groupToggle = menu.querySelector('.menu-group-toggle');
  if (groupToggle) {
    groupToggle.addEventListener('click', () => {
      const isOpen = groupToggle.getAttribute('aria-expanded') === 'true';
      groupToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
  });

  // Edge swipe: drag right from the left edge to open, swipe left to close.
  // Only fires on touch, only from the outer 40px, and only when the gesture
  // is clearly horizontal — so it never fights vertical page scrolling.
  (function () {
    const EDGE = 40, DIST = 60, SLOPE = 1.2;
    let x0 = 0, y0 = 0, tracking = false;
    // Same breakpoint that shows the hamburger. Above it the overlay is not a
    // nav the user can otherwise reach, and the left edge belongs to the OS
    // back gesture on touch laptops and tablets.
    const isMobile = () => window.matchMedia('(max-width: 860px)').matches;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0];
      x0 = t.clientX; y0 = t.clientY;
      const isOpen = menu.classList.contains('open');
      tracking = isOpen || (isMobile() && x0 <= EDGE);
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) < DIST || Math.abs(dx) < Math.abs(dy) * SLOPE) return;
      const isOpen = menu.classList.contains('open');
      // Close stays ungated, so an open menu can always be dismissed.
      if (dx > 0 && !isOpen && isMobile()) setOpen(true);
      else if (dx < 0 && isOpen) setOpen(false);
    }, { passive: true });
  })();
}

// ===== Lightbox =====
// Each gallery group shares a data-gallery id. Images within a group are
// gathered in DOM order so the counter/title/arrows all stay in sync.
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const imgEl = lightbox.querySelector('.lightbox-img');
  const titleEl = lightbox.querySelector('.lightbox-title');
  const counterEl = lightbox.querySelector('.lightbox-counter');
  const dotsEl = lightbox.querySelector('.lightbox-dots');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  let currentGroup = [];
  let currentIndex = 0;

  function render() {
    const item = currentGroup[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.title;
    titleEl.textContent = item.title;

    // Don't let the lightbox upscale an image past its own real resolution --
    // stretching a small source file beyond its native pixels is what causes
    // the blurry/pixelated look. min() keeps it sharp AND still respects the
    // lightbox's own max-width/max-height container limits for large images.
    imgEl.style.width = '';
    imgEl.onload = () => {
      imgEl.style.width = `min(100%, ${imgEl.naturalWidth}px)`;
    };

    const multi = currentGroup.length > 1;
    counterEl.style.display = multi ? '' : 'none';
    dotsEl.style.display = multi ? '' : 'none';
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';

    if (multi) {
      counterEl.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
      dotsEl.innerHTML = '';
      currentGroup.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === currentIndex) dot.classList.add('active');
        dotsEl.appendChild(dot);
      });
    }
  }

  function open(group, index) {
    currentGroup = group;
    currentIndex = index;
    render();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + currentGroup.length) % currentGroup.length;
    render();
  }

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    const clickedContent = e.target.closest('.lightbox-body, .lightbox-meta, .lightbox-close');
    if (!clickedContent) close();
  });
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  // basic swipe support on mobile
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    touchStartX = null;
  });

  // wire up every [data-gallery] group on the page
  const groups = {};
  document.querySelectorAll('[data-gallery]').forEach(el => {
    const key = el.dataset.gallery;
    if (!groups[key]) groups[key] = [];
    groups[key].push({
      el,
      src: el.dataset.fullSrc || el.querySelector('img')?.src || '',
      title: el.dataset.title || ''
    });
  });

  Object.values(groups).forEach(group => {
    group.forEach((item, index) => {
      item.el.addEventListener('click', () => open(group, index));
      item.el.setAttribute('role', 'button');
      item.el.setAttribute('tabindex', '0');
      item.el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(group, index); }
      });
    });
  });
}

// ===== Contact form =====
// NOTE: this currently only simulates a submission. Wire `action` up to a
// real backend (Formspree, Netlify Forms, etc.) before relying on it.
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const nameField = form.querySelector('[name="name"]');
  const emailField = form.querySelector('[name="email"]');
  const messageField = form.querySelector('[name="message"]');

  const MESSAGES = {
    name: 'Name is required',
    email: 'Email address is required',
    message: 'Message is required'
  };

  function showError(field, text) {
    const wrap = field.closest('.field');
    wrap.classList.add('error');
    let msg = wrap.querySelector('.field-error');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'field-error';
      wrap.appendChild(msg);
    }
    msg.textContent = text;
  }
  function clearError(field) {
    const wrap = field.closest('.field');
    wrap.classList.remove('error');
    const msg = wrap.querySelector('.field-error');
    if (msg) msg.remove();
  }

  function validateField(field) {
    if (field === nameField) {
      if (!field.value.trim()) { showError(field, MESSAGES.name); return false; }
    } else if (field === emailField) {
      const isValidEmail = /\S+@\S+\.\S+/.test(field.value);
      if (!field.value.trim()) { showError(field, MESSAGES.email); return false; }
      if (!isValidEmail) { showError(field, 'Enter a valid email address'); return false; }
    } else if (field === messageField) {
      if (!field.value.trim()) { showError(field, MESSAGES.message); return false; }
    }
    clearError(field);
    return true;
  }

  [nameField, emailField, messageField].forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const wrap = field.closest('.field');
      if (wrap.classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameField.value.trim()) { showError(nameField, MESSAGES.name); valid = false; }
    else clearError(nameField);

    const isValidEmail = /\S+@\S+\.\S+/.test(emailField.value);
    if (!emailField.value.trim()) { showError(emailField, MESSAGES.email); valid = false; }
    else if (!isValidEmail) { showError(emailField, 'Enter a valid email address'); valid = false; }
    else clearError(emailField);

    if (!messageField.value.trim()) { showError(messageField, MESSAGES.message); valid = false; }
    else clearError(messageField);

    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';

    // simulated network delay -- replace with a real fetch() to your backend
    setTimeout(() => {
      form.style.display = 'none';
      status.className = 'form-status success show';
      status.innerHTML = '<h4>Message sent</h4><p>Thanks for reaching out \u2014 I\u2019ll get back to you soon.</p>';
    }, 900);
  });
}
// ===== Scroll reveal =====
// Fades/slides elements in as they enter the viewport. Purely additive --
// if IntersectionObserver isn't available for some reason, everything just
// stays visible (no broken/invisible content).
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.card, .img-group, .about-photo, .about-copy > *, .case-content > *'
  );
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  targets.forEach(el => el.classList.add('reveal'));
  if (reduceMotion) {
    targets.forEach(el => el.classList.add('reveal-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCountUp();
  initContactForm();
  initScrollReveal();
});


// ===== Count-up for percentages in Key results =====
// Wraps every number token in .key-results paragraphs, then counts each from
// 0 to its real value the first time the block scrolls into view.
function initCountUp() {
  const blocks = document.querySelectorAll('.card-metric');
  if (!blocks.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)(%?)/g;

  blocks.forEach((block) => {
    const targets = block.matches('.card-metric') ? [block] : block.querySelectorAll('p, h3');
    targets.forEach((el) => {
      if (el.querySelector('.count-up')) return;
      // Only touch text nodes, so nested markup (<strong>) survives.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        if (!NUM.test(node.nodeValue)) return;
        NUM.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0, m;
        while ((m = NUM.exec(node.nodeValue)) !== null) {
          if (m.index > last) frag.appendChild(document.createTextNode(node.nodeValue.slice(last, m.index)));
          const span = document.createElement('span');
          span.className = 'count-up';
          span.dataset.value = m[1].replace(/,/g, '');
          span.dataset.suffix = m[2] || '';
          span.dataset.decimals = (m[1].split('.')[1] || '').length;
          span.textContent = m[0];
          frag.appendChild(span);
          last = m.index + m[0].length;
        }
        if (last < node.nodeValue.length) frag.appendChild(document.createTextNode(node.nodeValue.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
    });
  });

  const format = (n, decimals) => {
    const s = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
    const parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const run = (span) => {
    const target = parseFloat(span.dataset.value);
    const decimals = parseInt(span.dataset.decimals, 10) || 0;
    const suffix = span.dataset.suffix;
    if (reduced || !isFinite(target)) { span.textContent = format(target, decimals) + suffix; return; }
    const dur = 1100;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      span.textContent = format(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    span.textContent = format(0, decimals) + suffix;
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.count-up').forEach(run);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll('.count-up').forEach(run);
      io.unobserve(en.target);
    });
  }, { threshold: 0.35 });
  blocks.forEach((b) => io.observe(b));
}


// ===== Start every page at the top =====
// html has scroll-behavior:smooth for in-page anchors, which also makes the
// browser's own restore animate. Pin to the top instantly on load instead.
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() {
    if (location.hash) return; // real in-page anchor, leave it alone
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    var s = document.scrollingElement || root;
    if (s) s.scrollTop = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { root.style.scrollBehavior = prev; });
  }
  toTop();
  document.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('load', toTop);
})();


// ===== Bound very tall screenshot strips =====
// Mobile-strip exports can render several screens tall inside one card. Cap
// those and add an explicit control, so nothing is hidden without a way back.
function initTallImages() {
  // Mobile-strip exports are extremely narrow for their height (375x4755 =
  // 12.7). Desktop full-page shots sit near 2.5. Anything past 4 is a strip.
  var STRIP_RATIO = 4;
  document.querySelectorAll('.img-group .thumb, .case-media .thumb').forEach(function (thumb) {
    var img = thumb.querySelector('img');
    if (!img) return;

    function apply() {
      var nh = img.naturalHeight, nw = img.naturalWidth;
      var tall = nw > 0 && (nh / nw) > STRIP_RATIO;
      if (!tall) {
        thumb.classList.remove('is-bounded', 'is-expanded');
        var stale = thumb.parentNode.querySelector('.thumb-expand');
        if (stale) stale.remove();
        return;
      }
      if (thumb.classList.contains('is-bounded')) return;
      thumb.classList.add('is-bounded');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb-expand';
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Show the full screen';
      btn.addEventListener('click', function () {
        var open = thumb.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Collapse' : 'Show the full screen';
        if (!open) {
          var top = thumb.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo(0, top);
        }
      });
      thumb.parentNode.insertBefore(btn, thumb.nextSibling);
    }

    if (img.complete && img.offsetHeight) apply();
    else img.addEventListener('load', apply, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', initTallImages);

