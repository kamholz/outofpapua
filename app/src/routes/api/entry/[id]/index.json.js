import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { filterPublicSources, knex, sendPgError, transaction } from '$lib/db';
import { isEditable, nfc, table } from '../_params';
import { requireAuth } from '$lib/auth';

const allowedAll = new Set(['headword_normalized', 'note', 'origin', 'origin_language_id', 'root']);
const allowedEditable = new Set([...allowedAll, 'headword', 'source_id']);

export async function get({ locals, params }) {
  const q = knex('entry_with_senses_full as entry')
    .join('source', 'source.id', 'entry.source_id')
    .where('entry.id', Number(params.id))
    .first(
      'entry.id',
      'entry.headword',
      'entry.headword_normalized',
      'entry.root',
      'entry.note',
      'entry.origin',
      'entry.origin_language_id',
      'entry.origin_language_name',
      'entry.senses',
      'source.reference as source_reference'
    );
  filterPublicSources(q, locals);
  const row = await q;
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
}

export const put = requireAuth(async ({ body, locals, params }) => {
  const id = Number(params.id);
  const editable = await isEditable(id);
  const updateParams = getFilteredParams(body, editable ? allowedEditable : allowedAll);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  if ('origin' in updateParams && updateParams.origin !== 'borrowed') {
    if (updateParams.origin_language_id) {
      return { status: 400, body: { error: errors.originLang } };
    }
    updateParams.origin_language_id = null; // clear any existing origin_language_id
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
