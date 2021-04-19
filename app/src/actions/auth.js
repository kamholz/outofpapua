import { userSession } from '$stores';
import { pageUrl } from '$utils';

export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });

  if (res.ok) {
    const { user } = await res.json();
    userSession.update(v => ({...v, user}));
  } else {
    throw new Error('login failed');
  }
}

export async function logout() {
  await fetch('/auth/logout');
  userSession.update(v => ({...v, user: null}));
}

export function ensureAuthed(page, session) {
  return session.authed
    ?
      null
    :
      {
        status: 302,
        redirect: '/auth/refresh?' + new URLSearchParams({ redirect: pageUrl(page) }),
        body: ""
      };
}
