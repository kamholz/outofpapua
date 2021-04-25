import cookie from 'cookie';
import * as auth from '$lib/auth';

export function get({ headers, query, host }) {
  const output = query.has('redirect')
    ?
      {
        status: 302,
        headers: {
          location: `http://${host}/`,
        }
      }
    :
      {
        status: 401,
        headers: {}
      };

  const cookies = cookie.parse(headers.cookie || "");
  const newCookie = auth.makeAccessTokenCookieFromRefreshToken(cookies);
  if (newCookie) {
    output.headers['set-cookie'] = newCookie;
    if (query.has('redirect')) {
      output.headers.location = query.get('redirect');
    } else {
      output.status = 200;
    }
  } else {
    output.headers['set-cookie'] = auth.makeExpiredCookies();
  }

  return output;
}
