import { applyPageParams, getCount, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams } from '$lib/util';
import { nfc } from './_params';

const allowed = new Set(['asc', 'gloss', 'lang1', 'lang2', 'page', 'pagesize', 'sort']);
const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
};

function makeQuery(q, query, lang) {
  q
    .from('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .where('source.language_id', query[lang])
    .select(
      'entry.id',
      'sense_gloss.language_id',
      'sense_gloss.txt'
    );
  if ('gloss' in query) {
    q.where('sense_gloss.txt', '~*', query.gloss);
  }
}

const entries2 = `
  json_agg(
    json_build_object(
      'headword', entry2.headword, 
      'senses', entry2.senses
    )
    ORDER BY entry2.headword
  ) FILTER (WHERE entry2.headword IS NOT NULL)
`;

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['lang1', 'lang2'].some((attr) => attr in query)) {
    return { status: 400, body: { error: 'insufficient search parameters' } };
  }
  parseBooleanParams(query, boolean);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const q = knex
    .with('lang1', (cte) => makeQuery(cte, query, 'lang1'))
    .with('lang2', (cte) => makeQuery(cte, query, 'lang2'))
    .from('lang1');

  const rowCount = await getCount(q);

  q
    .join('entry_with_senses as entry1', 'entry1.id', 'lang1.id')
    .joinRaw('left join lateral (select distinct lang2.* from lang2 where lang2.txt = lang1.txt) lang2 on true')
    .leftJoin('entry_with_senses as entry2', 'entry2.id', 'lang2.id')
    .select(
      'entry1.id',
      'entry1.headword',
      knex.raw('entry1.senses::jsonb'),
      knex.raw(`${entries2} as entries2`)
    )
    .groupBy('entry1.id', 'entry1.headword', knex.raw('entry1.senses::jsonb'))
    .orderByRaw(`${entries2} IS NULL`)
    .orderByRaw('lower(entry1.headword)');

  const pageCount = applyPageParams(q, query, rowCount);

  const rows = await q;

  // if ('glosslang' in query) {
  //   const set = new Set(query.glosslang);
  //   for (const row of rows) {
  //     for (const sense of row.senses) {
  //       sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
  //     }
  //   }
  // }

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}
