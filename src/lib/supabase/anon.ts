import { createClient as createSupa } from '@supabase/supabase-js';

// Cookie-less anon client. Use for build-time/static-param fetches that
// only read public data — never inside request handlers (those use
// `lib/supabase/server.ts` so RLS sees the logged-in user).
export function createAnonClient() {
  return createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
