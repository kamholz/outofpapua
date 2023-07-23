import { arrayCmp, knex, pgError } from '$lib/db';
import { error } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams, isIdArray } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['set_ids']);
const required = new Set(['set_ids']);

export const POST = requireAuth(async ({ params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (Object.keys(updateParams).length !== required.size) {
    return jsonError(errorStrings.missing);
  }
  if (!isIdArray(updateParams.set_ids)) {
    return jsonError('"set_ids" parameter must be an array of set ids');
  }
  try {
    const found = await knex.transaction(async (trx) => {
      const set = await trx('set').first('note').where('id', params.id);
      if (set) {
        const notes = [
          set.note,
          ...await trx('set').pluck('note').where('id', arrayCmp(updateParams.set_ids)),
        ].filter((v) => v !== null);
        const note = notes.length ? notes.join('\n\n') : null;
        if (note !== set.note) {
          await trx('set').update({ note }).where('id', params.id);
        }

        await trx('set_member')
          .update({ set_id: params.id })
          .where('set_id', arrayCmp(updateParams.set_ids));
        await trx.raw('select repopulate_set_details_cached_for_set(?)', [params.id]);
        return true;
      } else {
        return false;
      }
    });
    if (found) {
      return new Response(null);
    } else {
      throw error(400);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
