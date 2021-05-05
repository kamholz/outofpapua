import errors from '$lib/errors';
import { allowed, table } from '../_params';
import { getFilteredParams, isIdArray } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export async function get({ params }) {
  const row = await knex('set_with_members as set')
    .where('set.id', Number(params.id))
    .first(
      'set.id',
      'set.note',
      'set.members'
    );
  if (row) {
    return { body: row };
  }
}

export const put = requireAuth(async ({ body, locals, params }) => {
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      return { status: 400 };
    }
    members = body.members;
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
        const ids = await trx(table)
          .where('id', id)
          .returning('id')
          .update(updateParams);
        if (ids.length) {
          found = true;
        }
      }
      if (members) {
        const ids = await trx('entry')
          .whereRaw('set_id is distinct from ?', id)
          .where('id', trx.raw('any(?)', [members]))
          .returning('id')
          .update({ set_id: id });
        if (ids.length) {
          found = true;
        }
        await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v })))
          .onConflict('entry_id')
          .ignore();
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
      trx(table)
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
