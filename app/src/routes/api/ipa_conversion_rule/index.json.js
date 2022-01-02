import errors from '$lib/errors';
import { allowedCreateUpdate } from './_params';
import { arrayCmp, knex, sendPgError } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseArrayParams } from '$lib/util';
import { pageMax } from '$lib/preferences';
import { requireAdmin } from '$lib/auth';

const allowed = new Set(['names', 'type']);
const arrayParams = new Set(['names']);

export async function get({ url: { searchParams } }) {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
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

const required = new Set(['name']);

export const post = requireAdmin(async ({ body }) => {
  const params = getFilteredParams(body, allowedCreateUpdate);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_rule')
      .returning('name')
      .insert(params)
    );
    return { body: { name: names[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
