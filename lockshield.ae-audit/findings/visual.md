# Visual + Mobile Audit: https://www.lockshield.ae

Date: 2026-10-12. Tool: Playwright 1.63 (Chromium 153), headless, no throttling.
Viewports: mobile 375x812 @2x (iPhone UA, touch), desktop 1440x900 @1x.
Pages: `/`, `/services`, `/services/designing-drawing-civil-defence-approval`, `/contact`,
`/blog/understanding-dubai-civil-defence-approval-commercial-fitouts`.
No forms were submitted, no wa.me/tel: links were clicked, no repo files edited.

Screenshots: `D:\Projects\lockshield.ae\lockshield.ae-audit\screenshots\`
Naming: `<page>-<viewport>-<atf|full|scrolled>.png`, pages = `home`, `services`, `service-cd-approval`,
`contact`, `blog-cd-approval`; viewports = `mobile`, `desktop`.
Extra: `home-mobile-load-{0,400,1000,2000}ms.png` (load filmstrip).

## Score: Mobile/Visual 76 / 100

## What works
- No horizontal scroll at 375px on any page (scrollWidth = 375; no overflowing elements). Viewport meta correct, base font 16px, paragraphs >= 12px.
- Zero broken images (30 images on home, none broken), zero 4xx/5xx, zero console errors, no popups/modals/cookie banners/interstitials detected.
- Load stability is excellent: CLS 0.016 on home mobile, 0.006 on inner pages, ~0.00 on desktop. Hero image is preloaded.
- Hero text is readable: white 33.75px H1 plus 16px lighter subtext on a dark gradient overlay (home-mobile-atf.png). Primary CTA "Request a Free Quote" is visible above the fold.
- Contact links are well formed: `tel:+97142727333`, `tel:+971528434801`, `mailto:info@lockshield.ae`, WhatsApp `https://wa.me/971528434801?text=...` (correct E.164, no "+", `target=_blank rel="noopener noreferrer"`). Contact page shows the click-to-call phone and WhatsApp row above the fold (contact-mobile-atf.png). Inner service/blog pages carry a "CIVIL DEFENCE CERTIFIED" eyebrow (service-cd-approval-mobile-atf.png).

## Findings

### 1. No click-to-call or visible phone number above the fold on mobile home (High)
- Evidence: home-mobile-atf.png shows only the H1, two buttons, a hamburger and a green round FAB. `tel:` links on `/` exist only in the footer (page y ~7041 of 7241). Header has no call icon. Same on services/service/blog pages (tel links only in footer, y 1726-2948).
- The FAB is a generic chat-bubble glyph (not the WhatsApp mark, not a phone), so users cannot tell it is WhatsApp (aria-label says "Chat on WhatsApp", visual does not).
- Fix: add a phone icon button in the mobile header (`tel:+97142727333`) and/or a sticky bottom bar "Call | WhatsApp"; use the real WhatsApp glyph and a label on the FAB. Put the number in the hero.

### 2. "Civil Defence approved" trust signal is not a badge above the fold on home (Medium-High)
- Evidence: home-mobile-atf.png only mentions "fully compliant with Civil Defence standards" in the grey subtext. The explicit "DCD Approved Contractor" block is ~1,900px down (home-mobile-full.png). No logo/badge/licence number in the hero.
- Fix: add a visible badge near the H1 (e.g. "Dubai Civil Defence Approved" with shield/logo and licence no.) in the first 600px; reuse the inner-page eyebrow style.

### 3. Tap targets under 44px (Medium)
- Evidence (mobile 375): home has 16 of 63 interactive elements under 44px: hero slide dots 24x44 / 31x44, testimonial dots 20x44 / 36x44, "LEARN MORE" 107x16 (x4), "Ask our engineers" 116x15, footer address 185x20, footer phone/email links 32px tall. Inner pages: breadcrumb links 39x17 / 67x17, contact tel/email/WhatsApp links 36px tall (contact-mobile-atf.png), footer links 32px.
- Fix: min-height/padding to 44px (`min-h-11 inline-flex items-center`), widen dot buttons with padding, enlarge breadcrumb hit area, and give "Learn more" links block padding.

### 4. Text below 12px and low-contrast micro text (Low-Medium)
- Evidence: 10px "F&B . DUBAI" chips (9 instances) and "Field team . ready 24/7" on home; 11px breadcrumbs on all inner pages (gray on dark navy, tracked uppercase); 11px "Available 24/7 for emergencies" at `text-ink/40` on contact (contact-mobile-atf.png, pale grey on white, likely below 4.5:1).
- Fix: raise to >= 12px (prefer 14px for informational text) and darken to >= 4.5:1.

### 5. Form fields 14px on mobile cause iOS focus-zoom (Medium)
- Evidence: contact and service pages: text/tel/email inputs and textarea computed font-size 14px (select is 16px). iOS Safari zooms the page on focus when font < 16px. (Fields measured only; forms not submitted.)
- Fix: set input/textarea/select font-size to 16px on mobile (`text-base` below `md`); add `autocomplete` (name, tel, email) and `inputmode` attributes.

### 6. Floating FAB overlaps content (Low)
- Evidence: fixed bottom-right 52x52 (+ extra 66px container) overlaps body text in blog-cd-approval-mobile-atf.png ("...managers, navigating Civil Defence draw..." clipped under it) and service-cd-approval-mobile-atf.png; on /contact it sits over the inline "Chat Directly on WhatsApp" row (contact-mobile-atf.png), which is redundant there. Header is a fixed 82px floating pill, no content hidden in the captured scroll shots.
- Fix: add `padding-right`/bottom safe area to text blocks or hide the FAB on `/contact`; ensure FAB container has `bottom` offset above any future sticky CTA bar.

### 7. Home mobile first load was slow (Low-Medium, unconfirmed)
- Evidence: first (cold) mobile load of `/`: DOMContentLoaded ~3.96s, LCP 4.22s (hero `bg-banner-01.webp`, preloaded). Inner pages: DCL 0.2-0.8s, LCP ~0.75s. Desktop home LCP 1.48s. Single sample on a cold connection, not repeated or throttled.
- Hero text animates in (home-mobile-load-0ms.png: text clipped mid-reveal; full by ~1s), so there is no layout shift, but H1 is not painted at first paint.
- Fix: re-test with 3 runs/CDN warm and Lighthouse mobile; make H1/subtext visible without waiting on JS animation (SSR-visible, animate with opacity only), keep hero image `priority`/`fetchpriority=high`.

### 8. Clients logo strip shows a blank tile (Low-Medium, unverified cause)
- Evidence: home-mobile-full.png, "TRUSTED BY LEADING ORGANIZATIONS" row shows one Farsi logo and an empty box. May be a marquee mid-animation or a lazy image not yet loaded (no broken images were flagged by naturalWidth).
- Fix: verify all client logos load (non-lazy, explicit width/height) and that the carousel never shows an empty slot.

### 9. Low-resolution source images upscaled (Low)
- Evidence: home mobile: `installation.webp` (185px native shown at 341px), `commercial.webp` and `restaurants.webp` (200px native at 341px), visible softness on project/cards (home-mobile-full.png, Pizza Hut card). Desktop hero banners are 1200px native shown at 1440-1541px (home-desktop-atf.png). 16 of 30 home images lack width/height attributes.
- Fix: supply source images >= 2x display size (700px+ for cards, 2000px+ for hero); add width/height or aspect-ratio to prevent shift.

### 10. Micro layout shifts from the floating FAB animation (Info)
- Evidence: PerformanceObserver logs ~0.0001-0.0003 shift entries every ~1.5-3s attributed to `div.fixed.right-4.z-50` and hero slider dots (`button.group.flex.h-11`). Totals are negligible (CLS stays < 0.02).
- Fix: animate the FAB and slider progress via `transform`/`opacity`, not width/height/top.

## Not checked (stopped early)
- Mobile hamburger menu contents (does it include a phone/WhatsApp/quote CTA?), not opened.
- Hero slides 2-4 readability (only slide 1 captured clearly); contrast ratios not computed programmatically.
- Desktop screenshots (`*-desktop-atf.png`, `*-desktop-full.png`) were captured and measured (no overflow, no broken images) but not visually reviewed in detail. Mobile full-page crops of services/contact/blog/service pages not reviewed beyond ATF.
- Performance not re-run; only one sample per page. Other 5 service pages, other blog posts, tablet width (768) not tested.
- Form submission, wa.me/tel: click behaviour not exercised (by design). `_rsc ... ERR_ABORTED` requests are Next.js prefetch aborts, benign.
