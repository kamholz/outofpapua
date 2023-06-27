import errors from '$lib/errors';
import { getFilteredParams, isId, jsonError, normalizeQuery } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['protolang']);
const required = new Set(['protolang']);

const name_auto = "coalesce(sd.name_auto ->> 'txt', sd.id::text)";

function headwordSubselect(id) {
  return `(select jsonb_path_query(sd.members, '$\\?(@.language.id == ${id}).entry.headword') #>> '{}' ORDER BY 1 LIMIT 1)`;
}

export const GET = requireAuth(async ({ url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  if (!isId(query.protolang)) {
    return jsonError('protolang is not a valid id');
  }

  try {
    const response = await knex.transaction(async (trx) => {
      const language = await trx('language')
        .where('language.id', query.protolang)
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
      const protolangId = language.id;
      const ancestors = new Set(language.ancestors || []);
      const descendants = new Set(language.descendants || []);

      const jsonPath = `jsonb_path_query(sd.members, '$\\?(@.language.id == ${protolangId}).entry')`;

      const rows = await trx('set')
        .join('set_details_cached as sd', 'sd.id', 'set.id')
        .joinRaw(`JOIN LATERAL (
          SELECT (${jsonPath} ->> 'id')::integer AS id, (${jsonPath} ->> 'headword') as headword
          ORDER BY ${jsonPath} ->> 'headword'
          LIMIT 1
        ) headword_entry ON TRUE
        `)
        .select(
          'set.id',
          knex.raw(`${name_auto} as set_name`),
          'set.set_group_id',
          'sd.author_name',
          'sd.members',
          'headword_entry.id as headword_entry_id'
        )
        .whereExists(
          knex('set_member')
            .where('set_member.set_id', knex.ref('set.id'))
            .join('entry', 'entry.id', 'set_member.entry_id')
            .join('source', 'source.id', 'entry.source_id')
            .where('source.language_id', protolangId)
        )
        .orderBy('headword_entry.headword')
        .orderBy(knex.raw("lpad(sd.id::text, 10, '0')"));

      const sets = rows.map(({ author_name, headword_entry_id, id, members }) => {
        const ancestor = [];
        const descendant = [];
        const borrowed = [];
        const self = [];
        const other = [];
        let headword;

        for (const member of members) {
          if (member.entry.id === headword_entry_id) {
            headword = member;
          } else {
            let list;
            const languageId = member.language.id;
            if (languageId === protolangId) {
              list = self;
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
          }
        }

        return {
          author_name,
          headword,
          id,
          members: {
            self,
            ancestor,
            descendant,
            borrowed,
            other,
          },
        };
      });

      return { language, sets };
    });

    return json(response);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
