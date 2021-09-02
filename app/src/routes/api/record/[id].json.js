import { filterPublicSources, knex } from '$lib/db';
import { validateParams } from '$lib/util';

export const get = validateParams(async ({ locals, params }) => {
  const q = knex('record_with_source as record')
    .join('source', 'source.id', 'record.source_id')
    .where('record.id', Number(params.id))
    .first(
      'record.id',
      'record.data',
      'record.page_num',
      'record.source_id',
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
