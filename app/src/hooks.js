import cookie from 'cookie';
import * as auth from '$lib/auth';

export function getSession({ locals }) {
  return {
    user: locals.user,
  };
}

export async function handle({ request, render }) {
  const { headers, locals, params } = request;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value.match(/^[0-9]+$/)) {
        return { status: 400, body: { error: `invalid ${key}` } };
      }
    }
  }

  const cookies = cookie.parse(headers.cookie || '');
  locals.user = await auth.verifyAccessTokenCookie(cookies);

  // silent refresh
  if (!locals.user && cookies.refreshtoken && request.path !== '/auth/refresh') {
    return auth.redirectToRefresh(request);
  }

  return render(request);
}
