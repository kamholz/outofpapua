import config from '$config';
import cookie from 'cookie';
import { defaultPreferences } from '$lib/preferences';
import { knex } from '$lib/db';
import * as auth from '$lib/auth';

export async function handle({ request, resolve }) {
  const { headers, locals } = request;

  const cookies = cookie.parse(headers.cookie || '');
  locals.user = await auth.verifyAccessTokenCookie(cookies);

  // silent refresh
  if (!locals.user && cookies.refreshtoken && request.path !== '/auth/refresh') {
    return auth.redirectToRefresh(request);
  }

  locals.preferences = defaultPreferences;

  if (locals.user) {
    const row = await knex('usr')
      .where('id', locals.user.id)
      .first('preferences');
    if (row && row.preferences) {
      Object.assign(locals.preferences, row.preferences);
    }
  } else if (cookies.preferences) {
    try {
      Object.assign(locals.preferences, JSON.parse(cookies.preferences));
    } catch (e) {}
  }

  locals.hideComparative = !locals.user && config.HIDE_COMPARATIVE === '1';

  return resolve(request);
}

export function getSession({ locals }) {
  return {
    hideComparative: locals.hideComparative,
    preferences: locals.preferences,
    user: locals.user,
  };
}
