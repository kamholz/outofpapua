import config from '$config';

export function load({ locals, url }) {
  return {
    hideComparative: config.HIDE_COMPARATIVE === '1',
    preferences: locals.preferences,
    url: url.pathname,
    user: locals.user,
  };
}
