import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { isEditable, nfc, table } from '../_params';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowedAll = new Set(['headword_normalized', 'note', 'root']);
const allowedEditable = new Set([...allowedAll, 'headword', 'source_id']);

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
  const editable = await isEditable(id);
  const updateParams = getFilteredParams(body, editable ? allowedEditable : allowedAll);
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
    const editable = await isEditable(id);
    if (!editable) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    const ids = await transaction(locals, async (trx) => {
      await trx('sense')
        .where('entry_id', id)
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
