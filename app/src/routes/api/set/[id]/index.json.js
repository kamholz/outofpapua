import errors from '$lib/errors';
import { allowed } from '../_params';
import { getFilteredParams, isIdArray, showPublicOnly } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export async function get({ locals, params }) {
  const publicOnly = showPublicOnly(locals);
  const row = await knex(`${publicOnly ? 'set_with_members_public' : 'set_with_members'} as set`)
    .where('set.id', Number(params.id))
    .first(
      'set.id',
      'set.note',
      'set.name',
      knex.raw("coalesce(set.name_auto, json_build_object('txt', set.id::text, 'type', 'id')) as name_auto"),
      'set.members'
    );
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
}

export const put = requireAuth(async ({ body, locals, params }) => {
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      return { status: 400 };
    }
    ({ members } = body);
    delete body.members;
  }
  const updateParams = getFilteredParams(body, allowed);
  const haveUpdateParams = Object.keys(updateParams).length;
  if (!members && !haveUpdateParams) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const found = await transaction(locals, async (trx) => {
      const id = Number(params.id);
      let found = false;
      if (haveUpdateParams) {
        const ids = await trx('set')
          .where('id', id)
          .returning('id')
          .update(updateParams);
        if (ids.length) {
          found = true;
        }
      }
      if (members) {
        const ids = await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v, set_id: id })))
          .returning('entry_id')
          .onConflict('entry_id')
          .ignore();
        if (ids.length) {
          found = true;
        }
      }
      return found;
    });
    if (found) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ locals, params }) => {
  try {
    const ids = await transaction(locals, (trx) =>
      trx('set')
      .where('id', Number(params.id))
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
