import { allowed } from './params';
import { applyHeadwordGlossSearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount,
  getLanguageIds, knex, name_auto, pgError, setTransactionUser } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { error, json } from '@sveltejs/kit';
import { getFilteredParams, isIdArray, mungeRegex, normalizeQuery, parseArrayNumParams, parseArrayParams,
  parseBooleanParams, showPublicOnly } from '$lib/util';
import { requireAuth, requireComparative } from '$lib/auth';

const allowedSearch = new Set(['asc', 'author_id', 'gloss', 'glosslang', 'headword', 'headword_exact',
  'headword_ipa', 'headword_ipa_exact', 'lang', 'note', 'page', 'pagesize', 'sort', 'source']);
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

export const GET = requireComparative(async ({ locals, url: { searchParams } }) => {
  let query = getFilteredParams(normalizeQuery(searchParams), allowedSearch);
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

  if ('note' in query) {
    const note = mungeRegex(query.note);
    q.where(function () {
      this.where('set.note', '~*', mungeRegex(note))
      .orWhereExists(function () {
        this.from('set_member')
        .where('set_member.set_id', knex.ref('set.id'))
        .where('set_member.note', '~*', note);
      });
    });
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

  return json({
    query,
    pageCount,
    rowCount,
    rows,
  });
});

export const POST = requireAuth(async ({ locals, request }) => {
  const body = await request.json();
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      throw error(400);
    }
    ({ members } = body);
    delete body.members;
  }

  let reassign = false;
  if ('reassignExisting' in body) {
    reassign = body.reassignExisting;
    delete body.reassignExisting;
  }

  const params = getFilteredParams(body, allowed);
  params.author_id = locals.user.id;
  try {
    const id = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      const rows = await trx('set')
        .returning('id')
        .insert(params);
      const [{ id }] = rows;
      if (members) {
        if (reassign) {
          await trx('set_member')
            .update({ set_id: id })
            .where('entry_id', arrayCmp(members));
        } else {
          await trx('set_member')
            .insert(members.map((v) => ({ entry_id: v, set_id: id })));
        }
      }
      return id;
    });
    return json({ id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
