import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { isProto, nfc, table } from '../_params';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowedAll = new Set(['headword_normalized', 'note', 'root']);
const allowedProto = new Set([...allowedAll, 'headword', 'source_id']);

export async function get({ params }) {
  const row = await knex('entry_with_senses_full as entry')
    .join('source', 'source.id', 'entry.source_id')
    .where('entry.id', Number(params.id))
    .first(
      'entry.id',
      'entry.headword',
      'entry.headword_normalized',
      'entry.root',
      'entry.note',
      'entry.senses',
      'source.reference as source_reference'
    );
  if (row) {
    return { body: row };
  }
}
export const put = requireAuth(async ({ body, locals, params }) => {
  const id = Number(params.id);
  const proto = await isProto(id);
  const updateParams = getFilteredParams(body, proto ? allowedProto : allowedAll);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await transaction(locals, (trx) =>
      trx(table)
      .where('id', id)
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
    const proto = await isProto(id);
    if (!proto) {
      return { status: 400, body: { error: 'can only delete entries from protolanguage sources' } };
    }
    const ids = await transaction(locals, (trx) => {
      trx('sense')
        .where({ entry_id: id })
        .del();
      return trx(table)
        .where('id', id)
        .returning('id')
        .del();
    });
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
