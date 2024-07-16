import { allowed } from './params';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams } from '$lib/util';
import { getGlossLanguage, insertGlosses, knex, pgError, setTransactionUser } from '$lib/db';
import { isEditable } from '../../params';
import { json } from '@sveltejs/kit';
import { requireContributor } from '$lib/auth';

export const POST = requireContributor(async ({ locals, params, request }) => {
  const insertParams = getFilteredParams(await request.json(), allowed);
  const { glosses } = insertParams;
  delete insertParams.glosses;
  try {
    const entryId = params.id;
    if (!(await isEditable(entryId))) {
      return jsonError(errorStrings.editableEntry);
    }
    insertParams.entry_id = entryId;

    const id = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const senseIds = await trx('sense')
        .returning('id')
        .insert(insertParams);
      const [{ id: sense_id }] = senseIds;

      if (glosses) {
        const language = await getGlossLanguage(trx);
        await insertGlosses(trx, { sense_id, language_id: language.id, glosses });
      }

      return sense_id;
    });
    return json({ id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
