# Cornerstone Web Co. — website

A static marketing site. Three files do the work: `index.html`, `assets/css/style.css`,
`assets/js/main.js`. No build step, no framework, no dependencies — what's in this
folder is exactly what gets served.

```
index.html              the whole page
assets/css/style.css    all styles (tokens at the top)
assets/js/main.js       ~2KB, all optional enhancement
assets/fonts/           self-hosted variable fonts (woff2)
assets/img/             photography + favicon
robots.txt, sitemap.xml
```

---

## Status

**Live at https://thecornerstonewebco.com** — GitHub Pages, Cloudflare DNS,
Let's Encrypt certificate, HTTP redirecting to HTTPS.
`steven@thecornerstonewebco.com` forwards to Gmail via Cloudflare Email Routing.

### Still to do

**1. Connect the contact form.** Sign up at [formspree.io](https://formspree.io)
(free tier: 50 submissions/month), create a form, and paste the URL it gives you
over `FORM_ENDPOINT` in `index.html`:

```html
<form class="form" id="contactForm" action="https://formspree.io/f/YOURID" method="POST">
```

Until that's done the form deliberately refuses to submit and tells the visitor to
call instead — it will never pretend a message was sent.

**2. Add the analytics beacon token.** Cloudflare dashboard → Analytics & Logs →
Web Analytics → add the site. Paste the token over `BEACON_TOKEN` at the bottom of
`index.html` and uncomment that script tag.

The beacon token is public by design — it ships in the page source. **Never put a
Cloudflare API key in this file.** An API key can change your DNS, and everything
here is world-readable.

**3. `www` certificate.** The apex is fully covered. GitHub issued its certificate
while `www` was still proxied, so `www` is not yet on the certificate. GitHub
usually adds it within a few hours of `www` resolving correctly; if it hasn't after
a day, the reliable fix is a Cloudflare Redirect Rule sending `www` to the apex
(which requires re-proxying `www` — orange cloud — so Cloudflare terminates TLS
for it).

### Not yet true

The site says "Cornerstone Web Co.", **not** "Cornerstone Web Co., LLC", because the
LLC isn't registered yet. Don't add "LLC" anywhere until the Michigan Articles of
Organization are filed and accepted — claiming it beforehand is a misrepresentation
and gives none of the liability protection it implies.

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

**Warm, not cold.** The ground is warm ivory (`#FAF7F2`), not white or near-black,
and every grey on the page is warm-shifted — more red than blue. A neutral grey on
ivory is most of what makes a page read clinical. There is exactly **one** dark
section, the closing call to action, so the dark lands as emphasis rather than mood.

**Real typography, self-hosted.** Headlines are Fraunces (a warm variable serif),
body is Source Sans 3. Two `.woff2` files, ~93KB total, latin subset, weights
400–700 — no Google Fonts connection, no third-party request, no tracking. Both
are preloaded in `<head>` with `crossorigin` (required on font preloads even
same-origin, or the browser fetches them twice) and set to `font-display: swap`,
so text paints immediately in the fallback and re-renders when the webfont lands.

Both fonts are licensed under the SIL Open Font License, which permits commercial
use and embedding. Keep them served from your own domain.

**The accent green is load-bearing.** `#2D6A4F` — a deep, warm-leaning forest
green. Warm-leaning matters: a cold blue-green buzzes against ivory. Amber
(`#D9A03C`) appears only as a decorative rule or fill; where amber needs to be
readable text it darkens to `#8A5B14`.

Every colour pair on the site measures at WCAG AA or better and the ratios are
recorded in a comment at the top of `style.css`. **Re-measure before changing any
of them.**

**Soft shapes.** Pill buttons, rounded cards, warm-tinted shadows, and a ~1°
rotation on the two photographs. Rounded reads welcoming; square reads severe.
That rotation is removed under `prefers-reduced-motion`.

**Motion is quiet.** Content settles in as it enters view and the hero arrives on
load. No parallax — the earlier full-bleed photo hero is gone, and scroll-linked
effects were part of what made the page feel showy rather than trustworthy.
`prefers-reduced-motion: reduce` removes every transition and un-rotates the photos.

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

| File | Subject | Source |
|---|---|---|
| `steven.jpg` | **Steven at Faith Baptist** | your own photo |
| `hero.jpg` | Shop counter, local retail | Unsplash `…1556740738-b6a63e27c4df` |
| `work-scheduler.jpg` | Stack of textbooks | Unsplash `…1497633762265-9d179a990aa6` |
| `work-golf.jpg` | Golf ball on the lip | Unsplash `…1587174486073-ae5e5cff23aa` |
| `work-faith-baptist.jpg` | Screenshot of fbcchelsea.org | captured from the live site |

The stock images are downloaded and served locally rather than hotlinked; the
Unsplash licence permits commercial use without attribution.

**`steven.jpg` is the most valuable image on the page.** It's cropped from the
original to head-and-torso — a full-body shot renders the face too small to
connect with at this size. To replace it, crop to **3:4** at roughly 900×1200 and
keep the same filename; nothing else needs to change.

The hero photograph is stock. If you ever shoot a real Jackson or Chelsea business
you've built for, that image belongs here — swap the file, keep the 4:5 ratio
(1100×1375).

Every image has a fixed `width`/`height` in the markup so the browser reserves
space and the page doesn't shift while it loads. If you swap in an image with a
different aspect ratio, update those attributes to match.

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
