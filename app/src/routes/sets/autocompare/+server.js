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
    identifyMostCommonGloss(set);
    identifyLanguageEntries(set);
  }

  const languagesNamesSorted = [...languageNames].sort();

  const data = query.format === 'cog'
    ? makeCogTable(languagesNamesSorted, sets)
    : makeEdictorTable(languagesNamesSorted, sets);

  return text(data, {
    headers: {
      'content-type': 'text/plain',
      'content-disposition': 'attachment; filename=cog.txt',
    },
  });

  function identifyLanguageEntries(set) {
    const { mostCommonGloss } = set;
    set.members = set.members.filter(({ entry }) => entry.uniqueGlosses.has(mostCommonGloss));

    const languageEntries = set.languageEntries = {};
    for (const { entry: { headword }, language: { name: languageName } } of set.members) {
      languageNames.add(languageName);
      if (!(languageName in languageEntries)) {
        languageEntries[languageName] = [headword];
      } else {
        languageEntries[languageName].push(headword);
      }
    }
  }
});

function getUniqueGlosses({ senses }) {
  const glossesSet = new Set();
  for (const { glosses } of senses) {
    for (const { txt } of glosses) {
      for (const gloss of txt) {
        glossesSet.add(gloss);
      }
    }
  }
  return glossesSet;
}

function identifyMostCommonGloss(set) {
  const glosses = {};
  for (const { entry } of set.members) {
    const uniqueGlosses = entry.uniqueGlosses = getUniqueGlosses(entry);
    for (const gloss of uniqueGlosses) {
      if (!(gloss in glosses)) {
        glosses[gloss] = 1;
      } else {
        glosses[gloss]++;
      }
    }
  }

  let maxCount = 0;
  let maxGloss;
  for (const [gloss, count] of Object.entries(glosses)) {
    if (count > maxCount) {
      maxCount = count;
      maxGloss = gloss;
    }
  }
  set.mostCommonGloss = maxGloss;
}

function makeCogTable(languageNames, sets) {
  let data = '';

  const row = [null];
  for (const set of sets) {
    row.push(`${set.mostCommonGloss} (${set.name_auto.txt})`);
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
