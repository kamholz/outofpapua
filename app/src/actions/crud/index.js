import { checkError, serializeQuery } from '$lib/util';

export function makeGetter(type) {
  return async function (id, query) {
    let url = `/api/${type}/${id}.json`;
    if (query) {
      url += serializeQuery(query);
    }
    const res = await fetch(url);
    await checkError(res, 'Could not fetch');
    return res.json();
  };
}

export function get(type, ...args) {
  return makeGetter(type)(...args);
}

export function makeCreater(type) {
  return async function (values) {
    const res = await fetch(`/api/${type}`, {
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
    const res = await fetch(`/api/${type}/${id}`, {
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
    const res = await fetch(`/api/${type}/${id}`, {
      method: 'DELETE',
    });
    await checkError(res, 'Could not delete');
  };
}

export function del(type, ...args) {
  return makeDeleter(type)(...args);
}
