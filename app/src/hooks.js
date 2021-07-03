import cookie from 'cookie';
import { defaultPreferences } from '$lib/preferences';
import * as auth from '$lib/auth';

export async function handle({ request, resolve }) {
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

  if (cookies.preferences) {
    try {
      locals.preferences = JSON.parse(cookies.preferences);
    } catch (e) {}
  }
  locals.preferences ||= defaultPreferences;

  return resolve(request);
}

export function getSession({ locals }) {
  return {
    preferences: locals.preferences,
    user: locals.user,
  };
}
