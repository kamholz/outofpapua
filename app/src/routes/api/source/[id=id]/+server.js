import { allowed, allowedEditor, nfc } from '../params';
import { ensureNfcParams, getFilteredParams, isEditor } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { filterPublicSources, knex, pgError } from '$lib/db';
import { requireAdmin, requireContributor } from '$lib/auth';

const columns = [
  'source.id',
  'source.reference',
  'source.reference_full',
  'source.language_id',
  'source.note',
  'source.editable',
  'source.ingestion_time',
  'language.name as language_name',
  knex.raw('protolanguage.id is not null as is_proto'),
];
const columnsLoggedIn = columns.concat('source.formatting', 'source.ipa_conversion_rule', 'source.public',
  'source.use_ph_for_ipa');

const columnsDisallowedForEditable = ['ipa_conversion_rule', 'use_ph_for_ipa'];

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

export const PUT = requireContributor(async ({ locals, params, request }) => {
  const updateParams = getFilteredParams(await request.json(), isEditor(locals.user) ? allowedEditor : allowed);
  if (!Object.keys(updateParams).length) {
    return jsonError(errorStrings.noUpdatable);
  }
  ensureNfcParams(params, nfc);
  try {
    const found = await knex.transaction(async (trx) => {
      const source = await trx('source')
        .where('id', params.id)
        .first(
          'editable',
          knex.raw('exists (select from protolanguage where id = source.language_id) as is_proto')
        )
        .forUpdate();
      if (!source) {
        return false;
      }

      if ('language_id' in updateParams && !isEditor(locals.user)) {
        if (!source.editable) {
          return jsonError('contributors can only modify language of proto-language sources');
        }
        if (!source.is_proto) {
          return jsonError('contributors can only change source language to a proto-language');
        }
      }

      if (source.editable) {
        for (const column of columnsDisallowedForEditable) {
          if (column in updateParams) {
            return jsonError(`"${column}" cannot be modified on editable sources`);
          }
        }
      }

      const rows = await trx('source')
        .where('id', params.id)
        .returning('id')
        .update(updateParams);
      return rows.length;
    });
    if (found instanceof Response) {
      return found;
    } else if (found) {
      if ('reference' in updateParams) {
        knex.raw('call repopulate_set_details_cached()').then(() => {});
      }
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
