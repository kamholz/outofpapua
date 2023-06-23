import { jsonError } from '$lib/util';
import { knex, pgError } from '$lib/db';
import { requireEditor } from '$lib/auth';

export const POST = requireEditor(async ({ params }) => {
  try {
    const error = await knex.transaction(async (trx) => {
      const source = await trx('source')
        .where('id', params.id)
        .first('id', 'ipa_conversion_rule', 'use_ph_for_ipa');
      if (!source) {
        return jsonError('could not find source in database');
      }
      if (!source.ipa_conversion_rule) {
        return jsonError('source has no IPA conversion rule');
      }

      const usePh = source.use_ph_for_ipa;
      const rule = await trx.first(knex.raw('ipa_conversion_rule_to_javascript(?) as code',
        source.ipa_conversion_rule));
      const func = (0, eval)(rule.code);

      const entries = await trx('entry')
        .where('source_id', source.id)
        .select('entry.id', 'entry.headword', 'entry.headword_ipa', 'entry.headword_ph')
        .orderBy('entry.headword');

      for (const entry of entries) {
        const { headword } = entry;
        const args = usePh
          ? matchHeadwordPh(entry)
          : [headword, { ph: false }];
        const ipa = func(...args);
        await trx('entry')
          .where('id', entry.id)
          .update({ headword_ipa: ipa });
      }
    });

    if (error) {
      return error;
    } else {
      knex.raw('call repopulate_set_details_cached2()').then(() => {});
      return new Response(null);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

function matchHeadwordPh(entry) {
  const { headword, headword_ph } = entry;
  if (headword_ph === null) {
    return [headword, { ph: false }];
  } else {
    const match = headword_ph.match(/^(.+?) *[,;]/);
    if (match) {
      // console.error(`warning: headword_ph contains multiple values, choosing first: ${headword_ph} => ${match[1]}`);
      return [match[1], { ph: true }];
    }
    return [headword_ph, { ph: true }];
  }
}
