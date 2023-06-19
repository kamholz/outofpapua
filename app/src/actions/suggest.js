import { glossesSummary, serializeArrayParam } from '$lib/util';

export async function lang(fetch) {
  const res = await fetch('/api/language');
  return res.ok ? (await res.json()).rows : null;
}

export async function langPlus(fetch) {
  const res = await fetch('/api/language?category=descendants');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  const suggestRows = [];
  for (const row of rows) {
    row.id = String(row.id);
    if (!row.empty) {
      suggestRows.push(row);
    }
    if (row.descendants) {
      suggestRows.push({ id: `${row.id}+`, name: `${row.name}+`, plus: true });
    }
  }
  return suggestRows;
}

export async function protolang(fetch) {
  const res = await fetch('/api/language?category=proto');
  return res.ok ? (await res.json()).rows : null;
}

export async function glosslang(fetch) {
  const res = await fetch('/api/language?category=gloss');
  return res.ok ? (await res.json()).rows : null;
}

export async function borrowlang(fetch) {
  const res = await fetch('/api/language?category=borrow');
  return res.ok ? (await res.json()).rows : null;
}

export async function region(fetch) {
  const res = await fetch('/api/region');
  return res.ok ? (await res.json()).rows : null;
}

export async function source(fetch) {
  const res = await fetch('/api/source?sort=language');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function editableSource(fetch) {
  const res = await fetch('/api/source?category=editable&sort=language');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function set({ entry_id, search, set_id, exclude_grouped }) {
  const params = new URLSearchParams({ search });
  if (entry_id) {
    params.set('entry_id', entry_id);
  }
  if (set_id) {
    params.set('id', set_id);
  }
  if (exclude_grouped) {
    params.set('exclude_grouped', 1);
  }
  const res = await fetch('/api/set/suggest?' + params);
  if (!res.ok) {
    return null;
  }
  return (await res.json()).rows;
}

export async function setAuthor(fetch) {
  const res = await fetch('/api/set/author');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: row.fullname }));
}

export async function setMember({ entry_id, languages, linked, match, search, set_id }, preferences) {
  const params = new URLSearchParams({ match, search });
  if (entry_id) {
    params.set('id', entry_id);
  }
  if (set_id) {
    params.set('set_id', set_id);
  }
  if (languages) {
    params.set('lang', serializeArrayParam(languages));
  }
  if (linked) {
    params.set('linked', 1);
  }
  const res = await fetch('/api/entry/suggest?' + params);
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  for (const row of rows) {
    row.senses = row.senses.map((sense) => glossesSummary(sense.glosses, preferences));
  }
  return rows;
}

export async function ipaConversionRule(fetch) {
  const res = await fetch('/api/ipa_conversion_rule');
  return res.ok ? (await res.json()).rows : null;
}
