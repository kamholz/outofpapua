import * as auth from '$lib/auth';

export function GET({ cookies }) {
  cookies.delete(auth.ACCESS_TOKEN_COOKIE, auth.ACCESS_TOKEN_OPTIONS);
  cookies.delete(auth.REFRESH_TOKEN_COOKIE, auth.REFRESH_TOKEN_OPTIONS);
  return new Response(null, {
    headers: {
      'cache-control': 'no-store',
    },
  });
}
