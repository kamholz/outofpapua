import { checkError } from '$lib/util';
import { session } from '$app/stores';

export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ username, password }),
  });

  if (res.ok) {
    const { user } = await res.json();
    session.update((v) => ({ ...v, user }));
  } else {
    throw new Error('login failed');
  }
}

export async function logout() {
  const res = await fetch('/auth/logout');
  if (res.ok) {
    session.update((v) => ({ ...v, user: null }));
  } else {
    throw new Error('logout error');
  }
}

export function requireAuthLoad(handler) {
  handler = handler ?? (() => ({}));
  return (req) => {
    if (!req.session.user) {
      return { status: 401 };
    }
    return handler(req);
  };
}

export function requireAdminLoad(handler) {
  handler = handler ?? (() => ({}));
  return (req) => {
    if (!req.session.user?.admin) {
      return { status: 401 };
    }
    return handler(req);
  };
}

export async function updatePassword(userId, values) {
  if (values.current_password === undefined) {
    delete values.current_password;
  }
  const res = await fetch(`/api/user/${userId}.password.json`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Password change failed');
}
