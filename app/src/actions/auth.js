export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });

  if (res.ok) {
    const { user } = await res.json();
    return user;
  }

  throw new Error('login failed');
}

export async function logout() {
  return fetch('/auth/logout');
}
