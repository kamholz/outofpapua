import errors from '$lib/errors';
import { applySortParams, filterLanguageBorrowedFrom, filterLanguageGloss, filterLanguageList, knex, sendPgError,
  transaction } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, showPublicOnly,
  stripParams } from '$lib/util';
import { nfc } from './_params';
import { requireAuth } from '$lib/auth';
import { viewSet } from '$lib/preferences';

const boolean = new Set(['asc']);
const required = new Set(['name', 'view']);
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
  if (!('view' in query) || !viewSet.has(query.view)) {
    return { status: 400, body: { error: errors.view } };
  }
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
      .join('language_descendants as ld', 'ld.id', 'language.id')
      .select('ld.descendants');
    filterLanguageList(q, 'language.id', query.view);
  } else if (query.category === 'proto') {
    q.whereNotNull('protolanguage.id');
    filterLanguageList(q, 'language.id', query.view);
  } else if (query.category === 'borrow') {
    filterLanguageBorrowedFrom(q, 'language.id', query.view);
  } else if (query.category === 'gloss') {
    filterLanguageGloss(q, 'language.id', query.view);
  } else {
    filterLanguageList(q, 'language.id', query.view);
  }

  if ('numentries' in query) {
    if (showPublicOnly(locals)) {
      q.leftJoin('source', function () {
        this.on('source.language_id', 'language.id').andOn('source.public', knex.raw('true'));
      });
    } else {
      q.leftJoin('source', 'source.language_id', 'language.id');
    }
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('language.id', 'protolanguage.id', 'parent.id', 'dialect_parent.id');
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

export const post = requireAuth(async ({ body, locals }) => {
  const params = getFilteredParams(body, required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (!viewSet.has(params.view)) {
    return { status: 400, body: { error: errors.view } };
  }
  ensureNfcParams(params, nfc);
  const { view } = params;
  delete params.view;
  try {
    const id = await transaction(locals, async (trx) => {
      const ids = await trx.with('inserted', (q) => {
        q.from('language')
        .returning('id')
        .insert(params);
      })
      .from('protolanguage')
      .returning('id')
      .insert(function () {
        this.select('id').from('inserted');
      });
      await trx('language_list').insert({ language_id: id, view });
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
