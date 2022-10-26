import errors from '$lib/errors';
import { allowedCreateUpdate } from './params';
import { arrayCmp, knex, pgError } from '$lib/db';
import { getFilteredParams, jsonError, normalizeQuery, parseArrayParams } from '$lib/util';
import { json } from '@sveltejs/kit';
import { pageMax } from '$lib/preferences';
import { requireEditor } from '$lib/auth';

const allowed = new Set(['names', 'type']);
const arrayParams = new Set(['names']);

export async function GET({ url: { searchParams } }) {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  parseArrayParams(query, arrayParams);
  if ('names' in query && query.names.length > pageMax) {
    return jsonError(`cannot request more than ${pageMax} rules`);
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

  return json({ rows: await q });
}

const required = new Set(['name']);

export const POST = requireEditor(async ({ request }) => {
  const params = getFilteredParams(await request.json(), allowedCreateUpdate);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_rule')
      .returning('name')
      .insert(params)
    );
    return json({ name: names[0].name });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
