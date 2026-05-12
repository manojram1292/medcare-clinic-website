# Architecture

## High level

```
┌────────────────────────────────────────────────────────────────────┐
│                          Vercel Edge                               │
│  ┌─────────────────────┐         ┌──────────────────────────────┐  │
│  │  Public pages       │         │  Admin panel  /admin/*       │  │
│  │  ISR + RSC + edge   │         │  Server actions, auth-gated  │  │
│  └─────────┬───────────┘         └─────────────┬────────────────┘  │
│            │                                   │                    │
│            └─────────────┬─────────────────────┘                    │
│                          ▼                                          │
│             /api/revalidate   /api/upload                           │
└──────────────────────────┬─────────────────────────────────────────┘
                           ▼
                  ┌──────────────────┐
                  │     Supabase     │
                  │  Postgres + Auth │
                  │   + Storage      │
                  └──────────────────┘
```

## Rendering strategy

| Route              | Mode               | Why                                  |
|--------------------|--------------------|--------------------------------------|
| `/` (home)         | ISR (60s)          | Mostly static; revalidates on edits  |
| `/doctors`         | ISR (60s)          | Same                                  |
| `/services`        | ISR (60s)          | Same                                  |
| `/blog`, `/blog/*` | ISR (60s)          | Static-friendly content              |
| `/about`           | ISR (60s)          | Same                                  |
| `/contact`         | ISR (60s)          | Hours come from DB                    |
| `/admin/**`        | Dynamic SSR        | Auth + live data                      |

On admin save, server actions call `revalidatePath()` so changes go live
within a second.

## Data model

```
clinic           singleton row — name, phone, email, address, emergency_text
hours            7 rows (one per day) — open, close, closed
doctors          id, name, initials, specialty, bio, status, photo_url, sort
doctor_schedule  doctor_id, day, time_label
services         id, name, description, icon, color, tags[], sort
testimonials     id, text, name, tag, initials, rating, sort
blog_posts       id, slug, category, title, excerpt, body, cover_url,
                 author_id, published, published_at
authors          id, name, initials, role
announcement     singleton — message, active, urgent
popup_alert      singleton — title, body, active, cta_label, cta_url
```

Row-level security: public tables are readable by anon, writable only by
authenticated users with role `admin`.

## Auth

Supabase Auth with email/password. Admin users live in a separate
`admins` table keyed on `auth.users.id`. Middleware gates `/admin/**`.

## Image uploads

Browser → server action → Supabase Storage (`media` bucket) → public URL
saved on the row. Images served via Supabase CDN; rendered via `next/image`
for resize + lazy load.

## Why these choices

- **Next.js App Router**: best SEO defaults (streaming, metadata API,
  generateStaticParams), built-in image optimization, and server actions
  make admin mutations one round-trip.
- **Supabase**: Postgres + Auth + Storage from one provider, generous free
  tier, RLS keeps things simple.
- **Vercel**: zero-config Next.js deploys, instant rollbacks, edge cache.

## Performance budget

- Largest Contentful Paint < 2.0s on 4G
- Total JS shipped to home page < 90 KB gzipped
- Images served as AVIF/WebP via `next/image`
- Fonts: preloaded + `font-display: swap`
