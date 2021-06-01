import config from '$config';
import { applyEntrySearchParams, applyPageParams, applySortParams, arrayCmp, getCount, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseArrayNumParams, parseArrayParams, parseBooleanParams,
  partitionPlus } from '$lib/util';
import { table } from './_params';

const allowed = new Set(['asc', 'headword', 'gloss', 'glosslang', 'lang', 'langcat', 'page', 'pagesize',
  'set', 'sort']);
const boolean = new Set(['asc']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: Number(config.PAGESIZE),
  sort: 'headword',
  langcat: 'lang',
  set: 'both',
};
const sortCols = {
  language: 'language.name',
  source: 'source.reference',
  headword: 'lower(entry.headword)',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['headword', 'gloss'].some((attr) => attr in query)) {
    return { status: 400, body: { error: 'insufficient search parameters' } };
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  query = { ...defaults, ...query };

  const subq = knex(table)
    .select('entry.id')
    .distinct();

  let joinedSource = false;
  function joinSource() {
    if (!joinedSource) {
      subq.join('source', 'source.id', 'entry.source_id');
      joinedSource = true;
    }
  }

  applyEntrySearchParams(subq, query);

  if (query.langcat === 'lang') {
    joinSource();
    subq.whereNotExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  } else if (query.langcat === 'proto') {
    joinSource();
    subq.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  }

  if ('lang' in query) {
    const [lang, langPlus] = partitionPlus(query.lang);
    if (langPlus.length) {
      const descendants = await knex('language_with_descendants')
        .where('id', arrayCmp(new Set(langPlus)))
        .pluck('descendants');
      for (const d of descendants) {
        lang.push(...d);
      }
    }
    if (lang.length) {
      joinSource();
      q.where('source.language_id', arrayCmp(new Set(lang)));
    }
  }

  const q = knex
    .from(subq.as('found'))
    .join('entry_with_senses as entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('set_member', 'set_member.entry_id', 'entry.id');

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.senses',
    'entry.record_id',
    'language.name as language',
    'source.reference as source',
    'set_member.set_id'
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'headword']);

  const rows = await q;

  if ('glosslang' in query) {
    const set = new Set(query.glosslang);
    for (const row of rows) {
      for (const sense of row.senses) {
        sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
      }
    }
  }

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}
