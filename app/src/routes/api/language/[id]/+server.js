import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams, jsonError, showPublicOnly, splitParams } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { nfc } from '../params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['location', 'name', 'note', 'parent_id', 'prefer_set_name']);
const proto = new Set(['prefer_set_name']);

export async function GET({ locals, params }) {
  const q = knex('language')
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('language as dialect_parent', 'dialect_parent.id', 'language.dialect_parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .where('language.id', params.id)
    .first(
      'language.id',
      'language.name',
      knex.raw('coalesce(language.iso6393, dialect_parent.iso6393) as iso6393'),
      knex.raw("(language.location[0] || ', ' || language.location[1]) as location"),
      'language.parent_id',
      'parent.name as parent_name',
      knex.raw('protolanguage.id is not null as is_proto'),
      'protolanguage.prefer_set_name'
    );

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

  const row = await q;
  if (row) {
    return json(row);
  } else {
    throw error(404);
  }
}

export const PUT = requireAuth(async ({ params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (!Object.keys(updateParams).length) {
    return jsonError(errors.noUpdatable);
  }
  ensureNfcParams(updateParams, nfc);
  const protoParams = splitParams(updateParams, proto);
  const { id } = params;
  try {
    let found = false;
    await knex.transaction(async (trx) => {
      if (Object.keys(updateParams).length) {
        const rows = await trx('language')
          .where('id', id)
          .returning('id')
          .update(updateParams);
        found ||= Boolean(rows.length);
      }
      if (Object.keys(protoParams).length) {
        const rows = await trx('protolanguage')
          .where('id', id)
          .returning('id')
          .update(protoParams);
        found ||= Boolean(rows.length);
      }
    });
    if (found) {
      return new Response(null);
    } else {
      throw error(404);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireAuth(async ({ params }) => {
  try {
    const { id } = params;
    const rows = await knex.transaction((trx) =>
      trx('language')
      .where('id', id)
      .whereExists(function () {
        this.select('*').from('protolanguage').where('protolanguage.id', id);
      })
      .returning('id')
      .del()
    );
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
