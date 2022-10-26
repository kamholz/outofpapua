import { makeExpiredCookies } from '$lib/auth';

export function GET() {
  return new Response(null, {
    headers: {
      'set-cookie': makeExpiredCookies(),
      'cache-control': 'no-store',
    },
  });
}
