import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams, validateParams } from '$lib/util';
import { getGlossLanguage, insertGlosses, knex, sendPgError, transaction } from '$lib/db';
import { isEditable } from '../../_params';
import { requireAuth } from '$lib/auth';

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  const { glosses } = updateParams;
  delete updateParams.glosses;
  if (!Object.keys(updateParams).length && !glosses) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  const { id, sense_id } = params;
  if (!(await isEditable(id))) {
    return { status: 400, body: { error: errors.editableEntry } };
  }

  const rows = await knex('sense')
    .where('id', sense_id)
    .select('entry_id');
  if (!rows.length || rows[0].entry_id !== id) {
    return;
  }

  try {
    await transaction(locals, async (trx) => {
      if (Object.keys(updateParams).length) {
        await trx('sense')
          .where('id', sense_id)
          .update(updateParams);
      }

      if (glosses) {
        await trx('sense_gloss')
          .where('sense_id', sense_id)
          .del();
        const language = await getGlossLanguage();
        await insertGlosses(trx, { sense_id, language_id: language.id, glosses });
      }
    });
    return { body: '' };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  try {
    if (!(await isEditable(params.id))) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    const ids = await transaction(locals, (trx) =>
      trx('sense')
      .where('id', params.sense_id)
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
