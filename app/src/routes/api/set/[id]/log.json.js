import { knex } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { validateParams } from '$lib/util';

export const get = validateParams(requireAuth(async ({ params }) => {
  const log = await knex('set_log')
    .join('usr', 'usr.id', 'set_log.usr_id')
    .where('set_log.set_id', params.id)
    .select(
      'set_log.usr_id',
      'set_log.event',
      'set_log.details',
      'set_log.log_time'
    )
    .orderBy('log_time')
    .orderBy('event');
  if (log) {
    return { body: log };
  } else {
    return { status: 404, body: '' };
  }
}));
