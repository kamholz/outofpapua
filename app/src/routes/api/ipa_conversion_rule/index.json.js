import { arrayCmp, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseArrayParams } from '$lib/util';
import { pageMax } from '$lib/preferences';

const allowed = new Set(['names', 'type']);
const arrayParams = new Set(['names']);

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseArrayParams(query, arrayParams);
  if ('names' in query && query.names.length > pageMax) {
    return { status: 400, body: { error: `cannot request more than ${pageMax} rules` } };
  }

  const q = knex('ipa_conversion_rule as icr')
    .select('icr.name')
    .orderBy('icr.name');
  if (query.type === 'raw') {
    q.select(
      'icr.chain_after',
      'icr.chain_before',
      'icr.function',
      'icr.lib',
      'icr.lowercase',
      'icr.replacements'
    );
  } else if (query.type === 'javascript_code') {
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
