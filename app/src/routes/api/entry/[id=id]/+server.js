import { ensureNfcParams, getFilteredParams, hideComparativeInEntry, mungeHeadword, showPublicOnly } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { isEditable, nfc } from '../params';
import { knex, pgError, setTransactionUser } from '$lib/db';
import { requireContributor } from '$lib/auth';

const allowedAll = new Set(['multi_set', 'origin', 'origin_language_id', 'root']);
const allowedEditable = new Set([...allowedAll, 'headword', 'source_id']);

export async function GET({ locals, params }) {
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
      'entry.senses',
      'ed.source',
      'ed.language'
    );
  const row = await q;
  if (row) {
    if (locals.hideComparative) {
      hideComparativeInEntry(row);
    }
    return json(row);
  } else {
    throw error(404);
  }
}

export const PUT = requireContributor(async ({ locals, params, request }) => {
  const { id } = params;
  const editable = await isEditable(id);
  const updateParams = getFilteredParams(await request.json(), editable ? allowedEditable : allowedAll);
  if (!Object.keys(updateParams).length) {
    return jsonError(errorStrings.noUpdatable);
  }
  if ('origin' in updateParams && updateParams.origin !== 'borrowed') {
    if (updateParams.origin_language_id) {
      return jsonError(errorStrings.originLang);
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
    const found = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const rows = await trx('entry')
        .where('id', id)
        .returning('id')
        .update(updateParams);
      const found = rows.length;
      if (found) {
        await trx.raw('select repopulate_set_details_cached_for_entry(?)', [id]);
      }
      return found;
    });
    if (found) {
      return new Response(null);
    } else {
      throw error(404);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireContributor(async ({ locals, params }) => {
  try {
    const { id } = params;
    const editable = await isEditable(id);
    if (!editable) {
      return jsonError(errorStrings.editableEntry);
    }
    const rows = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      await trx('sense')
        .where('entry_id', id)
        .del();
      return trx('entry')
        .where('id', id)
        .returning('id')
        .del();
    });
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
