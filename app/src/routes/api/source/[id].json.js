import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';
import errors from '$lib/errors';

const table = 'source';

export async function get({ params }) {
  const row = await knex(table)
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .leftJoin('entry', 'entry.source_id', 'source.id')
    .count('entry.id as numentries')
    .where('source.id', params.id)
    .first(
      'source.id',
      'source.title',
      'source.reference',
      'source.reference_full',
      'source.language_id',
      'source.note',
      'language.name as language_name',
      knex.raw('protolanguage.id is not null as is_proto')
    )
    .groupBy('source.id', 'protolanguage.id', 'language.name');
  if (row) {
    return { body: row };
  }
}

export const put = requireAuth(async ({ params, body }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update(updateParams);
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
