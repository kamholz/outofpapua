#!/usr/bin/env node
import config from '../src/config.js';
import knexModule from 'knex';

const [sourceReference, doUpdate] = process.argv.slice(2);

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

await knex.transaction(async (trx) => {
  const source = await trx('source')
    .where({ reference: sourceReference })
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

  const entries = await trx('entry_with_ph')
    .where({ source_id: source.id })
    .select('id', 'headword', 'headword_ph');

  for (const entry of entries) {
    const ph = matchHeadwordPh(entry);
    const txt = func(ph);
    if (doUpdate) {
      await trx('entry')
        .where({ id: entry.id })
        .update({ headword_ipa: txt });
    } else {
      console.log(`${entry.headword} => ${txt}`);
    }
  }

  if (doUpdate) {
    console.log('processed successfully');
  }
});

process.exit();

function matchHeadwordPh(entry) {
  const { headword, headword_ph } = entry;
  if (headword_ph === null) {
    return headword;
  }
  if (!headword_ph.match(/[,;]/)) {
    return headword_ph;
  }
  for (const ph of headword_ph.split(/\s*[,;]\s*(?![^()]*\))/)) {
    const phNfd = ph.normalize('NFD').replace(/\p{M}/gu, '');
    if (phNfd === headword) {
      return ph;
    }
  }
  console.error(`could not identify headword, returning all: ${headword_ph}`);
  return headword_ph;
}
