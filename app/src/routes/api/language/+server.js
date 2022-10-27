import errors from '$lib/errors';
import { applySortParams, knex, pgError } from '$lib/db';
import { ensureNfcParams, getFilteredParams, isEditor, jsonError, normalizeQuery, parseBooleanParams,
  showPublicOnly, stripParams } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { nfc, required } from './params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['asc', 'category', 'details', 'sort']);
const boolean = new Set(['asc', 'details']);
const strip = new Set(['category', 'details']);

const allowedCreate = new Set([...required, 'dialect_parent_id']);

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

export async function GET({ locals, url: { searchParams } }) {
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
        knex.raw('exists (select from protolanguage where protolanguage.id = language.id) as is_proto'),
        knex.raw('(language.dialect_parent_id is not null) as is_dialect')
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

  return json({
    query,
    rows: await q,
  });
}

export const POST = requireAuth(async ({ locals, request }) => {
  const params = getFilteredParams(await request.json(), allowedCreate);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  ensureNfcParams(params, nfc);
  try {
    if ('dialect_parent_id' in params) {
      if (!isEditor(locals.user)) {
        throw error(401);
      }

      const rows = await knex
        .fromRaw('language (name, dialect_parent_id)')
        .returning('id')
        .insert(function () {
          this.select(knex.raw('?, ?', [params.name, params.dialect_parent_id]))
          .whereNotExists(function () {
            this.select('*').from('protolanguage').where('id', params.dialect_parent_id);
          })
          .whereNotExists(function () {
            this.select('*').from('language').where('id', params.dialect_parent_id).whereNotNull('dialect_parent_id');
          });
        });
      return json({ id: rows[0]?.id ?? null });
    } else {
      const rows = await knex.transaction((trx) =>
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
      return json({ id: rows[0].id });
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
