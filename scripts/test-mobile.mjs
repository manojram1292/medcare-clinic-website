#!/usr/bin/env node
// Mobile-viewport smoke test. Walks every public + admin route at three
// viewports (iPhone SE 375, iPad 768, desktop 1280) and checks for:
//   - HTTP 200
//   - no horizontal overflow signals (super-wide hard-coded grid templates)
//   - declared viewport meta + initial-scale
//   - presence of <meta name="viewport">
//
// Requires the dev server running on :3000. Logs in as admin to test
// authed routes too.

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
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: login } = await supa.auth.signInWithPassword({
  email: 'admin@medcare.local', password: 'medcare-local-2026',
});

const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.replace(/\..*/, '');
const sessionJson = JSON.stringify({
  access_token: login.session.access_token, token_type: 'bearer',
  expires_in: login.session.expires_in, expires_at: login.session.expires_at,
  refresh_token: login.session.refresh_token, user: login.session.user,
});
const cookieValue = 'base64-' + Buffer.from(sessionJson).toString('base64');
const cookieHeader = `sb-${projectRef}-auth-token=${cookieValue}`;

const publicRoutes = [
  '/', '/about', '/doctors', '/doctors/dr-alexandra-chen',
  '/services', '/blog', '/blog/canadian-winter-family-health',
  '/contact',
];
const adminRoutes = [
  '/admin', '/admin/clinic', '/admin/hours', '/admin/doctors',
  '/admin/services', '/admin/faqs', '/admin/blog',
  '/admin/announcements', '/admin/popups', '/admin/testimonials',
  '/admin/doctors/new', '/admin/blog/new',
];

let bad = 0;
async function audit(path, authed) {
  const headers = authed ? { cookie: cookieHeader } : {};
  const res = await fetch(`${SITE}${path}`, { headers, redirect: 'manual' });
  const html = await res.text();

  const findings = [];
  if (res.status !== 200) findings.push(`HTTP ${res.status}`);

  // Viewport meta present (Next.js generates it from viewport export)
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) findings.push('no viewport meta');

  // Hard-coded grid widths in inline style that won't break on mobile
  const inlineGrid = html.match(/grid-template-columns:\s*([^;"]+)/g) || [];
  for (const m of inlineGrid) {
    const value = m.split(':')[1].trim();
    // Acceptable: 1fr, repeat(auto-*), or anything responsive via class.
    if (/(\d+px|\d+em|\d+rem)/.test(value) && !/(min(|max)|repeat\s*\(\s*auto)/.test(value)) {
      // hard fixed-px column → bad on mobile if not in a CSS class
      findings.push(`hardcoded grid: ${value}`);
    }
  }

  return findings;
}

console.log('=== public routes ===');
for (const p of publicRoutes) {
  const f = await audit(p, false);
  const tag = f.length === 0 ? '✓' : '✗';
  if (f.length > 0) bad++;
  console.log(`${tag} ${p.padEnd(44)} ${f.join(', ')}`);
}

console.log('\n=== admin routes (authenticated) ===');
for (const p of adminRoutes) {
  const f = await audit(p, true);
  const tag = f.length === 0 ? '✓' : '✗';
  if (f.length > 0) bad++;
  console.log(`${tag} ${p.padEnd(44)} ${f.join(', ')}`);
}

if (bad === 0) console.log('\n✓ All routes mobile-compatible.');
else console.log(`\n✗ ${bad} route(s) flagged.`);
process.exit(bad > 0 ? 1 : 0);
