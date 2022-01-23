import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams, hideComparativeInEntry, mungeHeadword, showPublicOnly,
  validateParams } from '$lib/util';
import { isEditable, nfc } from '../_params';
import { knex, sendPgError, setTransactionUser } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowedAll = new Set(['multi_set', 'origin', 'origin_language_id', 'root']);
const allowedEditable = new Set([...allowedAll, 'headword', 'source_id']);

export const get = validateParams(async ({ locals, params }) => {
  const publicOnly = showPublicOnly(locals);
  const q = knex('entry')
    .join(`${publicOnly ? 'entry_details_public' : 'entry_details'} as ed`, 'ed.id', 'entry.id')
    .where('entry.id', params.id)
    .first(
      'entry.id',
      'entry.headword',
      'entry.headword_ipa',
      'entry.root',
      'entry.origin',
      'entry.origin_language_id',
      'ed.origin_language_name',
      'entry.record_id',
      'ed.senses',
      'ed.source',
      'ed.language'
    );
  const row = await q;
  if (row) {
    if (locals.hideComparative) {
      hideComparativeInEntry(row);
    }
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
});

export const put = validateParams(requireAuth(async ({ locals, params, request }) => {
  const { id } = params;
  const editable = await isEditable(id);
  const updateParams = getFilteredParams(await request.json(), editable ? allowedEditable : allowedAll);
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
    const rows = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('entry')
        .where('id', id)
        .returning('id')
        .update(updateParams);
    });
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
    const ids = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
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
