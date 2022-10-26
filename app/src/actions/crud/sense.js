import { checkError } from '$lib/util';

export async function create({ entry_id, values }) {
  const res = await fetch(`/api/entry/${entry_id}/sense`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Could not create sense');
}

export async function update({ entry_id, sense_id, values }) {
  const res = await fetch(`/api/entry/${entry_id}/sense/${sense_id}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  await checkError(res, 'Could not update sense');
}

export async function DELETE({ entry_id, sense_id }) {
  const res = await fetch(`/api/entry/${entry_id}/sense/${sense_id}`, {
    method: 'DELETE',
  });
  await checkError(res, 'Could not delete sense');
}
