/* ============================================================================
   Cornerstone Web Co. — main.js

   No dependencies, no framework. Roughly 3KB unminified. Everything here is an
   enhancement: if this file fails to load, the page still renders, reads, and
   navigates correctly.

   1. Footer year
   2. Header solid-state on scroll
   3. Mobile navigation
   4. Hero entrance
   5. Scroll reveal
   6. Hero parallax — the one motion moment
   ========================================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


  /* --------------------------------------------------------------------
     1. Footer year
     -------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* --------------------------------------------------------------------
     2. Header solid-state
     Watches a 1px sentinel pinned near the bottom of the hero instead of
     listening to scroll — the browser does the work off the main thread.
     -------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var hero = document.querySelector('.hero');

  if (header && hero && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;bottom:120px;left:0;width:1px;height:1px;pointer-events:none;';
    hero.appendChild(sentinel);

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  } else if (header) {
    header.classList.add('is-stuck');
  }


  /* --------------------------------------------------------------------
     3. Mobile navigation
     -------------------------------------------------------------------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on any in-page link so the anchor jump is actually visible.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    // Escape closes and returns focus to the toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    // If the viewport grows past the mobile breakpoint while the panel is
    // open, reset — otherwise body scroll stays locked on desktop.
    var wide = window.matchMedia('(min-width: 801px)');
    var onWide = function (e) { if (e.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }


  /* --------------------------------------------------------------------
     4. Hero entrance
     Waits for the hero image so the headline doesn't animate over an empty
     frame. Capped at 900ms so a slow image never holds the copy hostage.
     -------------------------------------------------------------------- */
  if (hero) {
    var started = false;
    var startHero = function () {
      if (started) return;
      started = true;
      requestAnimationFrame(function () { hero.classList.add('is-ready'); });
    };

    var heroImg = document.getElementById('heroImg');
    if (heroImg && !heroImg.complete) {
      heroImg.addEventListener('load', startHero, { once: true });
      heroImg.addEventListener('error', startHero, { once: true });
      setTimeout(startHero, 900);
    } else {
      startHero();
    }
  }


  /* --------------------------------------------------------------------
     5. Scroll reveal
     Elements carry .reveal in the markup but are only hidden when the .js
     class is present, so a JS failure leaves everything visible.
     -------------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) {
    // nothing to do
  } else if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in');
  } else {
    // Stagger siblings within the same container so a row arrives in sequence
    // rather than all at once. Cycles 0-3 to cap the total delay.
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentNode;
      var n = groups.get(parent) || 0;
      if (n > 0) el.setAttribute('data-delay', String(n % 4));
      groups.set(parent, n + 1);
    });

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target); // reveal once, then stop watching
      });
    }, {
      // Fires a little before the element reaches the fold, so the motion
      // finishes as it settles into view rather than starting there.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.05
    });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }


  /* --------------------------------------------------------------------
     6. Hero parallax — the one motion moment

     The hero photograph drifts slower than the page as you scroll off it.
     Deliberately the only scroll-linked effect on the site.

     Constrained on three counts:
       - skipped entirely under prefers-reduced-motion
       - desktop + fine pointer only (mobile address-bar resize makes
         scroll-linked transforms janky, and it isn't worth the battery)
       - stops updating once the hero has left the viewport
     Writes are batched into one rAF frame and touch only `transform`,
     so it stays on the compositor and never triggers layout.
     -------------------------------------------------------------------- */
  var heroImage = document.getElementById('heroImg');
  var canParallax =
    heroImage &&
    hero &&
    !reduceMotion.matches &&
    window.matchMedia('(min-width: 801px) and (pointer: fine)').matches;

  if (canParallax) {
    var ticking = false;
    var visible = true;
    var MAX_SHIFT = 90; // px the image travels across the full hero height

    var update = function () {
      ticking = false;
      var height = hero.offsetHeight || 1;
      // 0 at the top of the page → 1 when the hero is fully scrolled past.
      var progress = Math.min(Math.max(window.scrollY / height, 0), 1);
      heroImage.style.transform =
        'translate3d(0,' + (progress * MAX_SHIFT).toFixed(2) + 'px,0) scale(1.08)';
    };

    var onScroll = function () {
      if (ticking || !visible) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) onScroll();
      }, { threshold: 0 }).observe(hero);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

})();
