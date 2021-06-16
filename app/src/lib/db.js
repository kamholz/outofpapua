import config from '$config';
import knexModule from 'knex';
import { mungeRegex } from '$lib/util';

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

const pageMax = 2000;

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
    q.orderByRaw(sortCols[querySort] + (query.asc ? ' asc nulls last' : ' desc nulls last'));
  }
  for (const col of restCols) {
    if (col !== querySort) {
      q.orderByRaw(sortCols[col]);
    }
  }
}

export async function getCount(q) {
  const count = await q.clone().count({ count: '*' }).first();
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
  } else if (query.origin === 'unknown') {
    q.whereNull('entry.origin');
  }
}

export function applyHeadwordGlossSearchParams(q, query) {
  if ('headword' in query) {
    q.where('entry.headword', '~*', mungeRegex(query.headword));
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

export function filterGlosslang(query, rows, includeCompareEntries) {
  if ('glosslang' in query) {
    const set = new Set(query.glosslang);
    for (const row of rows) {
      for (const sense of row.senses) {
        sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
      }
    }

    if (includeCompareEntries) {
      for (const row of rows) {
        if (row.compare_entries) {
          for (const entry of row.compare_entries) {
            for (const sense of entry.senses) {
              sense.glosses = sense.glosses.filter((glosses) => set.has(glosses.language_id));
            }
          }
        }
      }
    }
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
