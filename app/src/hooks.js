import cookie from 'cookie';
import * as auth from '$data/auth';

export function getContext({ headers }) {
  const context = {
    authed: false,
    admin: false,
  };

  const cookies = cookie.parse(headers.cookie || '');
  const authContext = auth.verifyAccessTokenCookie(cookies);
  if (authContext) {
    Object.assign(context, authContext);
  }

  return context;
}

export function getSession({ context }) {
  return {
    authed: context.authed,
    admin: context.admin,
  };
}
