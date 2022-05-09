import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams } from '$lib/util';
import { getGlossLanguage, insertGlosses, knex, sendPgError, setTransactionUser } from '$lib/db';
import { isEditable } from '../../_params';
import { requireAuth } from '$lib/auth';

export const post = requireAuth(async ({ locals, params, request }) => {
  const insertParams = getFilteredParams(await request.json(), allowed);
  const { glosses } = insertParams;
  delete insertParams.glosses;
  try {
    const entryId = params.id;
    if (!(await isEditable(entryId))) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    insertParams.entry_id = entryId;

    const id = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const senseIds = await trx('sense')
        .returning('id')
        .insert(insertParams);
      const [sense_id] = senseIds;

      if (glosses) {
        const language = await getGlossLanguage(trx);
        await insertGlosses(trx, { sense_id, language_id: language.id, glosses });
      }

      return sense_id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
