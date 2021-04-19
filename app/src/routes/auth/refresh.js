import cookie from 'cookie';
import * as auth from '$data/auth';

export function get({ headers, query, host }) {
  const output = query.has('redirect')
    ?
      {
        status: 302,
        headers: {
          location: `http://${host}/`,
        },
        body: ""
      }
    :
      {
        status: 401,
        headers: {},
        body: ""
      };

  const cookies = cookie.parse(headers.cookie || '');
  const cookie = auth.makeAccessTokenCookieFromRefreshToken(cookies);
  if (cookie) {
    output.headers['set-cookie'] = cookie;
    if (query.has('redirect')) {
      output.headers.location = query.get('redirect');
    } else {
      output.status = 200;
    }
  }

  return output;
}
