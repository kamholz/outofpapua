import errors from '$lib/errors';
import { allowed } from '../params';
import { getFilteredParams, jsonError } from '$lib/util';
import { getGlossLanguage, insertGlosses, knex, pgError, setTransactionUser } from '$lib/db';
import { isEditable } from '../../../params';
import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth';

export const PUT = requireAuth(async ({ locals, params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  const { glosses } = updateParams;
  delete updateParams.glosses;
  if (!Object.keys(updateParams).length && !glosses) {
    return jsonError(errors.noUpdatable);
  }
  const { id, sense_id } = params;
  if (!(await isEditable(id))) {
    return jsonError(errors.editableEntry);
  }

  const rows = await knex('sense')
    .where('id', sense_id)
    .select('entry_id');
  if (!rows.length || rows[0].entry_id !== id) {
    return new Response(null);
  }

  try {
    await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);

      if (Object.keys(updateParams).length) {
        await trx('sense')
          .where('id', sense_id)
          .update(updateParams);
      }

      if (glosses) {
        await trx.raw('alter table sense_gloss disable trigger update_sense_glosses');
        await trx('sense_gloss')
          .where('sense_id', sense_id)
          .del();
        await trx.raw('alter table sense_gloss enable trigger update_sense_glosses');
        const language = await getGlossLanguage();
        await insertGlosses(trx, { sense_id, language_id: language.id, glosses });
      }
    });
    return new Response(null);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireAuth(async ({ params }) => {
  try {
    if (!(await isEditable(params.id))) {
      return jsonError(errors.editableEntry);
    }
    const rows = await knex.transaction((trx) =>
      trx('sense')
      .where('id', params.sense_id)
      .returning('id')
      .del()
    );
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
