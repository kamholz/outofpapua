import cookie from 'cookie';
import * as auth from '$lib/auth';

export async function getContext({ headers }) {
  const context = {
    user: null,
  };

  const cookies = cookie.parse(headers.cookie || "");
  const user = await auth.verifyAccessTokenCookie(cookies);
  if (user) {
    context.user = user;
  }
  context.haveRefreshToken = cookies.refreshtoken ? true : false;

  return context;
}

export function getSession({ context }) {
  return {
    user: context.user,
  };
}

export function handle({ request, render }) {
  const { context, params } = request;

  // silent refresh
  if (!context.user && context.haveRefreshToken && request.path !== '/auth/refresh') {
    return auth.redirectToRefresh(request);
  }

  if (params && 'id' in params && !params.id.match(/^[0-9]+$/)) {
    return { status: 400, body: { error: 'invalid id' } };
  }

  return render(request);
}
