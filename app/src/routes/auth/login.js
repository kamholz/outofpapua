import * as auth from '$lib/auth';
import { getParams } from '$lib/util';

export async function post({ body }) {
  body = getParams(body);
  if (!('username' in body && 'password' in body)) {
    return { status: 400 };
  }

  const user = await auth.checkUserPassword(body.username, body.password);
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
  } else {
    return { status: 401 };
  }
}
