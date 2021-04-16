import config from '$config';
import * as auth from '$lib/auth';

export async function post({ body }) {
  let status = 401;
  const headers = {};
  const resBody = {};

  if (body.has('username') && body.has('password')) {
    const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
    if (user) {
      status = 200;
      headers['set-cookie'] = [
        auth.makeAccessTokenCookie(auth.makeAccessToken(user.id)),
        auth.makeRefreshTokenCookie(auth.makeRefreshToken(user.id))
      ];
      resBody.user = user;
    }
  }

  return {
    status,
    headers,
    body: resBody
  };
}
