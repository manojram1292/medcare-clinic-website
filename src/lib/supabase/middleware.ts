import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR-')) return false;
  return true;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  if (!isConfigured()) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Gate /admin/** except the login page
  const url = new URL(request.url);
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isLogin = url.pathname.startsWith('/admin/login');

  if (isAdminRoute && !isLogin && !user) {
    const redirect = new URL('/admin/login', request.url);
    redirect.searchParams.set('next', url.pathname);
    return NextResponse.redirect(redirect);
  }

  if (isLogin && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}
