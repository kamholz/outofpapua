export async function glosslang(fetch) {
  const res = await fetch('/api/languages.json?category=gloss');
  if (res.ok) {
    return (await res.json()).rows;
  }
  return null;
}