import { writable } from 'svelte/store';
import { writable as writableLocalStorage } from 'svelte-local-storage-store';

export const pageLoading = writable(0);

export const preferences = writableLocalStorage('preferences', {
  pagesize: 100,
});
