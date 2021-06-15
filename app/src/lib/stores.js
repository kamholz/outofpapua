import { browser } from '$app/env';
import { cookieStorage, persist } from 'svelte-persistent-store';
import { defaultPreferences } from '$lib/preferences';
import { derived, writable } from 'svelte/store';
import { session } from '$app/stores';

export const pageLoading = writable(0);
export const preferences = getPreferences();

function getPreferences() {
  if (browser) {
    const preferences = persist(writable(defaultPreferences), cookieStorage(), 'preferences');
    preferences.update((v) => ({ ...defaultPreferences, ...v }));
    return preferences;
  } else {
    return derived(session, ($session) => ({ ...defaultPreferences, ...$session.preferences }));
  }
}
