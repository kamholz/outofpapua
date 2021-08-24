import { checkError } from '$lib/util';
import * as crud from '$actions/crud';

export async function linkEntries(entries, onSuccess) {
  if (!entries.length) {
    return;
  }
  const sets = new Set(entries.filter((entry) => entry.set_id).map((entry) => entry.set_id));
  if (sets.size > 1) {
    throw new Error('Could not link entries: they belong to multiple sets, not sure what to do');
  }
  const [existingSetId] = [...sets];
  if (existingSetId && entries.every((v) => v.set_id === existingSetId)) {
    return;
  }
  const members = entries.map((v) => v.id);
  if (existingSetId) {
    await crud.update('set', { id: existingSetId, values: { members } });
  } else {
    await crud.create('set', { members });
  }
  onSuccess?.();
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
