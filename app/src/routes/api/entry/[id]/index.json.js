import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams, mungeHeadword, validateParams } from '$lib/util';
import { filterPublicSources, knex, sendPgError, transaction } from '$lib/db';
import { isEditable, nfc } from '../_params';
import { requireAuth } from '$lib/auth';

const allowedAll = new Set(['headword_normalized', 'note', 'origin', 'origin_language_id', 'root']);
const allowedEditable = new Set([...allowedAll, 'headword', 'source_id']);

export const get = validateParams(async ({ locals, params }) => {
  const q = knex('entry_with_senses_full as entry')
    .join('source', 'source.id', 'entry.source_id')
    .where('entry.id', params.id)
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
});

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const { id } = params;
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
  if ('headword' in updateParams) {
    const source = await knex.first(
      knex.raw(
        'exists ? as proto',
        knex('source')
          .select('source.id')
          .join('protolanguage', 'protolanguage.id', 'source.language_id')
      )
    );
    updateParams.headword = mungeHeadword(updateParams.headword, source.proto);
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await transaction(locals, (trx) =>
      trx('entry')
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
}));

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  try {
    const { id } = params;
    const editable = await isEditable(id);
    if (!editable) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    const ids = await transaction(locals, async (trx) => {
      await trx('sense')
        .where('entry_id', id)
        .del();
      return trx('entry')
        .where('id', id)
        .returning('id')
        .del();
    });
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
