import errors from '$lib/errors';
import { getFilteredParams, isId, jsonError, normalizeQuery } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['protolang']);
const required = new Set(['protolang']);

const name_auto = "coalesce(sd.name_auto ->> 'txt', sd.id::text)";

function headwordSubselect(id) {
  return `(select jsonb_path_query(sd.members, '$\\?(@.language.id == ${id}).entry.headword') #>> '{}' ORDER BY 1 LIMIT 1)`;
}

export const GET = requireAuth(async ({ url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  if (!isId(query.protolang)) {
    return jsonError('protolang is not a valid id');
  }

  try {
    const response = await knex.transaction(async (trx) => {
      const language = await trx('language')
        .where('language.id', query.protolang)
        .join('protolanguage', 'protolanguage.id', 'language.id')
        .first(
          'language.id',
          'language.name',
          'language.ancestors',
          'language.descendants',
        );
      if (!language) {
        throw new Error('protolang not found');
      }

      const sets = await trx('set')
        .join('set_details_cached as sd', 'sd.id', 'set.id')
        .select(
          'set.id',
          knex.raw(`${name_auto} as set_name`),
          'set.set_group_id',
          'sd.author_name',
          'sd.members',
          knex.raw(`${headwordSubselect(language.id)} as headword`)
        )
        .whereExists(
          knex('set_member')
            .where('set_member.set_id', knex.ref('set.id'))
            .join('entry', 'entry.id', 'set_member.entry_id')
            .join('source', 'source.id', 'entry.source_id')
            .where('source.language_id', language.id)
        )
        .orderBy('headword')
        .orderBy(knex.raw("lpad(sd.id::text, 10, '0')"));

      return { language, sets };
    });

    return json(response);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
