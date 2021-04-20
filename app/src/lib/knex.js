import knex from 'knex';
import config from '$config';

export default knex({
  client: 'pg',
  connection: {
    host:     config.PGHOST,
    database: config.PGDATABASE,
  }
});
