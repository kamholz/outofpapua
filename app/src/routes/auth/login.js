import * as auth from '$lib/auth';

export async function post({ request }) {
  const body = await request.formData();
  if (!(body.has('username') && body.has('password'))) {
    return { status: 400 };
  }

  const user = await auth.checkUserPassword(body.get('username'), body.get('password'));
  if (user) {
    return {
      status: 200,
      headers: {
        'set-cookie': [
          auth.makeAccessTokenCookie(user),
          auth.makeRefreshTokenCookie(user),
        ],
      },
      body: { user },
    };
  } else {
    return { status: 401 };
  }
}
