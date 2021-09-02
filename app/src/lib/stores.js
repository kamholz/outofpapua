import { browser } from '$app/env';
import { cookieStorage, persist } from 'svelte-persistent-store';
import { defaultPreferences } from '$lib/preferences';
import { get, writable } from 'svelte/store';
import { session } from '$app/stores';

export const pageLoading = writable(0);

export function getPreferences() {
  const $session = get(session);
  if ($session.user) {
    const preferences = writable($session.preferences);
    let updating = false;
    preferences.subscribe(($preferences) => {
      if (updating) {
        syncPreferences($preferences);
      } else {
        updating = true;
      }
    });
    return preferences;
  } else if (browser) {
    const preferences = persist(writable(defaultPreferences), cookieStorage(), 'preferences');
    preferences.update((v) => ({ ...defaultPreferences, ...v }));
    return preferences;
  } else {
    return writable({ ...defaultPreferences, ...session.preferences });
  }
}

function syncPreferences($preferences) {
  return fetch('/api/user/preferences.json', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify($preferences),
  });
}
