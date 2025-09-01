import { allowed } from '../params';
import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams, isIdArray, showPublicOnly } from '$lib/util';
import { knex, name_auto, pgError, setTransactionUser } from '$lib/db';
import { requireComparative, requireContributor } from '$lib/auth';

export const GET = requireComparative(async ({ locals, params }) => {
  const publicOnly = showPublicOnly(locals);
  const row = await knex('set')
    .join(`${publicOnly ? 'set_details_cached_public' : 'set_details_cached'} as sd`, 'sd.id', 'set.id')
    .leftJoin(`${publicOnly ? 'set_group_details_public' : 'set_group_details'} as sgd`, 'sgd.id', 'set.id')
    .where('set.id', params.id)
    .first(
      'set.id',
      'set.author_id',
      'sd.author_name',
      'set.name',
      knex.raw(name_auto),
      'set.note',
      'sd.members',
      'sgd.set_group',
      'set.set_group_id'
    );
  if (row) {
    return json(row);
  } else {
    throw error(404);
  }
});

export const PUT = requireContributor(async ({ locals, params, request }) => {
  const body = await request.json();
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      throw error(400);
    }
    ({ members } = body);
    delete body.members;
  }
  const updateParams = getFilteredParams(body, allowed);
  const haveUpdateParams = Object.keys(updateParams).length;
  if (!members && !haveUpdateParams) {
    return jsonError(errorStrings.noUpdatable);
  }
  if ('name' in updateParams && !('name_entry_id' in updateParams)) {
    updateParams.name_entry_id = null;
  } else if ('name_entry_id' in updateParams && !('name' in updateParams)) {
    updateParams.name = null;
  }
  try {
    const found = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const { id } = params;
      let found = false;
      if (haveUpdateParams) {
        const rows = await trx('set')
          .where('id', id)
          .returning('id')
          .update(updateParams);
        if (rows.length) {
          found = true;
        }
      }
      if (members) {
        const rows = await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v, set_id: id })))
          .returning('entry_id')
          .onConflict(['entry_id', 'set_id'])
          .ignore();
        if (rows.length) {
          found = true;
        }
      }
      if (found) {
        await trx.raw('select repopulate_set_details_cached_for_set(?)', [id]);
      }
      return found;
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

export const DELETE = requireContributor(async ({ params }) => {
  try {
    const rows = await knex.transaction((trx) =>
      trx('set')
      .where('id', params.id)
      .returning('id')
      .del()
    );
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
