import { knex } from '$lib/db';

export async function get({ params }) {
  const rows = await knex('record_with_source as record')
    .join('source', 'source.id', 'record.source_id')
    .where('record.id', params.id)
    .select(
      'record.id', 
      'record.data', 
      'record.source_id', 
      'source.title as source_title',
      'source.reference as source_reference'
    );
  if (rows.length) {
    return { body: rows[0] };
  }
}
