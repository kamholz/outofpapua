import { glossesSummary, serializeArrayParam } from '$lib/util';

export async function lang(fetch) {
  const res = await fetch('/api/language.json');
  return res.ok ? (await res.json()).rows : null;
}

export async function langPlus(fetch) {
  const res = await fetch('/api/language.json?category=descendants');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  const suggestRows = [];
  for (const row of rows) {
    suggestRows.push(row);
    if (row.descendants) {
      suggestRows.push({ id: `${row.id}+`, name: `${row.name}+`, plus: true });
    }
  }
  return suggestRows;
}

export async function protolang(fetch) {
  const res = await fetch('/api/language.json?category=proto');
  return res.ok ? (await res.json()).rows : null;
}

export async function glosslang(fetch) {
  const res = await fetch('/api/language.json?category=gloss');
  return res.ok ? (await res.json()).rows : null;
}

export async function borrowlang(fetch) {
  const res = await fetch('/api/language.json?category=borrow');
  return res.ok ? (await res.json()).rows : null;
}

export async function source(fetch) {
  const res = await fetch('/api/source.json?sort=language');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function editableSource(fetch) {
  const res = await fetch('/api/source.json?category=editable&sort=language');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.language}: ${row.reference}` }));
}

export async function setAuthor(fetch) {
  const res = await fetch('/api/set/author.json');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: row.fullname }));
}

export async function setMember({ entry, languages, match, noset, search }, preferences) {
  const params = new URLSearchParams({ match, search });
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
