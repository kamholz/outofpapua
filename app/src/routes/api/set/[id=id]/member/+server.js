import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams, isId } from '$lib/util';
import { knex, pgError, setTransactionUser } from '$lib/db';
import { requireContributor } from '$lib/auth';

const allowed = new Set(['entry_id', 'note', 'reflex', 'reflex_origin', 'reflex_origin_language_id']);
const required = new Set(['entry_id']);

export const POST = requireContributor(async ({ locals, params, request, url: { searchParams } }) => {
  const insertParams = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return jsonError(errorStrings.missing);
  }
  const otherSetId = searchParams.get('other_set_id');
  if (otherSetId && !isId(otherSetId)) {
    throw error(400);
  }
  try {
    insertParams.set_id = params.id;
    const id = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const rows = await trx('set_member')
        .returning('entry_id')
        .insert(insertParams);
      // would override existing set membership:
      // .onConflict(['entry_id', 'set_id'])
      // .merge([...]);
      await trx.raw('select repopulate_set_details_cached_for_set(?)', [params.id]);
      if (otherSetId) {
        await trx.raw('select repopulate_set_details_cached_for_set(?)', [otherSetId]);
      }
      return rows[0].id;
    });
    return json({ entry_id: id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
