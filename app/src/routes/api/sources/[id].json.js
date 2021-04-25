import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';

const allowed = new Set(['name','parent_id']);

export const put = requireAuth(async ({ params, body }) => {
});