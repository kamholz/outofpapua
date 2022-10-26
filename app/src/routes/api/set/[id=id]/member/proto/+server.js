import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { getGlossLanguage, insertGlosses, jsonError, knex, pgError, setTransactionUser } from '$lib/db';
import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['glosses', 'headword', 'source_id']);
const required = new Set(['glosses', 'headword', 'source_id']);
const nfc = new Set(['headword']);

export const POST = requireAuth(async ({ locals, params, request }) => {
  const insertParams = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  ensureNfcParams(insertParams, nfc);
  try {
    const source = await knex('source')
      .where('id', insertParams.source_id)
      .whereRaw('editable')
      .first('id');
    if (!source) {
      return jsonError('source does not exist or is not editable');
    }

    const language = await getGlossLanguage();
    if (!language) {
      return jsonError('default gloss language does not exist');
    }

    const { glosses } = insertParams;
    delete insertParams.glosses;

    const entry_id = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);

      const entryIds = await trx('entry')
        .returning('id')
        .insert(insertParams);
      const [{ id: entry_id }] = entryIds;

      const senseIds = await trx('sense')
        .returning('id')
        .insert({ entry_id, seq: 1 });
      const [{ id: sense_id }] = senseIds;
      await insertGlosses(trx, { sense_id, language_id: language.id, glosses });

      await trx('set_member')
        .insert({ entry_id, set_id: params.id });

      return entry_id;
    });
    return json({ entry_id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
