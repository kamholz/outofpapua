import { browser } from '$app/env';
import { cookieStorage, persist } from 'svelte-persistent-store';
import { defaultPreferences } from '$lib/preferences';
import { readable, writable } from 'svelte/store';

export const pageLoading = writable(0);

export function getPreferences(session) {
  if (session.user) {
    const preferences = writable(session.preferences);
    return {
      subscribe: preferences.subscribe,
      set: ($preferences) => {
        preferences.set($preferences);
        syncPreferences($preferences);
      },
      update: (toUpdate) => {
        preferences.update(($preferences) => ({ ...$preferences, ...toUpdate }));
        syncPreferences(toUpdate);
      },
    };
  } else if (browser) {
    const preferences = persist(writable(defaultPreferences), cookieStorage(), 'preferences');
    preferences.update(($preferences) => ({ ...defaultPreferences, ...$preferences }));
    return {
      subscribe: preferences.subscribe,
      set: preferences.set,
      update: (toUpdate) => preferences.update(($preferences) => ({ ...$preferences, ...toUpdate })),
      delete: preferences.delete,
    };
  } else {
    return readable({ ...defaultPreferences, ...session.preferences });
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
