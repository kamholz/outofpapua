import { error, json } from '@sveltejs/kit';
import { filterPublicSources, knex } from '$lib/db';

export async function GET({ locals, params }) {
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
    return json(row);
  } else {
    throw error(404);
  }
}
