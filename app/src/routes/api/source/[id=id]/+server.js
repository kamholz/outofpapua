import errors from '$lib/errors';
import { allowed, allowedEditor, nfc } from '../params';
import { ensureNfcParams, getFilteredParams, isEditor, jsonError } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { filterPublicSources, knex, pgError } from '$lib/db';
import { requireAdmin, requireAuth } from '$lib/auth';

const columns = [
  'source.id',
  'source.reference',
  'source.reference_full',
  'source.language_id',
  'source.note',
  'source.editable',
  'language.name as language_name',
  knex.raw('protolanguage.id is not null as is_proto'),
];
const columnsLoggedIn = columns.concat('source.formatting', 'source.ipa_conversion_rule', 'source.public',
  'source.use_ph_for_ipa');

export async function GET({ locals, params }) {
  const q = knex('source')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .leftJoin('entry', 'entry.source_id', 'source.id')
    .count('entry.id as numentries')
    .where('source.id', params.id)
    .first(locals.user ? columnsLoggedIn : columns)
    .groupBy('source.id', 'protolanguage.id', 'language.name');
  filterPublicSources(q, locals);
  const row = await q;
  if (row) {
    return json(row);
  } else {
    throw error(404);
  }
}

export const PUT = requireAuth(async ({ locals, params, request }) => {
  const updateParams = getFilteredParams(await request.json(), isEditor(locals.user) ? allowedEditor : allowed);
  if (!Object.keys(updateParams).length) {
    return jsonError(errors.noUpdatable);
  }
  ensureNfcParams(params, nfc);
  try {
    if ('language_id' in updateParams && !isEditor(locals.user)) {
      const editable = await knex('source')
        .where('id', params.id)
        .whereRaw('editable')
        .first('id');
      if (!editable) {
        return jsonError('contributors can only modify language of proto-language sources');
      }
      const proto = await knex('protolanguage')
        .where('id', params.language_id)
        .first('id');
      if (!proto) {
        return jsonError('contributors can only change source language to a proto-language');
      }
    }

    const rows = await knex.transaction((trx) =>
      trx('source')
      .where('id', params.id)
      .returning('id')
      .update(updateParams)
    );
    if (rows.length) {
      return new Response(null);
    } else {
      throw error(404);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireAdmin(() => {
  throw error(500);
});
// try {
//   const rows = await knex.transaction(async (trx) => {
//     await trx.column(trx.raw('delete_source_entries(?)', params.id));
//     return trx('source')
//     .where('id', params.id)
//     .returning('id')
//     .del();
//   });
//   return json({ deleted: rows.length });
// } catch (e) {
//   console.log(e);
//   return pgError(e);
// }
