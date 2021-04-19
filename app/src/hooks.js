import cookie from 'cookie';
import * as auth from '$data/auth';

export function getContext({ headers }) {
  const context = {
    authed: false
  };

  const cookies = cookie.parse(headers.cookie || '');
  if (cookies.accesstoken && auth.verifyAccessToken(cookies.accesstoken)) {
    context.authed = true;
  }

  return context;
}

export function getSession({ context }) {
  return {
    authed: context.authed
  };
}
