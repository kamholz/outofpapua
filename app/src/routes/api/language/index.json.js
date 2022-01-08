import errors from '$lib/errors';
import { applySortParams, knex, sendPgError } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, showPublicOnly,
  stripParams } from '$lib/util';
import { nfc, required } from './_params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['asc', 'category', 'details', 'sort']);
const boolean = new Set(['asc', 'details']);
const strip = new Set(['category', 'details']);

const defaults = {
  asc: true,
  details: false,
  sort: 'name',
};
const sortCols = {
  name: 'lower(language.name)',
  is_proto: 'protolanguage.id is not null',
  parent_name: 'parent.name',
};
const sortColsDetails = {
  ...sortCols,
  iso6393: 'coalesce(language.iso6393, dialect_parent.iso6393)',
  numentries: 'count(entry.id)',
};

export async function get({ locals, url: { searchParams } }) {
  let query = getFilteredParams(normalizeQuery(searchParams), allowed);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('language')
    .select(
      'language.id',
      'language.name'
    );

  if (query.category === 'descendants') {
    q
      .whereRaw('language.flag_language_list')
      .select(
        knex.raw('coalesce(language.descendants, language.dialects) as descendants'),
        knex.raw(
          'not exists ? as empty',
          knex.select('*').from('source').where('source.language_id', knex.ref('language.id'))
        )
      );
  } else if (query.category === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('language.id'));
    });
  } else if (query.category === 'location') {
    q
      .leftJoin('language as ancestor_language', 'ancestor_language.id', 'language.ancestor_id')
      .whereRaw('language.flag_language_list')
      .whereNotNull('language.location')
      .select(
        'language.ancestor_id',
        'ancestor_language.name as ancestor_name',
        knex.raw('language.location::text')
      );
  } else if (query.category === 'borrow') {
    q.whereRaw('language.flag_borrowed_from OR language.flag_language_list');
  } else if (query.category === 'gloss') {
    q.whereRaw('language.flag_gloss_language');
  } else {
    q.whereRaw('language.flag_language_list');
  }

  if (query.details) {
    q
      .leftJoin('language as parent', 'parent.id', 'language.parent_id')
      .leftJoin('language as dialect_parent', 'dialect_parent.id', 'language.dialect_parent_id')
      .select(
        'language.parent_id',
        'parent.name as parent_name',
        knex.raw('coalesce(language.iso6393, dialect_parent.iso6393) as iso6393'),
        knex.raw('exists (select from protolanguage where protolanguage.id = language.id) as is_proto')
      );

    // count entries
    if (showPublicOnly(locals)) {
      q.join('source', function () { // hide empty sources
        this.on('source.language_id', 'language.id').andOn('source.public', knex.raw('true'));
      });
    } else {
      q.leftJoin('source', 'source.language_id', 'language.id');
    }
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('language.id', 'parent.id', 'dialect_parent.id');
  } else if (showPublicOnly(locals)) {
    q.whereExists(function () { // hide empty sources
      this.select('*').from('source')
      .where('source.language_id', knex.ref('language.id'))
      .where(knex.raw('source.public'));
    });
  }

  applySortParams(q, query, query.details ? sortColsDetails : sortCols, ['name']);
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
