import config from '$config';
import * as auth from '$db/auth';

export async function post({ body }) {
  let status = 401;
  const headers = {};
  const resBody = {};

  if (body.has('username') && body.has('password')) {
    const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
    if (user) {
      const accessToken = auth.makeAccessToken(user.id);
      const refreshToken = auth.makeAndStoreRefreshToken(user.id);

      status = 200;
      headers['set-cookie'] = [auth.makeAccessTokenCookie(accessToken), auth.makeRefreshTokenCookie(refreshToken)];
      resBody.session = {
        fullname: user.fullname,
        admin: user.admin
      };
    }
  }

  return {
    status,
    headers,
    body: resBody
  };
}
