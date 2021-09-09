import { arrayCmp, filterPublicSources, knex } from '$lib/db';
import { getFilteredParams, isIdArray, normalizeQuery, parseArrayNumParams } from '$lib/util';
import { pageMax } from '$lib/preferences';

const allowed = new Set(['ids']);
const arrayNumParams = new Set(['ids']);

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!Object.keys(query).length) {
    return { status: 400, body: { error: 'insufficient parameters' } };
  }
  parseArrayNumParams(query, arrayNumParams);
  if (!isIdArray(query.ids)) {
    return { status: 400, body: { error: 'invalid ids parameter' } };
  }
  if (query.ids.length > pageMax) {
    return { status: 400, body: { error: `cannot request more than ${pageMax} rules` } };
  }

  const q = knex('source')
    .where('id', arrayCmp(query.ids))
    .select(
      'source.id',
      'source.ipa_conversion_rule',
      knex.raw('(CASE WHEN source.id IS NOT NULL THEN ipa_conversion_rule_to_javascript(source.ipa_conversion_rule) ELSE NULL END) as javascript_code'),
    );
  filterPublicSources(q, locals);

  return {
    body: {
      rows: await q,
    },
  };
}
