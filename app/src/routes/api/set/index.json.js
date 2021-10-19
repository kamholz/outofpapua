import { allowed } from './_params';
import { applyHeadwordGlossSearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount,
  getLanguageIds, knex, name_auto, sendPgError, transaction } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, isIdArray, normalizeQuery, parseArrayNumParams, parseArrayParams, parseBooleanParams,
  showPublicOnly } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowedSearch = new Set(['asc', 'author_id', 'gloss', 'glosslang', 'headword', 'headword_exact',
  'headword_ipa', 'headword_ipa_exact', 'lang', 'page', 'pagesize', 'sort', 'source']);
const boolean = new Set(['asc', 'headword_exact', 'headword_ipa_exact']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang', 'source']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.listPageSize,
  sort: 'name',
};
const sortCols = {
  name: ["sd.name_auto ->> 'txt'", "lpad(set.id::text, 10, '0')"],
};

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowedSearch);
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  query = { ...defaults, ...query };

  const publicOnly = showPublicOnly(locals);

  const q = knex('set')
    .join(`${publicOnly ? 'set_details_public' : 'set_details'} as sd`, 'sd.id', 'set.id');

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
    'sd.author_name',
    'set.name',
    knex.raw(name_auto),
    'set.note',
    'sd.members'
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
        // .onConflict(['entry_id', 'set_id'])
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
