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
    if (onSuccess) {
      onSuccess();
    }
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

export async function linkEntries(entries, onSuccess) {
  if (!entries.length) {
    return;
  }
  const members = entries.map((v) => v.id);
  const existingSetId = entries.find((v) => v.set_id !== null)?.set_id;
  if (existingSetId && entries.every((v) => v.set_id === existingSetId)) {
    return;
  }
  try {
    if (existingSetId) {
      await update('set', { id: existingSetId, values: { members } });
    } else {
      await create('set', { members });
    }
    onSuccess?.();
  } catch (e) {
    console.log(e);
  }
}
