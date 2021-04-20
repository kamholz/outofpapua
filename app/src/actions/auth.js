import { session } from '$app/stores';

export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });

  if (res.ok) {
    const { user } = await res.json();
    session.update(v => ({...v, user}));
  } else {
    throw new Error('login failed');
  }
}

export async function logout() {
  await fetch('/auth/logout');
  session.update(v => ({...v, user: null}));
}
