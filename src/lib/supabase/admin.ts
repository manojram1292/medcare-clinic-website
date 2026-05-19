import 'server-only';
import { createClient as createSupa } from '@supabase/supabase-js';

// Service-role client. The 'server-only' import above causes a build-time
// error if anything in a client bundle ever imports this module.
export function createAdminClient() {
  return createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
