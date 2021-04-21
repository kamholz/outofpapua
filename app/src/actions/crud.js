export function updater(type) {
  return async function({ id, row }) {
    const res = await fetch(`/api/${type}/${id}.json`, {
      method: 'POST',
      body: new URLSearchParams(row),
    });
    if (res.ok) {
      return;
    } else {
      let json;
      try {
        json = await res.json();
      } catch (e) {
        throw res;
      }
      throw json.message;
    }
  }
}
