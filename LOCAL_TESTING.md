# Local end-to-end testing

Goal: verify the full admin → public flow on your machine before deploying.
Total time: ~5 minutes.

## What you'll do

1. **Sign up at Supabase** (browser, 1 min)
2. **Create a project** (browser, 2 min provisioning wait)
3. **Paste 2 SQL files into the SQL editor** (browser, 1 min)
4. **Paste 3 values into `.env.local`** (terminal, 30 sec)
5. **Run one command** to create your admin login + storage bucket (terminal, 10 sec)
6. **Restart `npm run dev`** and start clicking around

## Step 1 — Sign up

Go to https://supabase.com → "Start your project" → sign in with GitHub
or email. **No credit card required, no payment plan.**

## Step 2 — Create a project

- "New Project"
- **Name**: `medcare-clinic` (or whatever)
- **Database password**: pick anything, save it somewhere (you may not need it)
- **Region**: pick closest to you (e.g. `ca-central-1` if Atlantic Canada)
- Click "Create new project". Wait ~2 minutes for the provisioning bar.

## Step 3 — Run the schema + seed

- Open the project. Left sidebar → **SQL Editor**.
- Click **New query**.
- Open `app/supabase/schema.sql` in your editor, copy the whole file,
  paste into the SQL editor, click **Run** (bottom-right). Should say
  "Success. No rows returned."
- Click **New query** again. Paste contents of `app/supabase/seed.sql`,
  Run. (Inserts placeholder content.)

## Step 4 — Get your 3 keys + write `.env.local`

In Supabase: left sidebar → **Project Settings (gear icon)** → **API**.

Copy these three:
- **Project URL** (e.g. `https://abcdefgh.supabase.co`)
- **anon** key (under "Project API keys")
- **service_role** key (click "Reveal" — keep this secret)

Then in your terminal:

```bash
cd "/Users/man/Pictures/Dr. Naghiya Website/doctor-website/app"
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

Then open `.env.local` and replace the three placeholders with your real
values. (Or use any text editor.)

## Step 5 — Create your admin login

Pick any email + password you'll remember. Run:

```bash
npm run setup:admin -- you@example.com 'choose-a-strong-password'
```

What this does, automatically:
- Creates the `media` storage bucket (for photo uploads).
- Creates an authenticated user with the email + password you passed.
- Inserts a row into the `admins` table so that user is recognised as admin.

You should see:
```
→ Ensuring storage bucket "media"…
  · created
→ Ensuring admin auth user (you@example.com)…
  · created, id ...
→ Inserting admins row…
  · ok
✓ Setup complete.
```

## Step 6 — Restart dev server

The dev server only picks up env vars at boot.

```bash
# Stop the running dev server first:
lsof -ti:3000 | xargs kill 2>/dev/null
# Start it again:
npm run dev
```

## Step 7 — Test

- Public site: http://localhost:3000/  → you should now see real doctor
  cards, services, blog posts, testimonials (from the seed).
- Admin login: http://localhost:3000/admin/login  → enter the email +
  password you used in step 5.
- Once logged in, click around the admin sidebar. Try:
  - **Clinic Info** → change the clinic name → save → reload home page
    in another tab → name should update within ~60s.
  - **Hours** → tick "Closed" for today → save → reload home → "Open Now"
    should switch to "Currently Closed". Untick to revert.
  - **Doctors** → edit a doctor → upload a photo → save → reload
    `/doctors` → photo appears.
  - **Banner** → toggle "Urgent" → save → reload home → banner turns red.
  - **Popup Alert** → set Active = on, edit body → save → open home in
    incognito → modal blocks the site until you dismiss.
  - **Blog** → New post → write Markdown → publish → check `/blog`.

If any of those work, the whole pipeline works. Then you're ready to deploy.

## Troubleshooting

- **Login says "Supabase not connected yet"**: env vars not loaded — check
  `.env.local` exists and you restarted `npm run dev`.
- **Login says "not-admin"**: the auth user exists but no admins row.
  Re-run `npm run setup:admin -- ...` with the same email — it's idempotent.
- **Photo upload fails**: check Storage → media bucket exists and is public.
- **Saving an item shows old data on the public site**: Next.js ISR is 60s.
  Hard reload after a minute, or the in-page edits will become visible
  on the next request after that window.
