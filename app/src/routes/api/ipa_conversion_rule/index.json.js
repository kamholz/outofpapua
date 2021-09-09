import { arrayCmp, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseArrayParams } from '$lib/util';
import { pageMax } from '$lib/preferences';

const allowed = new Set(['names']);
const arrayParams = new Set(['names']);

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!Object.keys(query).length) {
    return { status: 400, body: { error: 'insufficient parameters' } };
  }
  parseArrayParams(query, arrayParams);
  if (query.names.length > pageMax) {
    return { status: 400, body: { error: `cannot request more than ${pageMax} rules` } };
  }

  const q = knex('ipa_conversion_rule as icr')
    .where('name', arrayCmp(query.names))
    .select(
      'icr.name',
      knex.raw('ipa_conversion_rule_to_javascript(icr.name) AS javascript_code')
    );

  return {
    body: {
      rows: await q,
    },
  };
}
