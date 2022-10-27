import { error, json } from '@sveltejs/kit';

import * as auth from '$lib/auth';

export async function POST({ cookies, request }) {
  const body = await request.formData();
  if (!(body.has('username') && body.has('password'))) {
    throw error(400);
  }

  const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
  if (user) {
    cookies.set(auth.ACCESS_TOKEN_COOKIE, auth.makeAccessToken(user), auth.ACCESS_TOKEN_OPTIONS);
    cookies.set(auth.REFRESH_TOKEN_COOKIE, auth.makeRefreshToken(user), auth.REFRESH_TOKEN_OPTIONS);
    return json({ user });
  } else {
    throw error(403);
  }
}
