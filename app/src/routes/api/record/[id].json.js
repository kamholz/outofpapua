import { filterPublicSources, knex } from '$lib/db';
import { validateParams } from '$lib/util';

export const get = validateParams(async ({ locals, params }) => {
  const q = knex('record')
    .join('record_source as rs', 'rs.id', 'record.id')
    .join('source', 'source.id', 'rs.source_id')
    .join('language', 'language.id', 'source.language_id')
    .where('record.id', params.id)
    .first(
      'record.id',
      'record.data',
      'record.page_num',
      knex.raw(`json_build_object(
        'id', source.id,
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
