import { allowed, table } from './_params';
import { getFilteredParams, isIdArray } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const post = requireAuth(async ({ body, context }) => {
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
    const id = await transaction(context, async (trx) => {
      const ids = await trx(table)
        .returning('id')
        .insert(params);
      const [id] = ids;
      if (members) {
        await trx('entry')
          .where('id', trx.raw('any(?)', [members]))
          .update({ set_id: id });
        await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v })));
      }
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
