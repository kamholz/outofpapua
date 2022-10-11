import { error, json } from '@sveltejs/kit';

import * as auth from '$lib/auth';

export async function POST({ request }) {
  const body = await request.formData();
  if (!(body.has('username') && body.has('password'))) {
    throw error(400);
  }

  const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
  if (user) {
    const headers = new Headers();
    headers.append('set-cookie', auth.makeAccessTokenCookie(user));
    headers.append('set-cookie', auth.makeRefreshTokenCookie(user));
    return json({ user }, { headers });
  } else {
    throw error(403);
  }
}
