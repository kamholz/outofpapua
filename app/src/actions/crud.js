export function makeCreater(type) {
  return async function(values) {
    const res = await fetch(`/api/${type}/create.json`, {
      method: 'POST',
      body: new URLSearchParams(values),
    });
    if (!res.ok) {
      throw new Error('Could not create');
    }
    return await res.json();
  }
}

export function makeUpdater(type) {
  return async function({ id, values }) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'PUT',
      body: new URLSearchParams(values),
    });
    if (!res.ok) {
      throw new Error('Could not update');
    }
  }
}

export function doUpdate(type) {
  const update = makeUpdater(type);
  return async (e) => {
    const { onSuccess } = e.detail;
    await update(e.detail);
    if (onSuccess) {
      onSuccess();
    }
  }
}

export function makeDeleter(type) {
  return async function(id) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Could not delete');
    }
  }
}