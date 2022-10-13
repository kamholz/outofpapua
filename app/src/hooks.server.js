import config from '$config';
import { defaultPreferences } from '$lib/preferences';
import { knex } from '$lib/db';
import { showPublicOnly } from '$lib/util';
import * as auth from '$lib/auth';

export async function handle({ event, resolve }) {
  const { cookies, locals, url } = event;

  locals.user = await auth.getUserFromAccessToken(cookies.get(auth.ACCESS_TOKEN_COOKIE));

  // silent refresh
  if (!locals.user && cookies.get(auth.REFRESH_TOKEN_COOKIE) && url.pathname !== '/auth/refresh') {
    return auth.redirectToRefresh(url);
  }

  locals.preferences = defaultPreferences;

  if (locals.user) {
    const row = await knex('usr')
      .where('id', locals.user.id)
      .first('preferences');
    if (row && row.preferences) {
      Object.assign(locals.preferences, row.preferences);
    }
  } else {
    const preferences = cookies.get('preferences');
    if (preferences) {
      try {
        Object.assign(locals.preferences, JSON.parse(preferences));
      } catch (e) {}
    }
  }

  locals.hideComparative = showPublicOnly(locals) && config.HIDE_COMPARATIVE === '1';

  for (const [key, value] of Object.entries(event.params)) {
    if (/(?:^|_)id$/.test(key)) {
      event.params[key] = Number(value);
    }
  }

  return resolve(event);
}
