import config from '$config';
import knexModule from 'knex';
import { mungeRegex, partitionPlus, showPublicOnly } from '$lib/util';
import { pageMax } from '$lib/preferences';

export const knex = knexModule({
  client: 'pg',
  connection: {
    host: config.PGHOST,
    database: config.PGDATABASE,
  },
});

export function transaction(locals, cb) {
  const userId = locals.user?.id;
  return knex.transaction(async (trx) => {
    if (userId) {
      await trx.select(knex.raw("set_config('outofpapua.usr_id', ?::text, true)", userId));
    }
    return cb(trx);
  });
}

export function arrayCmp(param) {
  const list = [...param];
  return list.length === 1
    ? list[0]
    : knex.raw('any(?)', [list]);
}

// pagination and sorting

export function applyPageParams(q, query, count) {
  if (!String(query.pagesize).match(/^[0-9]+$/)) {
    query.pagesize = Infinity;
  }
  const pageSize = Math.min(query.pagesize, pageMax);
  const pageCount = Math.ceil(count / pageSize);

  let page = Number(query.page);
  if (page < 1) {
    page = 1;
  } else if (page > pageCount) {
    page = pageCount;
  }

  q.limit(pageSize);
  if (page > 1) {
    q.offset((page - 1) * pageSize);
  }

  query.page = page;
  query.pagesize = pageSize;

  return pageCount;
}

export function applySortParams(q, query, sortCols, restCols) {
  const querySort = 'sort' in query && query.sort in sortCols && query.sort;
  if (querySort) {
    applySortParam(sortCols[querySort]);
  }
  for (const col of restCols) {
    if (col !== querySort) {
      applySortParam(sortCols[col]);
    }
  }

  function applySortParam(sort) {
    if (Array.isArray(sort)) {
      for (const s of sort) {
        q.orderByRaw(s + (query.asc ? ' asc nulls last' : ' desc nulls last'));
      }
    } else {
      q.orderByRaw(sort + (query.asc ? ' asc nulls last' : ' desc nulls last'));
    }
  }
}

export async function getCount(q) {
  const count = await q.clone().count({ count: '*' }).first();
  return Number(count.count);
}

export async function getCountDistinct(q, col) {
  const count = await q.clone().countDistinct({ count: col }).first();
  return Number(count.count);
}

// searching

export function applyEntrySearchParams(q, query) {
  applyHeadwordGlossSearchParams(q, query);

  if (query.set === 'linked') {
    q.join('set_member', 'set_member.entry_id', 'entry.id');
  } else if (query.set === 'unlinked') {
    q
      .leftJoin('set_member', 'set_member.entry_id', 'entry.id')
      .whereNull('set_member.set_id');
  }

  if (query.origin === 'inherited' || query.origin === 'borrowed') {
    q.where('entry.origin', query.origin);
    if (query.origin === 'borrowed' && query.borrowlang) {
      q.where('entry.origin_language_id', arrayCmp(query.borrowlang));
    }
  } else if (query.origin === 'unknown') {
    q.whereNull('entry.origin');
  }

  if ('record' in query) {
    q
      .join('record', 'record.id', 'entry.record_id')
      .where(knex.raw('record_text(record.data)'), '~*', mungeRegex(query.record));
  }
}

export function applyHeadwordGlossSearchParams(q, query) {
  for (const p of ['headword', 'headword_ipa']) {
    if (p in query) {
      q.where(query[`${p}_exact`] ? `entry.${p}` : `entry.${p}_degr`, '~*', mungeRegex(query[p]));
    }
  }

  if ('gloss' in query) {
    q
      .join('sense', 'sense.entry_id', 'entry.id')
      .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
      .where('sense_gloss.txt', '~*', query.gloss);

    if ('glosslang' in query) {
      q.where('sense_gloss.language_id', arrayCmp(new Set(query.glosslang)));
    }
  }
}

export function filterPublicSources(q, locals) {
  if (showPublicOnly(locals)) {
    q.whereRaw('source.public');
  }
}

// glosses

const glossLanguage = 'eng';

export function getGlossLanguage(trx) {
  return (trx || knex)('language')
    .where('iso6393', glossLanguage)
    .first('id');
}

export async function insertGlosses(trx, { language_id, sense_id, glosses }) {
  for (const [i, txt] of glosses.entries()) {
    await trx('sense_gloss')
      .insert({ sense_id, language_id, txt, seq: i + 1 });
  }
}

export function filterGlosslang(query, rows, filterCompareEntries) {
  if ('glosslang' in query) {
    const set = new Set(query.glosslang);
    for (const row of rows) {
      for (const sense of row.senses) {
        sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
      }
    }

    if (filterCompareEntries) {
      for (const { compare_entries } of rows) {
        if (compare_entries) {
          for (const { entries } of compare_entries) {
            for (const entry of entries) {
              for (const sense of entry.senses) {
                sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
              }
            }
          }
        }
      }
    }
  }
}

// language and descendants

export async function getLanguageIds(param) {
  const [lang, langPlus] = partitionPlus(param);
  if (langPlus.length) {
    const descendants = await knex('language')
      .where('id', arrayCmp(new Set(langPlus)))
      .pluck('descendants');
    for (const d of descendants) {
      lang.push(...d);
    }
  }
  if (lang.length) {
    return [...new Set(lang)];
  } else {
    return null;
  }
}

// error handling

export function sendPgError(e) {
  return { status: 400, body: { error: formatPgError(e) } };
}

function formatPgError(e) {
  switch (e.code) {
    case '23502': // not_null_violation
      return `"${e.column}" value cannot be empty`;
    case '23505': // unique_violation
      return 'value already exists elsewhere, must be unique';
    case '23514': // check_violation
    case 'P0001': // raise_exception
      switch (e.constraint) {
        case 'language_parent_id_check':
          return 'tried to set parent language to descendant';
        case 'set_member_reflex_check':
          return 'invalid format for reflex';
        default:
          return 'unknown error';
      }
    default:
      return 'unknown error';
  }
}

// fixed SQL strings

export const name_auto = "coalesce(set.name_auto, json_build_object('txt', set.id::text, 'type', 'id')) as name_auto";
