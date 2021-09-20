import errors from '$lib/errors';
import { allowedCreateUpdate } from './_params';
import { getFilteredParams } from '$lib/util';
import { requireAdmin } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const put = requireAdmin(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowedCreateUpdate);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    await transaction(locals, (trx) =>
      trx('ipa_conversion_rule')
      .where('name', params.name)
      .update(updateParams)
    );
    return { body: '' };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
