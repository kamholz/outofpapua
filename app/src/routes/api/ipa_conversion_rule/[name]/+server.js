import errors from '$lib/errors';
import { allowedCreateUpdate } from '../params';
import { getFilteredParams, jsonError } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireEditor } from '$lib/auth';

export const PUT = requireEditor(async ({ params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowedCreateUpdate);
  if (!Object.keys(updateParams).length) {
    return jsonError(errors.noUpdatable);
  }
  try {
    await knex.transaction((trx) =>
      trx('ipa_conversion_rule')
      .where('name', params.name)
      .update(updateParams)
    );
    return new Response(null);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireEditor(async ({ params }) => {
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_rule')
      .where('name', params.name)
      .returning('name')
      .del()
    );
    return json({ deleted: names.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
