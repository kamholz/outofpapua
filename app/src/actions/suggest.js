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
    if (row.descendants?.length > 1) {
      suggestRows.push({ id: `${row.id}+`, name: `${row.name}+` });
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

export async function protosource(fetch) {
  const res = await fetch('/api/source.json?category=proto');
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  return rows.map((row) => ({ id: row.id, name: `${row.title}: ${row.reference}` }));
}

export async function setMember(search) {
  const res = await fetch('/api/entry.json?' + new URLSearchParams({ search, noset: 1 }));
  if (!res.ok) {
    return null;
  }
  const { rows } = await res.json();
  for (const row of rows) {
    row.senses = row.senses.map((sense) =>
      sense.glosses.map(({ language, txt }) =>
        `‘${txt.join(', ')}’ (${language})`
      ).join('; ')
    );
  }
  return rows;
}
