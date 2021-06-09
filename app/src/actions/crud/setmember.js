export async function create({ set_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    throw new Error('Could not create set member');
  }
}

export async function update({ set_id, entry_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member/${entry_id}.json`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    if (res.status === 400) {
      throw new Error('Could not update set member: ' + (await res.json()).error);
    } else {
      throw new Error('Could not update set member');
    }
  }
}

export async function del({ set_id, entry_id }) {
  const res = await fetch(`/api/set/${set_id}/member/${entry_id}.json`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Could not delete set member');
  }
}

export async function proto({ set_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member/proto.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    throw new Error('Could not add proto-form to set');
  }
}
