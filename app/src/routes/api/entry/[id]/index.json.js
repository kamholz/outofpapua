import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { isProto, nfc, table } from '../_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowedAll = new Set(['headword_normalized', 'note', 'pos', 'root']);
const allowedProto = new Set([...allowedAll, 'headword', 'pos', 'source_id']);

export const put = requireAuth(async ({ body, locals, params }) => {
  const id = Number(params.id);
  const proto = await isProto(id);
  const updateParams = getFilteredParams(body, proto ? allowedProto : allowedAll);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await transaction(locals, (trx) =>
      trx(table)
      .where('id', id)
      .returning('id')
      .update(updateParams)
    );
    if (rows.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
