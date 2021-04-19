import cookie from 'cookie';
import * as auth from '$data/auth';

export function get({ headers, query }) {
  const cookies = cookie.parse(headers.cookie || '');
  if (cookies.refreshtoken) {
    const userId = auth.verifyRefreshToken(cookies.refreshtoken);
    if (userId) {
      const output = {
        headers: {
         'set-cookie': auth.makeAccessTokenCookie(auth.makeAccessToken(userId)),
        },
        body: ""
      };

      if (query.has('redirect')) {
        output.status = 302;
        output.headers.location = query.get('redirect');
      } else {
        output.status = 200;
      }
      return output;
    }
  }

  return {
    status: 401,
    body: ""
  };
}
