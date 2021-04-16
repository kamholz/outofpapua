import { writable } from 'svelte-local-storage-store';

export const userSession = writable('userSession', {});
