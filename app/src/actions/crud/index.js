import { checkError } from '$lib/util';

export function makeCreater(type) {
  return async function (values) {
    const res = await fetch(`/api/${type}.json`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    await checkError(res, 'Could not create');
    return res.json();
  };
}

export function create(type, ...args) {
  return makeCreater(type)(...args);
}

export function makeUpdater(type) {
  return async function ({ id, values }) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    await checkError(res, 'Could not update');
  };
}

export function update(type, ...args) {
  return makeUpdater(type)(...args);
}

export function updateFromCell(type) {
  const update = makeUpdater(type);
  return async (e) => {
    const { onSuccess } = e.detail;
    await update(e.detail);
    onSuccess?.();
  };
}

export function makeDeleter(type) {
  return async function (id) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'DELETE',
    });
    await checkError(res, 'Could not delete');
  };
}

export function del(type, ...args) {
  return makeDeleter(type)(...args);
}
