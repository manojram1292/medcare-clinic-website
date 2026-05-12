#!/usr/bin/env node
// Local helper: creates the storage bucket, an admin auth user, and the
// admins table row in one shot. Reads .env.local for credentials.
//
// Usage: node scripts/setup-admin.mjs <email> <password>

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvLocal() {
  const path = resolve(root, '.env.local');
  let raw;
  try { raw = readFileSync(path, 'utf8'); }
  catch { fail('.env.local not found at ' + path); }
  const out = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/setup-admin.mjs <email> <password>');
  process.exit(1);
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || url.includes('YOUR-')) fail('NEXT_PUBLIC_SUPABASE_URL not set in .env.local');
if (!service || service.includes('YOUR-')) fail('SUPABASE_SERVICE_ROLE_KEY not set in .env.local');

const supa = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Storage bucket
console.log('→ Ensuring storage bucket "media"…');
{
  const { data: buckets } = await supa.storage.listBuckets();
  const exists = (buckets ?? []).some((b) => b.name === 'media');
  if (exists) {
    console.log('  · already exists');
  } else {
    const { error } = await supa.storage.createBucket('media', { public: true });
    if (error) fail('createBucket: ' + error.message);
    console.log('  · created');
  }
}

// 2. Auth user
console.log(`→ Ensuring admin auth user (${email})…`);
let userId;
{
  const { data, error } = await supa.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) {
    // Maybe already exists — look it up.
    if (/already.*registered|exists/i.test(error.message)) {
      const { data: list } = await supa.auth.admin.listUsers();
      const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) fail('User exists but could not be found: ' + error.message);
      userId = found.id;
      console.log('  · already exists, id ' + userId);
    } else {
      fail('createUser: ' + error.message);
    }
  } else {
    userId = data.user.id;
    console.log('  · created, id ' + userId);
  }
}

// 3. Admins row
console.log('→ Inserting admins row…');
{
  const { error } = await supa.from('admins').upsert({ id: userId });
  if (error) fail('admins.insert: ' + error.message);
  console.log('  · ok');
}

console.log('\n✓ Setup complete.');
console.log('  Log in at http://localhost:3000/admin/login');
console.log('  with: ' + email);
