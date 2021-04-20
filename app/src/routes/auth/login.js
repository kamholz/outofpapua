import * as auth from '$data/auth';

export async function post({ body }) {
  let status = 401;

  if (body.has('username') && body.has('password')) {
    const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
    if (user) {
      return {
        status: 200,
        headers: {
          'set-cookie': [
            auth.makeAccessTokenCookie(user),
            auth.makeRefreshTokenCookie(user),
          ]
        },
        body: { user }
      }
    }
  }

  return {
    status: 401,
    body: ""
  };
}
