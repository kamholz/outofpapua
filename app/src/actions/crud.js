export function makeUpdater(type) {
  return async function({ id, values }) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'POST',
      body: new URLSearchParams(values),
    });
    if (!res.ok) {
      throw new Error('unknown error');
    }
  }
}

export function handleUpdate(type) {
  const updater = makeUpdater(type);
  return async (e) => {
    const { onSuccess } = e.detail;
    try {
      await updater(e.detail);
      if (onSuccess) {
        onSuccess();
      }
      return null;
    } catch (err) {
      //console.log(err);
      return err;
    }
  }
}
