import errors from '$lib/errors';
import { getFilteredParams, validGlossesOrDefinitions } from '$lib/util';
import { isProto } from '../_paramss';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['definition', 'gloss']);

export const put = requireAuth(async ({ body, locals, params }) => {
  const entryId = Number(params.id);
  const proto = await isProto(entryId);
  if (!proto) {
    return { status: 400, body: { error: 'can only update glosses and definitions for protolanguage sources' } };
  }
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const rows = await transaction(locals, async (trx) => {
      let senseId;
      const senseIds = await trx('sense')
        .where('entry_id', entryId)
        .pluck('id');
      if (senseIds.length === 1) {
        [senseId] = senseIds;
      } else if (senseIds.length === 0) {
        const ids = await trx('sense')
          .returning('id')
          .insert({ entry_id: entryId });
        [senseId] = ids;
      } else {
        return { status: 400, body: { error: 'entry has more than one sense, not sure what to do' } };
      }
      if (updateParams.gloss) {
        const error = await performUpdate('gloss', trx, senseId, updateParams);
        if (error) {
          return error;
        }
      }
      if (updateParams.definition) {
        const error = await performUpdate('definition', trx, senseId, updateParams);
        if (error) {
          return error;
        }
      }
    });
    if (rows.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

async function performUpdate(type, trx, senseId, params) {
  const param = params[type];
  if (!validGlossesOrDefinitions(param)) {
    return { status: 400, error: `malformed "${type}" parameter` };
  }
  for (const obj of param) {
    obj.txt = obj.txt.normalize();
  }
  const table = `sense_${type}`;
  await trx(table)
    .where({ sense_id: senseId })
    .del();
  await trx(table)
    .insert(param);
}
