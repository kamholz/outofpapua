import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams } from '$lib/util';
import { requireAdmin } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const put = requireAdmin(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    await transaction(locals, (trx) =>
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

export const del = requireAdmin(async ({ locals, params }) => {
  try {
    const names = await transaction(locals, (trx) =>
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
