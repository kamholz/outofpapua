import knex from '$lib/knex';
import { applyPageParams, applySortParams, getFilteredParams, normalizeQuery, setBooleanParams } from '$lib/util';

const allowed = new Set(['headword','gloss','page','pagesize','sort','asc']);
const boolean = new Set(['asc','case']);
const defaults = {
  asc: true,
  case: false,
  page: 1,
  pagesize: 100,
  sort: 'language',
};
const sortCols = {
  language: 'language.name',
  headword: 'lower(entry.headword)',
  pos: 'lower(entry.pos)',
  gloss: 'lower(sense_gloss.txt)',
  gloss_language: 'language2.name',
};

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['headword','gloss'].some(attr => attr in query)) {
    return { status: 400 };
  }
  setBooleanParams(query, boolean);
  query = {...defaults, ...query};

  const q = knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .join('language as language2', 'language2.id', 'sense_gloss.language_id')
    .select(
      'language.name as language',
      'entry.headword','entry.pos',
      'sense_gloss.txt as gloss',
      'language2.name as gloss_language',
      knex.raw("(entry.id || '|' || sense.id || '|' || sense_gloss.language_id || '|' || sense_gloss.txt) as id"),
    );

  if ('headword' in query) {
    q.where('entry.headword', ...match(query.headword, query.case));
  }
  if ('gloss' in query) {
    q.where('sense_gloss.txt', ...match(query.gloss, query.case));
  }

  applyPageParams(q, query);
  applySortParams(q, query, sortCols, ['language','headword','gloss','gloss_language']);

  return {
    body: {
      query,
      rows: await q,
    }
  };
}

function match(value, caseSensitive) {
  if (caseSensitive) {
    return ['~', value];
  } else {
    return ['~*', value];
  }
}
