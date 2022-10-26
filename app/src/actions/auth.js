import { checkError } from '$lib/util';
import { error } from '@sveltejs/kit';
import { page } from '$app/stores';

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
    return user;
  } else {
    throw new Error('login failed');
  }
}

export async function logout() {
  const res = await fetch('/auth/logout');
  if (!res.ok) {
    throw new Error('logout error');
  }
}

export function requireAuthLoad(handler) {
  handler = handler ?? (() => ({}));
  return async (req) => {
    const { user } = await req.parent();
    if (!user) {
      throw error(401);
    }
    return handler(req);
  };
}

export function requireAdminLoad(handler) {
  handler = handler ?? (() => ({}));
  return async (req) => {
    const { user } = await req.parent();
    if (!user?.admin) {
      throw error(401);
    }
    return handler(req);
  };
}

export async function updatePassword(userId, values) {
  if (values.current_password === undefined) {
    delete values.current_password;
  }
  const res = await fetch(`/api/user/${userId}-password`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Password change failed');
}
