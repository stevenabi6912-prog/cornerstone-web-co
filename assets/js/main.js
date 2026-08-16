/* ============================================================================
   Cornerstone Web Co. — main.js

   No dependencies, no framework, ~2KB. Everything here is an enhancement: if
   this file fails to load, the page still renders, reads, and navigates fine.

   1. Footer year
   2. Header shadow on scroll
   3. Mobile navigation
   4. Hero entrance
   5. Scroll reveal
   ========================================================================= */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     1. Footer year
     -------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* --------------------------------------------------------------------
     2. Header shadow
     Watches a 1px sentinel at the top of the page rather than listening to
     scroll, so the browser does the work off the main thread.
     -------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');

  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none;';
    document.body.appendChild(sentinel);

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
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
    var wide = window.matchMedia('(min-width: 821px)');
    var onWide = function (e) { if (e.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }


  /* --------------------------------------------------------------------
     4. Hero entrance
     Waits for the hero photograph so the copy doesn't animate in beside an
     empty frame. Capped at 900ms so a slow image never holds the text back.
     -------------------------------------------------------------------- */
  var hero = document.querySelector('.hero');

  if (hero) {
    var started = false;
    var startHero = function () {
      if (started) return;
      started = true;
      requestAnimationFrame(function () { hero.classList.add('is-ready'); });
    };

    var heroImg = hero.querySelector('.hero__media img');
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
    // Stagger siblings within the same container so a row arrives in
    // sequence. Cycles 0-3 to cap the total delay.
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
      // Fires slightly before the element reaches the fold, so the motion
      // finishes as it settles into view rather than starting there.
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.05
    });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }


  /* --------------------------------------------------------------------
     6. Contact form
     Submits in the background so the visitor stays on the page. Without
     JavaScript the form still does a normal POST and the provider shows its
     own thank-you, so nothing here is load-bearing.
     -------------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submit = document.getElementById('formSubmit');

  if (form && status && submit) {
    var PHONE = '(734) 719-0035';

    var show = function (kind, msg) {
      status.hidden = false;
      status.className = 'form__status form__status--' + kind;
      status.textContent = msg;
    };

    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action');

      // Endpoint not wired up yet — don't let the visitor think it sent.
      if (!action || action === 'FORM_ENDPOINT') {
        e.preventDefault();
        show('err', 'This form isn’t connected yet — please call ' + PHONE +
                    ' and I’ll get straight back to you.');
        return;
      }

      // Bail out to a normal POST on very old browsers.
      if (!window.fetch || !window.FormData) return;

      e.preventDefault();
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.hidden = true;

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status ' + res.status);
          form.reset();
          show('ok', 'Got it — thank you. I’ll be in touch within one business day.');
        })
        .catch(function () {
          show('err', 'Something went wrong sending that. Please call ' + PHONE +
                      ' or try again in a moment.');
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = 'Send it over';
        });
    });
  }

})();
