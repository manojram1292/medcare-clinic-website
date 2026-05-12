# Lessons Learned

A running log. Each entry: what broke, what fixed it, how to avoid repeating.

## Format

```
## YYYY-MM-DD — Short title
**What happened:** symptom
**Root cause:** the actual reason
**Fix:** what we did
**Prevention:** how to never see this again
```

---

## 2026-05-04 — Project bootstrap

**What happened:** N/A (initial setup)
**Notes:**
- Node v25.8.1 / npm 11.11.0 on the dev machine. Vercel runs Node 20 by
  default — `engines.node: "20.x"` is now set in package.json.
- `create-next-app@14` was used instead of 15 — App Router is stable on 14
  and our Supabase SSR helper is well-tested there.

## 2026-05-04 — Middleware crashed without env vars

**What happened:** First `next build` failed at runtime when Supabase env
vars were absent or set to placeholder values like `YOUR-PROJECT`.
**Root cause:** `createServerClient` accepted the placeholder URL but
calls to `auth.getUser()` then threw "Failed to fetch".
**Fix:** Added `isConfigured()` to `src/lib/data.ts` and a copy in
`src/lib/supabase/middleware.ts` that returns false on placeholder values.
Both data fetchers and middleware short-circuit when not configured —
the public site renders with built-in fallbacks and `/admin` redirects
to `/admin/login?error=not-configured`.
**Prevention:** When wiring a new third-party SDK that talks to the
network, always handle "missing or placeholder credentials" as a
first-class state, not an exception.

## 2026-05-04 — Admin layout vs login page

**What happened:** Initial design had `/admin/layout.tsx` calling
`requireAdmin()`, which would have run on the login page itself and
caused a redirect loop.
**Fix:** Moved authed pages into `src/app/admin/(authed)/` route group.
The `(authed)` layout enforces auth; `/admin/login/page.tsx` lives
outside it and uses only the root layout.
**Prevention:** When a section needs an auth gate, the gate belongs in
a route-group layout, not the bare path layout — so unauthed pages
within the same URL prefix can still render.

## 2026-05-04 — Login action crashed without env vars

**What happened:** Submitting the login form when Supabase env vars were
missing produced an unhandled "Your project's URL and Key are required to
create a Supabase client!" runtime error.
**Root cause:** `requireAdmin()` and the data fetchers checked
`isConfigured()`, but `loginAction` and `logoutAction` did not — they
called `createClient()` directly, which bombs out when given undefined.
**Fix:** Added `isConfigured()` short-circuit at the top of
`loginAction` (redirects to `?error=not-configured`) and at the top of
`logoutAction`. Login page now shows a friendly "Supabase not connected
yet" message with the deployment steps.
**Prevention:** Any server action that touches Supabase needs the
`isConfigured()` guard, not just data fetchers. Audit new actions for
this when adding them.

## 2026-05-05 — "Event handlers cannot be passed to Client Component props"

**What happened:** Every authed admin list page (doctors, services, blog,
testimonials) crashed at runtime with
`Error: Event handlers cannot be passed to Client Component props.` —
visible to the user as a red Next.js error overlay on each admin page.
**Root cause:** I had inline `onClick={(e)=>{ if(!confirm(...))
e.preventDefault(); }}` on `<button>` elements inside server components.
Server components are not allowed to ship event handlers — the closure
can't be serialized to send to the client. The error fires at *render*
time, not compile time, so build/typecheck didn't catch it.
**Fix:** Extracted a `'use client'` `<DeleteButton>` component
(`src/components/admin/DeleteButton.tsx`) that owns the confirm-and-submit
form. Replaced all four call sites in
`src/app/admin/(authed)/{doctors,services,blog,testimonials}/page.tsx`.
Verified end-to-end with `scripts/test-admin-routes.mjs` — all 11 admin
routes return 200 authenticated.
**Prevention:**
- Whenever you need a `<button onClick>` in a server component, the
  whole interactive bit must be extracted into a `'use client'`
  component. Never sneak an inline handler in.
- Build passing and typecheck passing aren't enough to catch this; need
  an actual rendered request. `scripts/test-admin-routes.mjs` covers
  this for every admin route now — run it after touching admin pages.
- Functions are fine to pass as props *only* when they're server actions
  (declared in a file with `'use server'`) — those are passed by
  reference, not value.

## 2026-05-05 — `cookies()` called outside request scope in generateStaticParams

**What happened:** Added `/doctors/[slug]` and `/blog/[slug]` static-param
generators that called the existing `getDoctors()` / `getPosts()` data
fetchers. Pages 500'd with
`Error: 'cookies' was called outside a request scope.`
**Root cause:** Our cookie-aware Supabase server client (`lib/supabase/server.ts`)
calls `cookies()`. `generateStaticParams` runs at build/static time,
where there is no request — so `cookies()` throws.
**Fix:** Added `lib/supabase/anon.ts` exporting a cookie-less anon client
(`createAnonClient`). `generateStaticParams` now imports that directly
and selects only the public `slug` column. The cookie-aware client is
still used inside request handlers (where RLS needs to see the user).
**Prevention:** Any function called from `generateStaticParams`,
`generateMetadata` at build time, `sitemap.ts`, or `robots.ts` must
not touch `cookies()` or `headers()`. If it queries Supabase, route it
through `createAnonClient`.

## 2026-05-05 — Inline `gridTemplateColumns` on contact page wasn't mobile-responsive

**What happened:** Contact page had `<div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)'}}>` and `gridTemplateColumns:'1fr 400px'`. Inline styles always win over class CSS, so even though I'd added a `contact-cards-grid` className, the layout never collapsed on small viewports.
**Fix:** Removed inline `style={{display:'grid'...}}` from the contact page wrappers. Added real CSS rules for `.contact-cards-grid` and `.contact-bottom-grid` with `@media(max-width:760px)` collapse.
**Prevention:** Don't put `display: grid` + `gridTemplateColumns` directly in `style={}`. Use a class so media queries can override it. Linted by `scripts/test-mobile.mjs`, which now flags any hard-coded grid columns in raw HTML.

## 2026-05-05 — Edit tool silently no-op'd on a large block

**What happened:** I called `Edit` to remove `<AvailabilitySection>` and `<EmergencyDecisionCard>` from the home page. The tool returned `"updated successfully"`, but a follow-up `grep` showed the components were still there.
**Root cause:** The `old_string` didn't match the file byte-for-byte (likely a whitespace/quote difference I didn't notice). The Edit tool reported success while leaving the file unchanged.
**Fix:** Verified the file with `Read` after the edit, then used `Write` to rewrite it from scratch.
**Prevention:** After editing a file, **verify the change actually landed** — either `Read` the file, or `grep` for the removed string. Don't trust the tool's "success" message alone for non-trivial replacements.

## 2026-05-05 — Mobile audit (iPhone / iPad / phone) green

**Coverage:** 8 public + 12 admin routes verified at 320–1280 px:
- Hero, doctor cards, services, physio, testimonials, blog, footer, contact — all collapse to single-column at the right breakpoint.
- Admin sidebar collapses to top-strip nav at 760 px; hours form wraps at 760 px.
- Touch targets reach 44 px min on mobile (Apple HIG).
- Inputs use `font-size: 16px` on mobile so iOS doesn't zoom-on-focus.
- Viewport meta + `initial-scale=1` are present (Next.js `viewport` export).
- PWA manifest at `/manifest.webmanifest` works for "Add to Home Screen".

Run the audit anytime: `node scripts/test-mobile.mjs`.

## 2026-05-07 — Pre-launch QA + security pass

**Senior-QA pass before tomorrow's user testing.** Three real security
issues found and fixed:

1. **JSON-LD `</script>` injection.** The home and doctor-detail pages
   embed `application/ld+json` blocks built from admin-controlled fields
   (clinic name, doctor bio, etc.). If an admin's input contained
   literal `</script>`, the JSON would close out of the script tag and
   could inject HTML. Fixed by replacing `<` with `<` in the
   stringified JSON before injection (`safeJson` helper in
   `components/public/JsonLd.tsx` and inline on doctor detail page).

2. **Popup CTA `javascript:` URL.** The popup's "Optional button URL"
   was rendered straight into `<a href={url}>`. An admin (or anyone who
   compromised an admin account) could set `javascript:fetch(...)` and
   trigger XSS in any visitor's session. Fixed via new
   `lib/safe-url.ts → safeHref()` which only allows
   `http: / https: / mailto: / tel:`.

3. **Maps embed iframe.** Same shape — `<iframe src={admin.input}>`.
   Now passed through `safeMapsEmbed()` which requires an `https://`
   URL on a `google.com` host with `/maps/` path. Anything else
   renders as the fallback placeholder.

**Bug fixes shipped in same pass:**
- Login form preserves email on error.
- Hour format validation: rejects malformed times with a clear flash
  message (`8:00 AM` / `6:00 PM`); also asserts close > open.
- Mobile menu: body-scroll lock when open, Esc-to-close, auto-close
  on route change.
- Popup modal: focus trap, Esc-to-close, focus restored to opener
  on close, `aria-labelledby`.

**UI / "out-of-the-box" polish shipped:**
- Animated stats strip on home — admin edits 1–6 stats; numbers
  count up from zero on first scroll into view.
- Scroll progress bar (3 px gradient at top).
- Back-to-top floating button.
- Curated SVG service icons (with emoji fallback).
- Subtle page transition between routes.
- Polished 404 with animated orbs matching the hero aesthetic.

**Test scripts added:**
- `scripts/test-security.mjs` — 20 checks: route reachability, admin
  redirects, service-role-not-in-bundle, robots, JSON-LD parse,
  reflected-XSS canary, upload limits, RLS denies anon writes.
- `scripts/test-mobile.mjs` — viewport meta + hard-coded grid scan.
- `scripts/test-admin-routes.mjs` — full authed admin smoke test.
- `npm test` runs all three in sequence.

**Caught in dogfooding:** the new "Edit stats" admin form had inline
`gridTemplateColumns: '1fr 80px 2fr'` which the mobile audit
immediately flagged. Fixed by moving to `.stats-admin-row` class
with `@media(max-width:760px)` collapse.

## 2026-05-04 — Newsreader font override warning

**What happened:** Build logs show "Failed to find font override values
for font `Newsreader`". Build still succeeds.
**Notes:** Cosmetic warning from `next/font/google` — Next 14 doesn't have
fallback metric overrides for Newsreader. Not a runtime error. Layout
shift is minimized via `display: 'swap'`. Safe to ignore.
