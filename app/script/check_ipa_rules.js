#!/usr/bin/env node
import config from '../src/config.js';
import knexModule from 'knex';

const knex = knexModule({
  client: 'pg',
  connection: {
    host: config.PGHOST,
    database: config.PGDATABASE,
  },
});

const q = knex('ipa_conversion_rule as icr')
  .select(
    'icr.name',
    knex.raw('ipa_conversion_rule_to_javascript(icr.name) AS javascript_code')
  )
  .orderBy('icr.name');

const rows = await q;

for (const { name, javascript_code } of rows) {
  const func = eval(javascript_code);
  try {
    func('foo');
  } catch (e) {
    console.log(name);
    console.log(e);
  }
}

process.exit();