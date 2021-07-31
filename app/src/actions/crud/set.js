import { checkError } from '$lib/util';
import * as crud from '$actions/crud';

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
      await crud.update('set', { id: existingSetId, values: { members } });
    } else {
      await crud.create('set', { members });
    }
    onSuccess?.();
  } catch (e) {
    console.log(e);
  }
}

export async function merge({ id, sets }) {
  const res = await fetch(`/api/set/${id}/merge.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ sets }),
  });
  await checkError(res, 'Could not merge sets');
}
