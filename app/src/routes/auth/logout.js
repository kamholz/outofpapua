import * as auth from '$lib/auth';

export function get() {
  return {
    status: 200,
    headers: {
      'set-cookie': auth.makeExpiredCookies(),
      'cache-control': 'no-store',
    },
    body: ""
  };
}
