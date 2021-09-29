#!/usr/bin/env node
import config from '../src/config.js';
import knexModule from 'knex';

const [sourceReference, mode] = process.argv.slice(2);

if (!sourceReference) {
  console.error(`Usage: ${process.argv[1]} source_reference`);
  process.exit(1);
}

const knex = knexModule({
  client: 'pg',
  connection: {
    host: config.PGHOST,
    database: config.PGDATABASE,
  },
});

console.log(`\nstarting: ${sourceReference}\n`);

await knex.transaction(async (trx) => {
  const source = await trx('source')
    .where('reference', sourceReference)
    .first('id', 'ipa_conversion_rule', 'use_ph_for_ipa');

  if (!source) {
    console.error('could not find source in database');
    process.exit(1);
  }

  if (!source.ipa_conversion_rule) {
    console.error('source has no IPA conversion rules, cannot proceed');
    process.exit(1);
  }

  const usePh = source.use_ph_for_ipa;
  const rule = await trx.first(knex.raw('ipa_conversion_rule_to_javascript(?) as code', source.ipa_conversion_rule));
  const func = eval(rule.code);

  const q = trx(usePh ? 'entry_with_ph as entry' : 'entry')
    .where('source_id', source.id)
    .select('id', 'headword', 'headword_ipa')
    .orderBy('headword');
  if (usePh) {
    q.select('headword_ph');
  }
  const entries = await q;

  for (const entry of entries) {
    const { headword } = entry;
    const args = usePh
      ? matchHeadwordPh(entry, func)
      : [headword, { ph: false }];
    const ipa = func(...args);
    if (mode === 'update') {
      await trx('entry')
        .where('id', entry.id)
        .update({ headword_ipa: ipa });
    } else if (mode === 'compare') {
      if (ipa !== entry.headword_ipa) {
        console.log(`${headword}: ${entry.headword_ipa} => ${ipa}`);
      }
    } else {
      console.log(`${headword} => ${ipa}`);
    }
  }

  if (mode === 'update') {
    console.log('updated successfully');
  }
});

process.exit();

function matchHeadwordPh(entry, func) {
  const { headword, headword_ph } = entry;
  if (headword_ph === null) {
    return [headword, { ph: false }];
  }
  if (!headword_ph.match(/[,;]/)) {
    return [headword_ph, { ph: true }];
  }
  const phAuto = degr(func(headword, { ph: false }));
  for (const ph of headword_ph.split(/\s*[,;]\s*(?![^()]*\))/)) {
    const phDegr = degr(ph);
    if (phDegr === phAuto) {
      return [ph, { ph: true }];
    }
  }
  console.error(`could not identify headword, returning all: ${headword} // ${phAuto} // ${headword_ph}`);
  return [headword_ph, { ph: true }];
}

function degr(txt) {
  return txt.normalize('NFD')
    .replace(/\p{M}|[ˌˈ=-]/gu, '')
    .replace(/ɡ/g, 'g')
    .replace(/ɛ/g, 'e')
    .replace(/ɔ/g, 'o');
}