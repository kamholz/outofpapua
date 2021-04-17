import cookie from 'cookie';
import * as auth from '$lib/auth';

export function get({ headers }) {
  let status = 401;
  const resHeaders = {};

  const cookies = cookie.parse(headers.cookie || '');
  if (cookies.refreshtoken) {
    const userId = auth.verifyRefreshToken(cookies.refreshtoken);
    if (userId) {
      status = 200;
      resHeaders['set-cookie'] = auth.makeAccessTokenCookie(auth.makeAccessToken(userId));
    }
  }

  return {
    status,
    resHeaders,
    body: ""
  };
}
