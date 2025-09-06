import { browser } from '$app/environment';
import { createCookieStorage, persist } from '@macfja/svelte-persistent-store';
import { defaultPreferences } from '$lib/preferences';
import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';
import { showPublicOnly } from '$lib/util';

export const hideComparative = derived(page, ($page) => $page.data.hideComparative && showPublicOnly($page.data));
export const modal = writable(null);
export const pageLoading = writable(0);
export const session = writable({});
export const setSummaryCache = writable({});

export function getPreferences(data) {
  if (data.user) {
    const preferences = writable(data.preferences);
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
    const preferences = persist(writable(defaultPreferences), createCookieStorage(), 'preferences');
    preferences.update(($preferences) => ({ ...defaultPreferences, ...$preferences }));
    return {
      subscribe: preferences.subscribe,
      set: preferences.set,
      update: (toUpdate) => preferences.update(($preferences) => ({ ...$preferences, ...toUpdate })),
      delete: preferences.delete,
    };
  } else {
    return readable({ ...defaultPreferences, ...data.preferences });
  }
}

function syncPreferences($preferences) {
  return fetch('/api/user/preferences', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify($preferences),
  });
}
