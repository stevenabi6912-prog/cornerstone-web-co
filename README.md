# Cornerstone Web Co. — website

A static marketing site. Three files do the work: `index.html`, `assets/css/style.css`,
`assets/js/main.js`. No build step, no framework, no dependencies — what's in this
folder is exactly what gets served.

```
index.html              the whole page
assets/css/style.css    all styles (tokens at the top)
assets/js/main.js       ~3KB, all optional enhancement
assets/img/             photography + favicon
robots.txt, sitemap.xml
```

---

## Before this goes live

Three things are placeholders. All are marked with `EDIT:` comments in `index.html`.

**1. Phone number** — `index.html`, contact section

```html
<a class="contact__value is-placeholder" href="#contact">[PLACEHOLDER — add real number]</a>
```

Replace with the real number and drop the `is-placeholder` class:

```html
<a class="contact__value" href="tel:+15175550123">(517) 555-0123</a>
```

The `href` must be E.164 — `+1` then ten digits, no spaces, dashes, or parentheses.

**2. Email** — same block, same pattern, `href="mailto:you@yourdomain.com"`.
Pending the domain inbox.

**3. Domain** — `cornerstonewebco.com` is assumed in four places: the `canonical`
link, the two `og:` URL tags, and `sitemap.xml`. Find and replace if the real
domain differs.

Until the real phone and email are in, those two entries render greyed out with a
dashed underline and go nowhere. That is deliberate — a placeholder that looks like
a working phone number is worse than one that obviously isn't.

---

## Deploying

Any static host. No build command, no output directory — point it at this folder.

```bash
npx vercel --prod
```

Netlify, Cloudflare Pages, or GitHub Pages work identically. For plain shared
hosting, upload the folder contents to the web root.

To preview locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. (Opening `index.html` directly as a `file://`
URL mostly works, but a server is closer to production.)

---

## Design decisions worth knowing

**The accent green is load-bearing.** `#007A38` — the green of a "cycle start"
button on a production machine. It was picked against two defaults: terracotta-on-cream
(the generic template look) and editorial red (the obvious second choice, and what
most competitors reach for). The full reasoning is in a comment at the top of
`style.css`.

There are two accent values because one green can't sit on both backgrounds
accessibly: `--accent` for the light sections, `--accent-bright` for the dark ones.
Every colour pair on the site measures at WCAG AA or better — the measured ratios
are recorded in that same comment. **Re-measure before changing either value.**
`#00873E` looks nearly identical and fails at 4.10:1.

**Type is a system-font stack**, on purpose: zero network requests, zero layout
shift, instant first paint. The monospace stack on eyebrows, section numbers, and
prices is the engineering register — it ties back to the manufacturing background
and costs nothing. To swap in a self-hosted font later, add an `@font-face` block
and prepend the family to `--font-sans`; nothing else needs to change.

**One motion moment.** The hero headline wipes up on load and the photograph drifts
slower than the page as you scroll off it. Everything else just settles in as it
enters view. The parallax is deliberately constrained: desktop and fine-pointer
only, stops updating once the hero leaves the viewport, and touches only
`transform` so it stays off the main thread.

**Reduced motion is a real branch, not a token gesture.** `prefers-reduced-motion:
reduce` removes every transition and disables the parallax in JS as well as CSS.
Content renders in its final state.

**Nothing depends on JavaScript.** `main.js` adds a `.js` class before first paint,
and that class is what switches on the hidden-then-reveal behaviour. If the script
fails to load, every element is simply visible and the page reads normally.

---

## The portfolio grid is curated, not a list

Three projects, and the first one spans the full width. Adding a fourth and fifth
will weaken it — the point is that these are the best three.

The Faith Baptist card sits in a browser frame because it's a genuine screenshot of
the live site, captured at `1600x518` so the frame ends exactly at the bottom of
their hero. The other two projects are private platforms, so those cards use
illustrative photographs and deliberately have no browser frame — a frame around a
stock photo would imply a screenshot that isn't one.

To re-shoot the Faith Baptist screenshot after they change their site:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1600,518 --screenshot=assets/img/work-faith-baptist.jpg https://fbcchelsea.org
```

## No testimonials

There are no client quotes anywhere, because there are no clients yet. The "Why
local" section carries the trust load with three honest claims instead. When real
testimonials exist they belong there — don't invent placeholder ones in the
meantime.

---

## Photography

The photographs are Unsplash stock, downloaded and served locally rather than
hotlinked. The Unsplash licence permits commercial use without attribution.

| File | Subject | Source |
|---|---|---|
| `hero.jpg` | Welder, sparks | `unsplash.com/photos/…1504328345606-18bbc8c9d7d1` |
| `about-portrait.jpg` | Engineering drawings, calipers | `…1581092160562-40aa08e78837` |
| `work-scheduler.jpg` | Stack of textbooks | `…1497633762265-9d179a990aa6` |
| `work-golf.jpg` | Golf ball on the lip | `…1587174486073-ae5e5cff23aa` |
| `work-faith-baptist.jpg` | Screenshot of fbcchelsea.org | captured from the live site |

**The About image is not a photo of a person, and that's intentional.** A stock
photo of a stranger under the heading "Steven Wireman" would be a plain lie to
anyone reading the page. It shows the work instead. Swap in a real photo of Steven
when there is one — documentary rather than a studio headshot, 4:5 ratio (1000×1250),
and nothing else needs to change.

Every image has a fixed `width`/`height` in the markup so the browser reserves
space and the page doesn't shift while they load. If you swap an image for one with
a different aspect ratio, update those attributes to match.

---

## Wiring up a contact form later

The site is static, so a form needs an external endpoint. There's a comment in the
contact section marking the spot. Two options that need no server:

1. **Formspree / Basin / Netlify Forms** — a plain `<form action="…" method="POST">`
   with name, email, business, and message fields.
2. **A serverless function** at `/api/contact` that forwards to email (Resend,
   Postmark), with the form pointed at it.

Either way: keep the `tel:` and `mailto:` links as the no-JavaScript fallback,
label every input, and use a honeypot field rather than a CAPTCHA.

---

## Social preview image

`assets/img/og-cover.jpg` (1200×630) is referenced by the `og:image` tag and is
already in place. Social platforms need an absolute URL, so that tag has to carry
the real domain — it's one of the four places to update above.
