import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { table } from '../_params';

const allowed = new Set(['glosses', 'headword', 'source_id']);
const required = new Set(['glosses', 'headword', 'source_id']);
const nfc = new Set(['headword']);
const glossLanguage = 'eng';

export const post = requireAuth(async ({ body, locals, params }) => {
  const insertParams = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  ensureNfcParams(insertParams, nfc);
  try {
    const source = await knex('source')
      .where('id', insertParams.source_id)
      .whereRaw('editable')
      .first('id');
    if (!source) {
      return { status: 400, body: { error: 'source does not exist or is not editable' } };
    }

    const language = await knex('language')
      .where('iso6393', glossLanguage)
      .first('id');
    if (!language) {
      return { status: 400, body: { error: 'default gloss language does not exist' } };
    }

    const glosses = parseGlosses(insertParams.glosses);
    delete insertParams.glosses;

    const entry_id = await transaction(locals, async (trx) => {
      const entryIds = await trx('entry')
        .returning('id')
        .insert(insertParams);
      const [entry_id] = entryIds;

      await trx(table)
        .insert({ entry_id, set_id: Number(params.id) });

      const senseIds = await trx('sense')
        .returning('id')
        .insert({ entry_id, seq: 1 });
      const [sense_id] = senseIds;

      for (const [i, txt] of glosses.entries()) {
        await trx('sense_gloss')
          .insert({ sense_id, language_id: language.id, txt, seq: i + 1 });
      }

      return entry_id;
    });
    return { body: { entry_id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

function parseGlosses(glosses) {
  return glosses
    .split(/ *[,;] */)
    .map((v) => v.normalize());
}
