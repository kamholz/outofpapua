import { allowed, table } from './_params';
import { applyHeadwordGlossSearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount, knex,
  sendPgError, transaction } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, isIdArray, normalizeQuery, parseArrayNumParams, parseArrayParams,
  parseBooleanParams, partitionPlus } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowedSearch = new Set(['asc', 'gloss', 'glosslang', 'headword', 'lang', 'page', 'pagesize', 'sort', 'source']);
const boolean = new Set(['asc']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang', 'source']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.listPageSize,
  sort: 'name',
};
const sortCols = {
  name: "coalesce(set.name, lpad(set.id::text, 10, '0'))",
};

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowedSearch);
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  query = { ...defaults, ...query };

  const q = knex('set_with_members as set');

  const existsq = knex('set_member')
    .where('set_member.set_id', knex.ref('set.id'))
    .join('entry', 'entry.id', 'set_member.entry_id');
  let existsqNeeded = false;

  if ('headword' in query || 'gloss' in query) {
    applyHeadwordGlossSearchParams(existsq, query);
    existsqNeeded = true;
  }

  if ('lang' in query) {
    const [lang, langPlus] = partitionPlus(query.lang);
    if (langPlus.length) {
      const descendants = await knex('language_with_descendants')
        .where('id', arrayCmp(new Set(langPlus)))
        .pluck('descendants');
      for (const d of descendants) {
        lang.push(...d);
      }
    }

    if (lang.length) {
      existsq
        .join('source', 'source.id', 'entry.source_id')
        .where('source.language_id', arrayCmp(new Set(lang)));
      existsqNeeded = true;
    }
  }

  if ('source' in query) {
    existsq.where('entry.source_id', arrayCmp(query.source));
    existsqNeeded = true;
  }

  if (existsqNeeded) {
    q.whereExists(existsq);
  }

  const rowCount = await getCount(q);

  q.select(
    'set.id',
    'set.note',
    knex.raw('coalesce(set.name, set.id::text) as name'),
    'set.members'
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['name']);

  const rows = await q;
  filterGlosslang(query, rows);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}

export const post = requireAuth(async ({ body, locals }) => {
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      return { status: 400 };
    }
    ({ members } = body);
    delete body.members;
  }
  const params = getFilteredParams(body, allowed);
  try {
    const id = await transaction(locals, async (trx) => {
      const ids = await trx(table)
        .returning('id')
        .insert(params);
      const [id] = ids;
      if (members) {
        await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v, set_id: id })));
        // would override existing set membership
        // .onConflict('entry_id')
        // .merge(['set_id']);
      }
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
