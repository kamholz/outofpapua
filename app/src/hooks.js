import config from '$config';
import cookie from 'cookie';
import { defaultPreferences } from '$lib/preferences';
import { knex } from '$lib/db';
import { showPublicOnly } from '$lib/util';
import * as auth from '$lib/auth';

export async function handle({ event, resolve }) {
  const { locals, request: { headers }, url } = event;

  const cookies = cookie.parse(headers.get('cookie') || '');
  locals.user = await auth.verifyAccessTokenCookie(cookies);

  // silent refresh
  if (!locals.user && cookies.refreshtoken && url.pathname !== '/auth/refresh') {
    return new Response(null, auth.redirectToRefresh(url));
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

  locals.hideComparative = showPublicOnly(locals) && config.HIDE_COMPARATIVE === '1';

  return resolve(event, {
    ssr: !url.pathname.match(/\/map$/),
  });
}

export function getSession({ locals }) {
  return {
    hideComparative: config.HIDE_COMPARATIVE === '1',
    preferences: locals.preferences,
    user: locals.user,
  };
}
