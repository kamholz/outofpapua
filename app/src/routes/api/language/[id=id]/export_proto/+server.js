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
          'language.descendants',
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
        .select(
          'entry.id',
          'entry.headword',
          'entry.headword_degr',
          'set.id as set_id',
          knex.raw(`${name_auto} as set_name`),
          'sd.author_name as set_author_name',
          'sd.members as set_members'
        )
        .where('source.language_id', protolangId);

      const q = trx
        .from(subq.as('entry'))
        .select(
          'entry.id',
          'entry.headword',
          knex.raw(`json_agg(
            json_build_object(
              'id', entry.set_id,
              'name', entry.set_name,
              'author_name', entry.set_author_name,
              'members', entry.set_members
            )
            order by entry.set_name
          ) as sets`)
        )
        .groupBy('entry.id', 'entry.headword', 'entry.headword_degr')
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
