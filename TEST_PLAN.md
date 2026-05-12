# Test Plan — MedCare Clinic Website

Author: senior-QA pass before launch.
Run: scripts referenced are in `scripts/`; manual checks listed inline.

## Scope

Public site (8 routes) + admin panel (12 routes) + Supabase backend.
Targets: iPhone 14 / iPhone SE (375 px), iPad (768 px), desktop (1280 px),
Chrome / Safari / Firefox.

## Automated test scripts

| Script | What it covers |
|---|---|
| `node scripts/test-admin-routes.mjs` | Logs in as admin, fetches every admin route. Asserts 200 and zero 500. |
| `node scripts/test-mobile.mjs` | Same routes, audits viewport meta + hard-coded grid columns. |
| `node scripts/test-security.mjs` | Surface-level security checks (CSP, XSS, auth gates, RLS, file-upload limits). |
| `npm run typecheck` | TypeScript strict pass. |
| `npm run build` | Production build — every route compiles, no errors. |

## Manual functional matrix

### Public site
- [ ] Home loads with hero, doctor cards visible, services grid filled, no JS console errors.
- [ ] Click each nav link — Home, About, Doctors, Services, Health Blog, Contact — all reach correct page.
- [ ] Click "Contact Us" green CTA — reaches `/contact`.
- [ ] Click any doctor's "View Full Profile" — reaches `/doctors/<slug>` with full bio.
- [ ] Click each Service card — visible state changes on hover (no nav).
- [ ] Click "Learn More About Physiotherapy" — reaches `/services`.
- [ ] Status pill says "Open Now" or "Currently Closed" matching the current time vs. configured hours.
- [ ] On `/contact`, click "Call Us" — opens `tel:` link.
- [ ] Click "Visit Us" address card — opens Google Maps.
- [ ] FAQ accordion: clicking a question expands the answer; clicking again collapses; only one open at a time; full answer visible (no clipping).
- [ ] Emergency-vs-Clinic card shows three tiers with red/amber/teal accents.

### Public — content edits (round-trip)
For each, edit in admin → reload public page within 60 s → verify update:
- [ ] Clinic name change → updates header logo, footer, hero
- [ ] Hero title 1 / 2 change → updates `/`
- [ ] Hours: tick "Closed" for today → home Status pill flips to "Currently Closed"
- [ ] Hours: set override note → yellow notice banner appears below hours table
- [ ] Doctor: upload new photo → appears on home, /doctors, /doctors/[slug]
- [ ] Doctor: change languages → meta-chip updates on doctor detail
- [ ] Service: add new → appears on home services + /services
- [ ] FAQ: add new → appears on contact page (and home if among top 6)
- [ ] Banner: toggle Active → strip appears/disappears at top of every page
- [ ] Banner: toggle Urgent → strip turns red
- [ ] Popup: set Active → reload home in incognito → modal blocks site until dismissed
- [ ] Popup: bump version → already-dismissed users see it again
- [ ] Wait-time: set 15 min → contact hero shows "~15 min wait" pill
- [ ] Wait-time: leave for 91 min → pill auto-hides

### Admin
- [ ] `/admin/login` — wrong password shows clear error, doesn't crash
- [ ] `/admin/login` — correct password redirects to `/admin`
- [ ] `/admin` — dashboard cards show real counts
- [ ] Each admin sub-page loads without 500
- [ ] Edit clinic info — save → flash "Saved." → values persist after reload
- [ ] Hours form — change time → save → public site reflects within 60 s
- [ ] Doctors — create → upload photo → save → appears in list
- [ ] Doctors — delete → confirm dialog → row disappears
- [ ] Services / Testimonials / FAQs — same CRUD checks
- [ ] Blog — create new post, set published, set featured → appears as feature on `/blog`
- [ ] Blog — Markdown rendering: # / ## / **bold** / *italic* / lists / [links](https://x) / `code` / > quote → all render correctly
- [ ] Sign out — back to `/admin/login`

### Auth & access control
- [ ] Unauth visit to `/admin` → redirect to `/admin/login`
- [ ] Sign in with non-admin user (Auth user but no `admins` row) → bounced with "not admin" message
- [ ] Logged-out fetch to `/admin/clinic` returns redirect, never 200

### Mobile
- [ ] Pull up site on iPhone Safari → no horizontal scroll
- [ ] Hamburger menu opens, closes, locks body scroll while open
- [ ] Hero CTAs are full-width
- [ ] FAQ accordion finger-taps work
- [ ] Popup card fits viewport, dismissible
- [ ] Forms: tapping inputs doesn't trigger zoom-on-focus (font-size: 16 px)
- [ ] Admin sidebar collapses to top strip
- [ ] All buttons reach 44 × 44 px

### Accessibility
- [ ] Tab from any page — first stop is "Skip to main content"
- [ ] Visible focus ring on every interactive
- [ ] Heading hierarchy: one H1 per page, no skipped levels
- [ ] All images have `alt`
- [ ] ARIA live region on wait-time pill announces updates
- [ ] Modal popup traps focus and closes on Esc
- [ ] All form fields have associated labels

### SEO
- [ ] `/sitemap.xml` lists every public route + every published blog post
- [ ] `/robots.txt` allows `/`, disallows `/admin*`
- [ ] Each page has unique `<title>` and meta description
- [ ] JSON-LD `MedicalClinic` on home, `Physician` on doctor pages, `Article` on blog posts
- [ ] PWA `/manifest.webmanifest` and `/icon.svg` valid

### Security
- [ ] Service-role key never appears in client bundle (search `_next/static`)
- [ ] CSRF: forms use POST + server actions (which include Next-Action token)
- [ ] File upload: > 5 MB rejected; non-image rejected; path traversal rejected
- [ ] XSS: blog Markdown renderer escapes HTML in content
- [ ] Open redirect: `?next=` parameter on login is path-only
- [ ] Image domains restricted in next.config.mjs to Supabase host

## Performance targets

| Metric | Target |
|---|---|
| First Contentful Paint (3G) | < 1.5 s |
| Largest Contentful Paint (4G) | < 2.0 s |
| Total Blocking Time | < 200 ms |
| Cumulative Layout Shift | < 0.05 |
| Total JS shipped to home | < 100 KB gzipped |
| Lighthouse — performance | ≥ 90 |
| Lighthouse — accessibility | ≥ 95 |
| Lighthouse — best practices | ≥ 95 |
| Lighthouse — SEO | ≥ 95 |

## Browsers tested

- Chrome 130+ (macOS, iOS, Android)
- Safari 17+ (macOS, iOS)
- Firefox 130+ (macOS)
