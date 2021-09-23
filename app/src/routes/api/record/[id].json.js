import { filterPublicSources, knex } from '$lib/db';
import { validateParams } from '$lib/util';

export const get = validateParams(async ({ locals, params }) => {
  const q = knex('record_with_source as record')
    .join('source', 'source.id', 'record.source_id')
    .join('language', 'language.id', 'source.language_id')
    .where('record.id', params.id)
    .first(
      'record.id',
      'record.data',
      'record.page_num',
      'record.source_id',
      knex.raw(`json_build_object(
        'reference', source.reference,
        'language_name', language.name,
        'formatting', source.formatting
      ) as source`)
    );
  filterPublicSources(q, locals);
  const row = await q;
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
});
