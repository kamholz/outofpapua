import { arrayCmp, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseArrayParams, parseBooleanParams } from '$lib/util';
import { pageMax } from '$lib/preferences';

const allowed = new Set(['names', 'raw']);
const arrayParams = new Set(['names']);
const boolean = new Set(['raw']);

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseArrayParams(query, arrayParams);
  parseBooleanParams(query, boolean);
  if ('names' in query && query.names.length > pageMax) {
    return { status: 400, body: { error: `cannot request more than ${pageMax} rules` } };
  }

  const q = knex('ipa_conversion_rule as icr')
    .select('icr.name')
    .orderBy('icr.name');
  if (query.raw) {
    q.select(
      'icr.chain_after',
      'icr.function',
      'icr.lib',
      'icr.lowercase',
      'icr.replacements'
    );
  } else {
    q.select(
      knex.raw('ipa_conversion_rule_to_javascript(icr.name) AS javascript_code')
    );
  }
  if ('names' in query) {
    q.where('name', arrayCmp(query.names));
  }

  return {
    body: {
      rows: await q,
    },
  };
}
