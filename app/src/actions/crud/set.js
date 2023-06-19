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
      // in the case where multiple sets are found in the entries,
      // exactly one set must be shared across all entries that belong to a set
      for (const setId of setIds) {
        if (setIdsList.every((v) => v.includes(setId))) {
          if (existingSetId) {
            throw new Error('Could not link entries: they belong to multiple sets, not sure what to do');
          } else {
            existingSetId = setId;
          }
        }
      }

      if (!existingSetId) {
        throw new Error('Could not link entries: they belong to multiple sets, not sure what to do');
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

export async function linkSets(set, newSet) {
  if (set.set_group_id) { // add new set to current set's group
    await crud.update('set', { id: newSet.id, values: { set_group_id: set.set_group_id } });
  } else if (newSet.set_group_id) { // add current set to new set's group
    await crud.update('set', { id: set.id, values: { set_group_id: newSet.set_group_id } });
  } else { // create new group for both
    await crud.create('set_group', { set_ids: [set.id, newSet.id] });
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
