import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams, normalizeQuery } from '$lib/util';
import { requireComparative } from '$lib/auth';
import { text } from '@sveltejs/kit';

const allowed = new Set(['ids', 'format']);
const required = new Set(['ids', 'format']);
const formats = new Set(['cog', 'edictor']);

export const GET = requireComparative(async ({ fetch, url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return jsonError(errorStrings.missing);
  }
  if (!formats.has(query.format)) {
    return jsonError('invalid format');
  }

  const res = await fetch('/api/set/multiple?' + new URLSearchParams({ ids: query.ids }));
  const { rows: sets } = await res.json();

  const languageNames = new Set();
  for (const set of sets) {
    collectLanguageEntries(set);
  }
  const languagesNamesSorted = [...languageNames].sort();

  const maker = query.format === 'cog' ? makeCogTable : makeEdictorTable;
  const data = maker(languagesNamesSorted, sets)
  return text(data, {
    headers: {
      'content-type': 'text/plain',
      'content-disposition': `attachment; filename=${query.format}.txt`,
    },
  });

  function collectLanguageEntries(set) {
    const languageEntries = set.languageEntries = {};
    for (const { entry: { headword }, language: { name: languageName } } of set.members) {
      languageNames.add(languageName);
      if (!(languageName in languageEntries)) {
        languageEntries[languageName] = new Set();
      }
      languageEntries[languageName].add(headword);
    }
    for (const [languageName, entries] of Object.entries(languageEntries)) {
      languageEntries[languageName] = [...entries].sort();
    }
  }
});

function makeCogTable(languageNames, sets) {
  let data = '';

  const row = [null];
  for (const set of sets) {
    row.push(set.name_auto.txt);
  }
  addRow(row);

  for (const languageName of languageNames) {
    const row = [languageName];
    for (const set of sets) {
      const entries = set.languageEntries[languageName];
      if (entries) {
        row.push(entries.join('; '));
      } else {
        row.push(null);
      }
    }
    addRow(row);
  }

  return data;

  function addRow(row) {
    data += row.join('\t') + '\n';
  }
}

function makeEdictorTable() {
  return '';
}
