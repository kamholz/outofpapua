export async function create(values) {
  const res = await fetch('/api/set.json', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values ?? {}),
  });
  if (!res.ok) {
    throw new Error('Could not create set');
  }
  return res.json();
}

export async function update({ id, values }) {
  const res = await fetch(`/api/set/${id}.json`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    if (res.status === 400) {
      throw new Error('Could not update set: ' + (await res.json()).error);
    } else {
      throw new Error('Could not update set');
    }
  }
}
