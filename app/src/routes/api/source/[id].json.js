import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';
import errors from '$lib/errors';

const table = 'source';

export async function get({ params }) {
  const rows = await knex(table)
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .leftJoin('entry', 'entry.source_id', 'source.id')
    .count('entry.id as numentries')
    .where('source.id', params.id)
    .select(
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
  if (rows.length) {
    return { body: rows[0] };
  }
}

export const put = requireAuth(async ({ params, body }) => {
  const toUpdate = getFilteredParams(body, allowed);
  if (!Object.keys(toUpdate).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update(toUpdate);
    if (ids.length) {
      return { body: "" };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});