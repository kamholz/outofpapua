import errors from '$lib/errors';
import { allowed } from './_params';
import { applyHeadwordGlossSearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount,
  getLanguageIds, knex, name_auto, sendPgError, transaction } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, isIdArray, normalizeQuery, parseArrayNumParams, parseArrayParams, parseBooleanParams,
  showPublicOnly } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { viewSet } from '$lib/preferences';

const allowedSearch = new Set(['asc', 'author_id', 'gloss', 'glosslang', 'headword', 'headword_ipa', 'lang', 'page',
  'pagesize', 'sort', 'source', 'view']);
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
  name: ["set.name_auto ->> 'txt'", "lpad(set.id::text, 10, '0')"],
};

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowedSearch);
  if (!('view' in query) || !viewSet.has(query.view)) {
    return { status: 400, body: { error: errors.view } };
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  query = { ...defaults, ...query };

  const publicOnly = showPublicOnly(locals);

  const q = knex(`${publicOnly ? 'set_with_members_public' : 'set_with_members'} as set`);

  const existsq = knex('set_member')
    .where('set_member.set_id', knex.ref('set.id'))
    .join('entry', 'entry.id', 'set_member.entry_id');
  let existsqNeeded = false;

  let joinedSource = false;
  function joinSource() {
    if (!joinedSource) {
      existsq.join('source', 'source.id', 'entry.source_id');
      joinedSource = true;
    }
  }

  if ('headword' in query || 'headword_ipa' in query || 'gloss' in query) {
    applyHeadwordGlossSearchParams(existsq, query);
    existsqNeeded = true;
  }

  if ('author_id' in query) {
    q.where('set.author_id', query.author_id);
  }

  if ('lang' in query) {
    const lang = await getLanguageIds(query.lang);
    if (lang) {
      joinSource();
      existsq.where('source.language_id', arrayCmp(lang));
      existsqNeeded = true;
    }
  }

  if ('source' in query) {
    existsq.where('entry.source_id', arrayCmp(query.source));
    existsqNeeded = true;
  }

  if (existsqNeeded) {
    if (publicOnly) {
      joinSource();
      existsq.where('source.public');
    }
    q.whereExists(existsq);
  }

  const rowCount = await getCount(q);

  q.select(
    'set.id',
    'set.author_id',
    'set.author_name',
    'set.name',
    knex.raw(name_auto),
    'set.note',
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
  params.author_id = locals.user.id;
  try {
    const id = await transaction(locals, async (trx) => {
      const ids = await trx('set')
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
