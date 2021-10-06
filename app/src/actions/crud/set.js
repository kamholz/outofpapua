import { checkError } from '$lib/util';
import * as crud from '$actions/crud';

export async function linkEntries(entries, onSuccess) {
  if (!entries.length) {
    return;
  }

  let existingSetId = null;
  const setsList = entries.map((entry) => entry.sets).filter((sets) => sets);
  if (setsList.length) {
    const setIds = new Set(setsList.flat());
    if (setIds.size === 1) {
      [existingSetId] = [...setIds];
    } else {
      for (const setId of setIds) {
        if (setsList.every((v) => v.includes(setId))) {
          if (existingSetId) {
            throw new Error('Could not link entries: they belong to multiple sets, not sure what to do');
          } else {
            existingSetId = setId;
          }
        }
      }
    }
  }

  if (existingSetId && entries.every((v) => v.sets?.includes(existingSetId))) {
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
