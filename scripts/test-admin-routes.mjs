#!/usr/bin/env node
// Logs into the local Supabase, builds the cookie that @supabase/ssr expects,
// and fetches every admin route. Reports HTTP status + flags any 500.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = Object.fromEntries(
  readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/i)).filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')]),
);

const SITE = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = process.argv[2] || 'admin@medcare.local';
const PW = process.argv[3] || 'medcare-local-2026';

const supa = createClient(SUPA_URL, ANON);
const { data, error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PW });
if (error) { console.error('Login failed:', error.message); process.exit(1); }

const session = data.session;
const project_ref = new URL(SUPA_URL).hostname.replace(/\..*$/, '').replace(/[^a-z0-9]/gi, '');
// @supabase/ssr cookie format: base64-<base64(json)>, optionally chunked.
const sessionJson = JSON.stringify({
  access_token: session.access_token,
  token_type: 'bearer',
  expires_in: session.expires_in,
  expires_at: session.expires_at,
  refresh_token: session.refresh_token,
  user: session.user,
});
const cookieValue = 'base64-' + Buffer.from(sessionJson).toString('base64');
const cookieName = `sb-${project_ref}-auth-token`;
// chunk if > 3000 chars
const chunks = [];
for (let i = 0; i < cookieValue.length; i += 3000) chunks.push(cookieValue.slice(i, i + 3000));
const cookieHeader = chunks.length === 1
  ? `${cookieName}=${chunks[0]}`
  : chunks.map((c, i) => `${cookieName}.${i}=${c}`).join('; ');

const routes = [
  '/admin', '/admin/clinic', '/admin/hours', '/admin/doctors',
  '/admin/services', '/admin/faqs', '/admin/blog', '/admin/announcements',
  '/admin/popups', '/admin/testimonials',
  '/admin/doctors/new', '/admin/blog/new',
];

console.log(`Cookie: ${cookieName} (${cookieValue.length} chars, ${chunks.length} chunk${chunks.length > 1 ? 's' : ''})\n`);

let bad = 0;
for (const p of routes) {
  const url = `${SITE}${p}`;
  const r = await fetch(url, { headers: { cookie: cookieHeader }, redirect: 'manual' });
  const tag = r.status >= 500 ? '✗ 500' : r.status >= 300 && r.status < 400 ? `→ ${r.status}` : `✓ ${r.status}`;
  console.log(`${p.padEnd(32)} ${tag}`);
  if (r.status >= 500) {
    bad++;
    const body = await r.text();
    console.log(body.slice(0, 600));
  }
}

process.exit(bad ? 1 : 0);
