import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { nfc } from './_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['name', 'parent_id', 'note']);

export const put = requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await transaction(locals, (trx) =>
      trx('language')
      .where('id', Number(params.id))
      .returning('id')
      .update(updateParams)
    );
    if (rows.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ locals, params }) => {
  try {
    const id = Number(params.id);
    const ids = await transaction(locals, (trx) =>
      trx('language')
      .where('id', id)
      .whereExists(function () {
        this.select('*').from('protolanguage').where('protolanguage.id', id);
      })
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
