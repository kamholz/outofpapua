import { checkError } from '$lib/util';
import * as crud from '$actions/crud';

export async function linkEntries(entries, onSuccess) {
  if (!entries.length) {
    return;
  }

  let existingSetId = null;
  const setIdsList = entries.map((entry) => entry.set_ids).filter((setIds) => setIds);
  if (setIdsList.length) {
    const setIds = new Set(setIdsList.flat());
    if (setIds.size === 1) {
      [existingSetId] = [...setIds];
    } else {
      for (const setId of setIds) {
        if (setIdsList.every((v) => v.includes(setId))) {
          if (existingSetId) {
            throw new Error('Could not link entries: they belong to multiple sets, not sure what to do');
          } else {
            existingSetId = setId;
          }
        }
      }
    }
  }

  if (existingSetId && entries.every((v) => v.set_ids?.includes(existingSetId))) {
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

export async function linkSets(set, newSetId) {
  const { set_group_id } = set;
  if (set_group_id) {
    await crud.update('set', { id: newSetId, values: { set_group_id } });
  } else {
    await crud.create('set_group', { set_ids: [set.id, newSetId] });
  }
}

export async function merge({ id, set_ids }) {
  const res = await fetch(`/api/set/${id}/merge`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ set_ids }),
  });
  await checkError(res, 'Could not merge sets');
}
