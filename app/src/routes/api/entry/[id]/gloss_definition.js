import errors from '$lib/errors';
import { getFilteredParams, validGlossesOrDefinitions } from '$lib/util';
import { isEditable } from '../_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['definition', 'gloss']);

export const put = requireAuth(async ({ body, locals, params }) => {
  const entryId = Number(params.id);
  const editable = await isEditable(entryId);
  if (!editable) {
    return { status: 400, body: { error: errors.editableEntry } };
  }
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    await transaction(locals, async (trx) => {
      let senseId;
      let deleteExisting;
      const senseIds = await trx('sense')
        .where('entry_id', entryId)
        .pluck('id');
      if (senseIds.length === 1) {
        [senseId] = senseIds;
        deleteExisting = true;
      } else if (senseIds.length === 0) {
        const ids = await trx('sense')
          .returning('id')
          .insert({ entry_id: entryId });
        [senseId] = ids;
        deleteExisting = false;
      } else {
        throw 'entry has more than one sense, not sure what to do';
      }
      if (updateParams.gloss) {
        await performUpdate('gloss', trx, senseId, updateParams, deleteExisting);
      }
      if (updateParams.definition) {
        await performUpdate('definition', trx, senseId, updateParams, deleteExisting);
      }
    });
    return { body: '' };
  } catch (e) {
    if (typeof e === 'string') {
      return { status: 400, error: e };
    } else {
      console.log(e);
      return sendPgError(e);
    }
  }
});

async function performUpdate(type, trx, senseId, params, deleteExisting) {
  const param = params[type];
  if (!validGlossesOrDefinitions(param)) {
    throw `malformed "${type}" parameter`;
  }
  for (const [i, obj] of param.entries()) {
    obj.txt = obj.txt.normalize();
    obj.seq = i + 1;
  }
  const table = `sense_${type}`;
  if (deleteExisting) {
    await trx(table)
    .where('sense_id', senseId)
    .del();
  }
  await trx(table)
    .insert(param);
}
