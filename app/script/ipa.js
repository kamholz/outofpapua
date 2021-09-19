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
    .first('id', 'ipa_conversion_rule');

  if (!source) {
    console.error('could not find source in database');
    process.exit(1);
  }

  if (!source.ipa_conversion_rule) {
    console.error('source has no IPA conversion rules, cannot proceed');
    process.exit(1);
  }

  const rule = await trx.first(knex.raw('ipa_conversion_rule_to_javascript(?) as code', source.ipa_conversion_rule));
  const func = eval(rule.code);

  const entries = await trx('entry')
    .where('source_id', source.id)
    .select('id', 'headword', 'headword_ipa');

  for (const entry of entries) {
    const ipa = func(entry.headword);
    if (mode === 'update') {
      await trx('entry')
        .where('id', entry.id)
        .update({ headword_ipa: ipa });
    } else if (mode === 'compare') {
      if (ipa !== entry.headword_ipa) {
        console.log(`${entry.headword}: ${entry.headword_ipa} => ${ipa}`);
      }
    } else {
      console.log(`${entry.headword} => ${ipa}`);
    }
  }

  if (mode === 'update') {
    console.log('updated successfully');
  }
});

process.exit();
