# MedCare Clinic — Doctor Website

Production-ready, SEO-optimized clinic website with a built-in admin panel.
Every piece of public content (clinic name, hours, doctors, services, blog,
banners, popups, testimonials) is editable from the admin panel — no code
changes needed.

## Stack

- **Next.js 14** (App Router, RSC, ISR) — SSG/SSR for fast first paint + SEO
- **TypeScript** — type safety end-to-end
- **Tailwind CSS** + custom design tokens — the design from the prototype is
  preserved verbatim in `src/app/globals.css`
- **Supabase** — Postgres + Auth + Storage (free tier)
- **Vercel** — hosting (free hobby tier, custom domain)

Total monthly cost on free tiers: **$0** (excluding the domain you already own).

## Project layout

```
src/
├── app/
│   ├── (public)/             public pages
│   │   ├── page.tsx          home
│   │   ├── about/page.tsx
│   │   ├── doctors/page.tsx
│   │   ├── services/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/                admin panel (auth-gated)
│   ├── api/                  route handlers (uploads, revalidation)
│   ├── layout.tsx            root layout
│   ├── sitemap.ts            dynamic sitemap
│   └── robots.ts             robots.txt
├── components/
│   ├── public/               nav, footer, hero, banner, popup, etc.
│   └── admin/                admin UI bits
└── lib/
    ├── supabase/             server + client + admin clients
    ├── data.ts               typed data fetchers
    └── auth.ts               session helpers
```

## Setup (first time)

1. Create a free Supabase project at https://supabase.com
2. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your final domain)
3. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql)
4. In Supabase → Storage, create a public bucket named `media`
5. Run the seed: paste [`supabase/seed.sql`](./supabase/seed.sql) into the SQL editor
6. Create your admin user in Supabase → Authentication → Users (invite by email),
   then run `insert into admins (id) values ('<user-uuid>');`
7. `npm run dev` → http://localhost:3000

## Local development

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run prod build locally
```

Admin panel: `/admin/login`

## Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md). TL;DR: push to GitHub → import to
Vercel → paste env vars → point your domain at Vercel.

## What's customizable from the admin panel

- Clinic name, phone, email, address, emergency text
- Weekly hours (per-day open/close, mark days as Closed)
- Doctors (CRUD + photo upload + per-day schedule + status)
- Services (CRUD with icons + tags)
- Blog posts (Markdown body + cover image)
- Top announcement banner (text + urgent flag + on/off)
- Popup alerts (title + body + on/off — visitors must dismiss before browsing)
- Testimonials (CRUD)
- Holiday/closure overrides

## SEO

- Per-page metadata (title, description, OG, Twitter)
- JSON-LD structured data (`MedicalClinic`, `Physician`, `Article`)
- Auto sitemap.xml + robots.txt
- ISR with revalidation on admin saves
- Optimized images (next/image)
- Preloaded fonts, lazy hero illustrations

## Other docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design + data flow
- [MEMORY.md](./MEMORY.md) — context for future Claude sessions
- [LESSONS_LEARNED.md](./LESSONS_LEARNED.md) — running log of errors & fixes
- [DEPLOYMENT.md](./DEPLOYMENT.md) — step-by-step launch guide
