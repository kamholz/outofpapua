import config from '$config';

export function load({ locals }) {
  return {
    hideComparative: config.HIDE_COMPARATIVE === '1',
    preferences: locals.preferences,
    user: locals.user,
  };
}
