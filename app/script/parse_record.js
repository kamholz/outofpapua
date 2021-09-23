#!/usr/bin/env node
import config from '../src/config.js';
import knexModule from 'knex';
import parseRecord from '../src/lib/parse_record.js';

const [sourceReference] = process.argv.slice(2);

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

const source = await knex('source')
  .where('reference', sourceReference)
  .first('id', 'formatting');

if (!source) {
  console.error('could not find source in database');
  process.exit(1);
}

const records = await knex('record')
  .join('entry', 'entry.record_id', 'record.id')
  .where('entry.source_id', source.id)
  .select('record.data')
  .groupBy('record.id')
  .orderBy('record.id');

for (const record of records) {
  // record.formatting = source.formatting;
  const parsed = parseRecord(record);
  console.log(JSON.stringify(record.data, null, 2));
  console.log();
  console.log(JSON.stringify(parsed, null, 2));
  console.log();
}

process.exit();
