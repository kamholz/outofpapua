import errors from '$lib/errors';
import { applySortParams, knex, sendPgError } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, showPublicOnly,
  stripParams } from '$lib/util';
import { nfc, required } from './_params';
import { requireAuth } from '$lib/auth';

const boolean = new Set(['asc']);
const strip = new Set(['category', 'numentries']);

const defaults = {
  asc: true,
  sort: 'name',
};
const sortCols = {
  name: 'lower(language.name)',
  iso6393: 'coalesce(language.iso6393, dialect_parent.iso6393)',
  is_proto: 'protolanguage.id is not null',
  parent_name: 'parent.name',
  numentries: 'count(entry.id)',
};

export async function get({ locals, query }) {
  query = normalizeQuery(query);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('language')
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('language as dialect_parent', 'dialect_parent.id', 'language.dialect_parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .select(
      'language.id',
      'language.name',
      knex.raw('coalesce(language.iso6393, dialect_parent.iso6393) as iso6393'),
      'language.parent_id',
      'parent.name as parent_name',
      knex.raw('protolanguage.id is not null as is_proto'),
      'protolanguage.prefer_set_name'
    );

  if (query.category === 'descendants') {
    q
      // .join('language_descendants as ld', 'ld.id', 'language.id')
      .whereRaw('language.flag_language_list')
      .select(knex.raw('coalesce(language.descendants, language.dialects) as descendants'));
  } else if (query.category === 'proto') {
    q.whereNotNull('protolanguage.id');
  } else if (query.category === 'borrow') {
    q.whereRaw('language.flag_borrowed_from OR language.flag_language_list');
  } else if (query.category === 'gloss') {
    q.whereRaw('language.flag_gloss_language');
  } else {
    q.whereRaw('language.flag_language_list');
  }

  if ('numentries' in query) {
    if (showPublicOnly(locals)) {
      q.join('source', function () {
        this.on('source.language_id', 'language.id').andOn('source.public', knex.raw('true'));
      });
    } else {
      q.join('source', 'source.language_id', 'language.id');
    }
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('language.id', 'protolanguage.id', 'parent.id', 'dialect_parent.id');
  } else if (showPublicOnly(locals)) {
    q.whereExists(function () {
      this.select('*').from('source')
      .where('source.language_id', knex.ref('language.id'))
      .where('source.public', knex.raw('true'));
    });
  }

  applySortParams(q, query, sortCols, ['name']);
  stripParams(query, strip);

  return {
    body: {
      query,
      rows: await q,
    },
  };
}

export const post = requireAuth(async ({ body }) => {
  const params = getFilteredParams(body, required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  ensureNfcParams(params, nfc);
  try {
    const ids = await knex.transaction((trx) =>
      trx.with('inserted', (q) => {
        q.from('language')
        .returning('id')
        .insert(params);
      })
      .from('protolanguage')
      .returning('id')
      .insert(function () {
        this.select('id').from('inserted');
      })
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
