import { makeExpiredCookies } from '$lib/auth';

export function get() {
  return {
    status: 200,
    headers: {
      'set-cookie': makeExpiredCookies(),
      'cache-control': 'no-store',
    },
  };
}
