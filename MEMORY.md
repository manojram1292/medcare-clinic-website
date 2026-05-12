# Memory — for future sessions

This file gives a future Claude (or human) enough context to pick up
where we left off without re-reading every file.

## What this project is

A production clinic website for MedCare Family Clinic (Mineville, NS).
Built from a Claude-Design HTML prototype at
`../project/Doctor Website.html` and the smaller
`../project/Admin Dashboard.html`. The current names/data in the design
are placeholders — the user (clinic owner) plans to log into the admin
panel and replace everything with real content.

## Owner intent (from initial brief)

- Fully functional, hostable, low latency, SEO-optimized.
- Admin panel for editing every section. Database-backed.
- Photo uploads (doctors, blog covers).
- Customizable hours including "closed today due to storm".
- Popup alerts that visitors must dismiss before reaching the site.
- Blog with rich content + images.
- Domain already owned; deploy on cheapest viable host.
- Owner wants concise updates ("caveman" mode) — minimize tokens.

## Stack decisions

- **Next.js 14 App Router** — SEO, RSC, ISR
- **TypeScript** — strict
- **Tailwind** + verbatim CSS from the prototype in `globals.css`
- **Supabase** — Postgres + Auth + Storage (free)
- **Vercel** — hosting (free)

Why not other stacks: WordPress = bloated; static-only CMS = no popup
gate or live status; full custom backend = unnecessary cost & ops.

## Conventions

- Server components by default; `"use client"` only when needed
  (forms, state, popovers).
- Data fetching lives in `src/lib/data.ts` — never call Supabase
  from a component directly.
- All mutations are **server actions** (`"use server"`) that
  validate with Zod, then `revalidatePath()`.
- CSS classes: keep using the prototype's class names verbatim
  in `globals.css`. Don't rewrite them in Tailwind — that's wasted
  work and visual drift.
- Never commit `.env.local`. The `.env.example` lists all required vars.

## Outstanding decisions / TODOs

- Email contact form: deferred to v2 (Resend or similar).
- Analytics: deferred (Vercel Analytics free tier is fine when we add it).
- Multi-language: not in scope.

## Patient-value features (added 2026-05-05)

The site goes beyond marketing copy — it answers real patient questions:
- **FAQs** (`faqs` table, admin CRUD at `/admin/faqs`) — grouped by
  category, accordion on the contact + home pages.
- **First-Visit Guide** (clinic columns: `parking_info`, `insurance_info`,
  `what_to_bring`, `walk_in_policy`) — 4-card grid on contact page.
- **Live wait time** (`current_wait_minutes`, `wait_updated_at`) — admin
  taps "Update wait" with a number; pill auto-hides after 90 min so it
  never goes stale.
- **Languages spoken** (`languages_supported` on clinic, `languages` on
  doctor) — chips on contact hero + doctor profiles.
- **Doctor detail pages** at `/doctors/[slug]` — full bio, education,
  conditions treated, languages, years of experience, weekly schedule
  sticky card.
- **Emergency-vs-clinic decision card** — three-tier guidance (911 / ER /
  us). On contact + home.

## Design polish (added 2026-05-05)

- **Hero mouse parallax** (`HeroParallax.tsx`) — ±6 px max, GPU-accelerated.
- **Scroll-reveal fade-ups** (`ScrollReveal.tsx` + `.reveal` class) via
  IntersectionObserver.
- **3D card tilt** on doctor cards (`.tilt-card`).
- **Trust marquee** pause-on-hover.
- **Skip-to-content link** + visible focus rings on every interactive.
- **`prefers-reduced-motion`** disables every animation, transition,
  parallax, and reveal.
- **PWA manifest** at `/manifest.webmanifest` + `/icon.svg`.

## Where things live

- Public pages: `src/app/(public)/`
- Admin pages: `src/app/admin/`
- Reusable components: `src/components/`
- Data layer: `src/lib/data.ts` + `src/lib/supabase/*`
- Schema: `supabase/schema.sql`
- Seed: `supabase/seed.sql`

## Don't-redo list

- Don't switch CSS frameworks. The design is intentionally pinned to
  the prototype.
- Don't introduce a separate API service. Server actions cover everything.
- Don't add a heavy rich-text editor up front (Tiptap/Lexical) — the
  blog body uses Markdown in the admin panel for v1; HTML rendering is
  via `marked` + sanitizer.
