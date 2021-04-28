import { applySortParams, knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { getFilteredParams, normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';
import errors from '$lib/errors';

const table = 'language';

const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  sort: 'name',
};
const sortCols = {
  name: 'lower(language.name)',
  iso6393: 'language.iso6393',
  is_proto: 'protolanguage.id is not null',
  parent_name: 'parent.name',
  numentries: 'count(entry.id)',
};
const strip = new Set(['category','numentries']);

export async function get({ query }) {
  query = normalizeQuery(query);
  parseBooleanParams(query, boolean);
  query = {...defaults, ...query};

  const q = knex(table)
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .select(
      'language.id',
      'language.name',
      'language.iso6393',
      'language.parent_id',
      'parent.name as parent_name',
      knex.raw('protolanguage.id is not null as is_proto')
    );

  if (query.category === 'descendants') {
    q
      .from('language_with_descendants as language')
      .select('language.descendants');
  }

  switch (query.category) {
    case 'borrowedfrom':
      q.whereRaw('language.flag_language_list or language.flag_borrowed_from');
      break;
    case 'gloss':
      q.whereRaw('language.flag_gloss_language');
      break;
    default:
      q.whereRaw('language.flag_language_list');
      break;
  }

  if ('numentries' in query) {
    q
      .leftJoin('source', 'source.language_id', 'language.id')
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('language.id', 'protolanguage.id', 'parent.name');
  }

  applySortParams(q, query, sortCols, ['name']);

  stripParams(query, strip);
  return {
    body: {
      query,
      rows: await q,
    }
  };
}

const required = new Set(['name']);

export const post = requireAuth(async ({ body }) => {
  const params = getFilteredParams(body, required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  try {
    const rows = await
      knex.with('inserted', q => {
        q.from(table)
        .returning('id')
        .insert(params);
      })
      .from('protolanguage')
      .returning('id')
      .insert(function () {
        this.select('id').from('inserted');
      });
    return rows.length ? { body: { id: rows[0] } } : { status: 500 };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});