import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams, validateParams } from '$lib/util';
import { getGlossLanguage, insertGlosses, sendPgError, transaction } from '$lib/db';
import { isEditable } from '../../_params';
import { requireAuth } from '$lib/auth';

export const post = validateParams(requireAuth(async ({ body, locals, params }) => {
  const insertParams = getFilteredParams(body, allowed);
  const { glosses } = insertParams;
  delete insertParams.glosses;
  try {
    const entryId = Number(params.id);
    const editable = await isEditable(entryId);
    if (!editable) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    insertParams.entry_id = entryId;

    const id = await transaction(locals, async (trx) => {
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
}));
