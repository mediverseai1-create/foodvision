import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Refreshes the Supabase session cookie and gates /app routes. Authorization is still enforced by RLS. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isApp = request.nextUrl.pathname.startsWith('/app');
  if (!url || !key) {
    return isApp ? NextResponse.redirect(new URL('/sign-in?error=not_configured', request.url)) : response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (isApp && !data.user) {
    const to = new URL('/sign-in', request.url);
    to.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = { matcher: ['/app/:path*', '/sign-in', '/sign-up'] };
