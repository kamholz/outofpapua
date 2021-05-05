import { allowed, table } from './_params';
import { getFilteredParams, isIdArray } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const post = requireAuth(async ({ body, locals }) => {
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      return { status: 400 };
    }
    ({ members } = body);
    delete body.members;
  }
  const params = getFilteredParams(body, allowed);
  try {
    const id = await transaction(locals, async (trx) => {
      const ids = await trx(table)
        .returning('id')
        .insert(params);
      const [id] = ids;
      if (members) {
        await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v, set_id: id })));
        // would override existing set membership
        // .onConflict('entry_id')
        // .merge(['set_id']);
      }
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
