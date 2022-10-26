import * as auth from '$lib/auth';

import cookie from 'cookie';
import { error } from '@sveltejs/kit';

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;

function handler({ request: { headers: reqHeaders }, url }) {
  let status;
  const headers = {};
  const { searchParams } = url;
  if (searchParams.has('redirect')) {
    status = 302;
    headers.location = `${url.protocol}//${url.host}/`;
  } else {
    throw error(401);
  }

  const cookies = cookie.parse(reqHeaders.get('cookie') || '');
  const newCookie = auth.makeAccessTokenCookieFromRefreshToken(cookies);
  if (newCookie) {
    headers['set-cookie'] = newCookie;
    if (searchParams.has('redirect')) {
      headers.location = searchParams.get('redirect');
    } else {
      status = 200;
    }
  } else {
    headers['set-cookie'] = auth.makeExpiredCookies();
  }

  return new Response(null, { status, headers });
}
