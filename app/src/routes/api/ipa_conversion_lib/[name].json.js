import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams } from '$lib/util';
import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const put = requireAuth(async ({ params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    await knex.transaction((trx) =>
      trx('ipa_conversion_lib')
      .where('name', params.name)
      .update(updateParams)
    );
    return { body: '' };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ params }) => {
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_lib')
      .where('name', params.name)
      .returning('name')
      .del()
    );
    return { body: { deleted: names.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
