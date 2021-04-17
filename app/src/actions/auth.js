import { userSession } from '$stores';

export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });

  if (res.ok) {
    const { user } = await res.json();
    userSession.update(v => ({...v, user}));
  }

  throw new Error('login failed');
}

export async function logout() {
  await fetch('/auth/logout');
  userSession.update(v => ({...v, user: null}));
}
