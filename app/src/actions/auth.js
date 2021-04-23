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

export function requireAuthLoad(handler) {
  handler = handler ?? (() => ({}));
  return (req) => {
    if (!req.session.user) {
      return { status: 401, error: 'Unauthorized' };
    }
    return handler(req);
  }
}

export async function updatePassword(userId, values) {
  const res = await fetch(`/api/users/${userId}-password.json`, {
    method: 'POST',
    body: new URLSearchParams(values),
  });
  if (!res.ok) {
    let error;
    try {
      error = (await res.json()).error;
    } catch (err) {
      throw 'Password change failed';
    }
    throw `Password change failed: ${error}`;
  }
}