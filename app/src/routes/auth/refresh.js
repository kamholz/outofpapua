import * as auth from '$lib/auth';

import cookie from 'cookie';

export const get = handler;
export const post = handler;
export const put = handler;
export const del = handler;

function handler({ request: { headers }, url }) {
  const { searchParams } = url;
  const output = searchParams.has('redirect')
    ?
    {
      status: 302,
      headers: {
        location: `${url.protocol}//${url.host}/`,
      },
    }
    :
    {
      status: 401,
      headers: {},
    };

  const cookies = cookie.parse(headers.get('cookie') || '');
  const newCookie = auth.makeAccessTokenCookieFromRefreshToken(cookies);
  if (newCookie) {
    output.headers['set-cookie'] = newCookie;
    if (searchParams.has('redirect')) {
      output.headers.location = searchParams.get('redirect');
    } else {
      output.status = 200;
      output.body = '';
    }
  } else {
    output.headers['set-cookie'] = auth.makeExpiredCookies();
  }

  return output;
}
