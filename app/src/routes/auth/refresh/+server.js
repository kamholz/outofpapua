import * as auth from '$lib/auth';

import { error } from '@sveltejs/kit';

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;

function handler({ cookies, url }) {
  let status;
  const headers = {};
  const { searchParams } = url;
  if (searchParams.has('redirect')) {
    status = 302;
    headers.location = `${url.protocol}//${url.host}/`;
  } else {
    throw error(401);
  }

  const accessToken = auth.getAccessTokenFromRefreshToken(cookies.get(auth.REFRESH_TOKEN_COOKIE));
  if (accessToken) {
    cookies.set(auth.ACCESS_TOKEN_COOKIE, accessToken, auth.COOKIE_OPTIONS);
    if (searchParams.has('redirect')) {
      headers.location = searchParams.get('redirect');
    } else {
      status = 200;
    }
  } else {
    cookies.delete(auth.ACCESS_TOKEN_COOKIE, auth.COOKIE_OPTIONS);
    cookies.delete(auth.REFRESH_TOKEN_COOKIE, auth.COOKIE_OPTIONS);
  }

  return new Response(null, { status, headers });
}
