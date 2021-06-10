import { checkError } from '$lib/util';

export async function create({ set_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Could not create set member');
}

export async function update({ set_id, entry_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member/${entry_id}.json`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Could not update set member');
}

export async function del({ set_id, entry_id }) {
  const res = await fetch(`/api/set/${set_id}/member/${entry_id}.json`, {
    method: 'DELETE',
  });
  await checkError(res, 'Could not delete set member');
}

export async function proto({ set_id, values }) {
  const res = await fetch(`/api/set/${set_id}/member/proto.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Could not add proto-form to set');
}
