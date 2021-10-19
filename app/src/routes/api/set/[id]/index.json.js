import errors from '$lib/errors';
import { allowed } from '../_params';
import { getFilteredParams, isIdArray, showPublicOnly, validateParams } from '$lib/util';
import { knex, name_auto, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const get = validateParams(async ({ locals, params }) => {
  const publicOnly = showPublicOnly(locals);
  const row = await knex('set')
    .join(`${publicOnly ? 'set_details_public' : 'set_details'} as sd`, 'sd.id', 'set.id')
    .where('set.id', params.id)
    .first(
      'set.id',
      'set.author_id',
      'sd.author_name',
      'set.name',
      knex.raw(name_auto),
      'set.note',
      'sd.members'
    );
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
});

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
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
  if ('name' in updateParams && !('name_entry_id' in updateParams)) {
    updateParams.name_entry_id = null;
  } else if ('name_entry_id' in updateParams && !('name' in updateParams)) {
    updateParams.name = null;
  }
  try {
    const found = await transaction(locals, async (trx) => {
      const { id } = params;
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
          .onConflict(['entry_id', 'set_id'])
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
}));

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  try {
    const ids = await transaction(locals, (trx) =>
      trx('set')
      .where('id', params.id)
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
