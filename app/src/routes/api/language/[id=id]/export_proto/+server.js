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

      const q = trx('entry')
        .whereExists(function () {
          this.select('*').from('source')
          .where('source.id', knex.ref('entry.source_id'))
          .where('source.language_id', protolangId);
        })
        .joinRaw(`
          JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'id', set.id,
                'name', ${name_auto},
                'author_name', sd.author_name,
                'members', sd.members
              )
              order by ${name_auto}
            ) as sets
            FROM set
            JOIN set_details_cached sd ON sd.id = set.id
            WHERE EXISTS (
              SELECT FROM set_member sm WHERE sm.set_id = set.id AND sm.entry_id = entry.id
            )
          ) s ON TRUE
        `)
        .join('set_member as sm', 'sm.entry_id', 'entry.id')
        .join('set', 'set.id', 'sm.set_id')
        .join('set_details_cached as sd', 'sd.id', 'set.id')
        .select(
          'entry.id',
          'entry.headword',
          'entry.senses',
          's.sets'
        )
        .orderBy('entry.headword_degr')
        .orderBy('entry.headword')
        .orderBy('entry.id');

      const entries = await q;

      for (const entry of entries) {
        for (const set of entry.sets) {
          const ancestor = [];
          const descendant = [];
          const borrowed = [];
          const other = [];

          for (const member of set.members) {
            if (member.language.id !== protolangId) {
              let list;
              const languageId = member.language.id;
              if (ancestors.has(languageId)) {
                list = ancestor;
              } else if (descendants.has(languageId)) {
                list = descendant;
              } else if (member.entry.origin === 'borrowed') {
                list = borrowed;
              } else {
                list = other;
              }
              list.push(member);
            }
          }
          set.members = { ancestor, descendant, borrowed, other };
        }
      }

      return { language, entries };
    });

    return json(response);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
