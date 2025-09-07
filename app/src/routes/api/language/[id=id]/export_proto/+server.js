import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

const name_auto = "coalesce(sd.name_auto ->> 'txt', sd.id::text)";

export const GET = requireAuth(async ({ params }) => {
  const protolangId = params.id;

  try {
    const response = await knex.transaction(async (trx) => {
      const language = await trx('language')
        .where('language.id', protolangId)
        .join('protolanguage', 'protolanguage.id', 'language.id')
        .first(
          'language.id',
          'language.name',
          'language.ancestors',
          'language.descendants'
        );
      if (!language) {
        throw new Error('protolang not found');
      }
      const ancestors = new Set(language.ancestors || []);
      const descendants = new Set(language.descendants || []);

      const subq = trx('entry')
        .join('source', 'source.id', 'entry.source_id')
        .join('set_member as sm', 'sm.entry_id', 'entry.id')
        .join('set', 'set.id', 'sm.set_id')
        .join('set_details_cached as sd', 'sd.id', 'set.id')
        .where('source.language_id', protolangId)
        .select(
          'entry.id',
          'entry.headword',
          'entry.headword_degr',
          knex.raw(`${name_auto} as name`),
          'source.reference',
          knex.raw(`
            json_build_object(
              'id', set.id,
              'note', set.note,
              'members', sd.members
            ) as set
          `),
          knex.raw('row_number() over (partition by set.id order by entry.headword_degr, entry.headword, source.reference, entry.id)')
        );

      const q = trx.from(subq.as('s'))
        .select(
          's.id',
          's.set'
        )
        .where('s.row_number', 1)
        .orderBy('s.headword_degr')
        .orderBy('s.headword')
        .orderBy('s.name')
        .orderBy('s.reference')
        .orderBy('s.id');

      const entries = await q;
      const ipaConversionFunctions = new Set();

      for (const entry of entries) {
        // if (entry.source_ipa_conversion_rule) {
        //   ipaConversionFunctions.add(entry.source_ipa_conversion_rule);
        // }
        const { set } = entry;
        const proto = [];
        const ancestor = [];
        const descendant = [];
        const borrowed = [];
        const other = [];

        for (const member of set.members) {
          let list;
          const languageId = member.language.id;
          if (languageId === protolangId) {
            list = proto;
          } else if (ancestors.has(languageId)) {
            list = ancestor;
          } else if (descendants.has(languageId)) {
            list = descendant;
          } else if (member.entry.origin === 'borrowed') {
            list = borrowed;
          } else {
            list = other;
          }
          list.push(member);

          if (member.source.ipa_conversion_rule) {
            ipaConversionFunctions.add(member.source.ipa_conversion_rule);
          }
        }

        if (ancestor.length) {
          ancestor.reverse();
          for (let i = 1; i < ancestor.length; i++) {
            const { language } = ancestor[i];
            if (ancestor[i - 1].language.id === language.id) {
              language.repeat = true;
            }
          }
        }

        set.members = { ancestor, descendant, borrowed, other, proto };
      }
      return { language, entries, ipa_conversion_functions: [...ipaConversionFunctions] };
    });

    return json(response);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
