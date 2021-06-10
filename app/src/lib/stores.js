import { browser } from '$app/env';
import { cookieStorage, persist } from 'svelte-persistent-store';
import { derived, writable } from 'svelte/store';
import { session } from '$app/stores';

export const pageLoading = writable(0);

const defaultPreferences = {
  hideglosslang: false,
  pagesize: 100,
};

export const preferences = browser
  ? persist(writable(defaultPreferences), cookieStorage(), 'preferences')
  : derived(session, ($session) => $session.preferences || defaultPreferences);
