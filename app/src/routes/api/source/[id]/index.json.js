import errors from '$lib/errors';
import { allowed, nfc, table } from '../_params';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export async function get({ params }) {
  const row = await knex(table)
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .leftJoin('entry', 'entry.source_id', 'source.id')
    .count('entry.id as numentries')
    .where('source.id', Number(params.id))
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

export const put = requireAuth(async ({ body, context, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  ensureNfcParams(params, nfc);
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
      .returning('id')
      .update(updateParams)
    );
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
