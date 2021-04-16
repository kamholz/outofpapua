import cookie from 'cookie';
import config from '$config';
import * as auth from '$lib/auth';

export function getContext({ headers }) {
  const context = {
    userId: null
  };

  const cookies = cookie.parse(headers.cookie || '');
  if (cookies.accesstoken) {
    context.userId = auth.verifyAccessToken(cookies.accesstoken);
  }

  return context;
}

export function getSession({ context }) {
  return { userId: context.userId };
}
