import { serializeArrayParam } from '$lib/util';

export async function lang(fetch) {
  const res = await fetch('/api/language.json?category=descendants');
  if (!res.ok) {
    return null;
  }
  const rows = (await res.json()).rows;
  const suggestRows = [];
  for (const row of rows) {
    suggestRows.push(row);
    if (row.descendants?.length > 1) {
      suggestRows.push({ id: serializeArrayParam(row.descendants), name: `${row.name}+` });
    }
  }
  return suggestRows;
}

export async function glosslang(fetch) {
  const res = await fetch('/api/language.json?category=gloss');
  if (!res.ok) {
    return null;
  }
  return (await res.json()).rows;
}