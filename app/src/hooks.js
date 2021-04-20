import cookie from 'cookie';
import * as auth from '$data/auth';

export async function getContext({ headers }) {
  const context = {
    user: null,
  };

  const cookies = cookie.parse(headers.cookie || '');
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
  const { context } = request;

  if (!context.user && context.haveRefreshToken && request.path !== '/auth/refresh') {
    return auth.redirectToRefresh(request);
  }

  return render(request);
}
