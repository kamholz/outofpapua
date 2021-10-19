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

  const entries = await trx('entry')
    .where('source_id', source.id)
    .select('entry.id', 'entry.headword', 'entry.headword_ipa', 'entry.headword_ph')
    .orderBy('entry.headword');

  for (const entry of entries) {
    const { headword } = entry;
    const args = usePh
      ? matchHeadwordPh(entry)
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

function matchHeadwordPh(entry) {
  const { headword, headword_ph } = entry;
  if (headword_ph === null) {
    return [headword, { ph: false }];
  } else {
    const match = headword_ph.match(/^(.+?) *[,;]/);
    if (match) {
      console.error(`warning: headword_ph contains multiple values, choosing first: ${headword_ph} => ${match[1]}`);
      return [match[1], { ph: true }];
    }
    return [headword_ph, { ph: true }];
  }
}
