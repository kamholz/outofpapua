import errors from '$lib/errors';
import { getFilteredParams } from '$lib/util';
import { requireAdmin } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['chain_after', 'function', 'lowercase', 'replacements']);

export const put = requireAdmin(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
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
