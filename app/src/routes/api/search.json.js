import config from '$config';
import { applyPageParams, applySortParams, arrayCmp, getCount, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery,
  parseArrayNumParams, parseArrayParams, parseBooleanParams, partitionPlus } from '$lib/util';

const allowed = new Set(['headword', 'gloss', 'glosslang', 'category', 'lang', 'page', 'pagesize', 'sort', 'asc']);
const boolean = new Set(['asc']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: Number(config.PAGESIZE),
  sort: 'language',
  category: 'lang',
};
const sortCols = {
  language: 'language.name',
  source: 'source.title',
  headword: 'lower(entry.headword)',
  pos: 'lower(entry.pos)',
  gloss: 'lower(sense_gloss.txt)',
  gloss_language: 'language2.name',
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

  const q = knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .join('language as language2', 'language2.id', 'sense_gloss.language_id');

  if ('headword' in query) {
    q.where('entry.headword', '~*', query.headword);
  }
  if ('gloss' in query) {
    q.where('sense_gloss.txt', '~*', query.gloss);
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
      q.where('source.language_id', arrayCmp(new Set(lang)));
    }
  }
  if ('glosslang' in query) {
    q.where('sense_gloss.language_id', arrayCmp(new Set(query.glosslang)));
  }

  if (query.category === 'lang') {
    q.whereNotExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('language.id'));
    });
  } else if (query.category === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('language.id'));
    });
  }

  const rowCount = await getCount(q);

  q.select(
    'language.name as language',
    'source.reference as source',
    'entry.headword',
    'entry.pos',
    'entry.record_id',
    'sense_gloss.txt as gloss',
    'language2.name as gloss_language',
    knex.raw("(sense.id || '|' || sense_gloss.language_id || '|' || sense_gloss.txt) as id")
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'headword', 'gloss', 'gloss_language']);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows: await q,
    },
  };
}
