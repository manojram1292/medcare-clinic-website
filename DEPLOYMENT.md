# Deployment Guide

End goal: your domain → live, fully functional clinic site, $0/month
in hosting/infra.

## 1. Supabase (database + auth + image storage)

1. Sign up at https://supabase.com (free tier).
2. Create a new project. Pick a region close to your patients
   (e.g. "Canada Central" → `ca-central-1`).
3. Wait for the project to provision (~2 min).
4. From the project dashboard, grab three values from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key
5. **SQL editor → New query** → paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql) → Run.
6. **SQL editor → New query** → paste [`supabase/seed.sql`](./supabase/seed.sql) → Run.
   (This inserts default placeholder content.)
7. **Storage → Create bucket** → name it `media`, make it **public**.
8. **Authentication → Users → Add user** → enter your email + password.
   This becomes your admin login.
9. **SQL editor** → run:
   ```sql
   insert into public.admins (id) values ('<paste-the-user-uuid-here>');
   ```
   The UUID is on the user row in the Auth panel.

## 2. GitHub

1. `cd app && git add -A && git commit -m "Initial site"`
2. Create a new GitHub repo and push: `git push -u origin main`.

## 3. Vercel

1. Sign up at https://vercel.com (free hobby tier).
2. **Add New → Project → Import** your GitHub repo.
3. Framework: Next.js (auto-detected). Root directory: `app/`.
4. **Environment variables** — paste:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (mark as **encrypted**)
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`
   - `REVALIDATE_SECRET` = any random 32-char string
5. Click **Deploy**. First build takes ~2 min.

## 4. Domain

1. In Vercel: **Project → Settings → Domains → Add** → type your domain.
2. Vercel shows DNS records to add at your registrar:
   - For apex (`example.com`): A record → `76.76.21.21`
   - For `www`: CNAME → `cname.vercel-dns.com`
3. Wait for DNS propagation (5 min – 1 hr). HTTPS cert is automatic.

## 5. Post-launch checklist

- [ ] Visit `/` and confirm content matches Supabase data.
- [ ] Log into `/admin/login` with your Supabase user.
- [ ] Edit clinic name → confirm it updates on the public site within 60s.
- [ ] Upload a doctor photo → confirm it appears.
- [ ] Submit a popup alert → open in incognito → confirm popup shows.
- [ ] Run a Lighthouse audit on the home page (target: 95+ all metrics).
- [ ] Submit your sitemap to Google Search Console:
      `https://your-domain.com/sitemap.xml`

## Costs

- Supabase free tier: 500 MB DB, 1 GB storage, 50k monthly active users.
- Vercel hobby: 100 GB bandwidth/month.
- Domain: whatever you already pay your registrar.
- **Total infra: $0/month** for any small-clinic traffic level.

## Scaling beyond free

If/when you outgrow free tiers (likely never, for a single clinic):
- Supabase Pro: $25/mo (8 GB DB, 100 GB storage)
- Vercel Pro: $20/mo (1 TB bandwidth)
