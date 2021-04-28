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
  return rows.length ? { status: 200, body: rows[0] } : { status: 404 };
}

export const put = requireAuth(async ({ params, body }) => {
  const toUpdate = getFilteredParams(body, allowed);
  if (!Object.keys(toUpdate).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const rows = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update(toUpdate);
    return rows.length ? { status: 200, body: "" } : { status: 404 };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});