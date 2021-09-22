import { glossesSummary, serializeArrayParam } from '$lib/util';

export async function lang(fetch, view) {
  const res = await fetch('/api/language.json?' + new URLSearchParams({ view }));
  return res.ok ? (await res.json()).rows : null;
}

export async function langPlus(fetch, view) {
  const res = await fetch('/api/language.json?' + new URLSearchParams({ category: 'descendants', view }));
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  const suggestRows = [];
  for (const row of rows) {
    suggestRows.push(row);
    if (row.descendants?.length > 1) {
      suggestRows.push({ id: `${row.id}+`, name: `${row.name}+`, plus: true });
    }
  }
  return suggestRows;
}

export async function protolang(fetch, view) {
  const res = await fetch('/api/language.json?' + new URLSearchParams({ category: 'proto', view }));
  return res.ok ? (await res.json()).rows : null;
}

export async function glosslang(fetch, view) {
  const res = await fetch('/api/language.json?' + new URLSearchParams({ category: 'gloss', view }));
  return res.ok ? (await res.json()).rows : null;
}

export async function borrowlang(fetch, view) {
  const res = await fetch('/api/language.json?' + new URLSearchParams({ category: 'borrow', view }));
  return res.ok ? (await res.json()).rows : null;
}

export async function source(fetch, view) {
  const res = await fetch('/api/source.json?' + new URLSearchParams({ sort: 'language', view }));
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function editableSource(fetch, view) {
  const res = await fetch('/api/source.json?' + new URLSearchParams({ category: 'editable', sort: 'language', view }));
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function setAuthor(fetch, view) {
  const res = await fetch('/api/set/author.json?' + new URLSearchParams({ view }));
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: row.fullname }));
}

export async function setMember({ entry, languages, match, noset, search, view }, preferences) {
  const params = new URLSearchParams({ match, search, view });
  if (entry) {
    params.set('id', entry.id);
  }
  if (languages) {
   params.set('lang', serializeArrayParam(languages));
  }
  if (noset) {
    params.set('noset', '1');
  }
  const res = await fetch('/api/entry/suggest.json?' + params);
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
  const res = await fetch('/api/ipa_conversion_rule.json');
  return res.ok ? (await res.json()).rows : null;
}
