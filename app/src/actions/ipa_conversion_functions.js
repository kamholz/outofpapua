import { serializeArrayParam } from '$lib/util';

export default async function (fetch, entries) {
  const names = new Set(entries.map(({ source }) => source.ipa_conversion_rule));
  if (!names.size) {
    return {};
  }
  const res = await fetch('/api/ipa_conversion_rule.json?'
    + new URLSearchParams({ type: 'javascript_code', names: serializeArrayParam(names) }));
  if (!res.ok) {
    return null;
  }
  const rules = (await res.json()).rows;
  return Object.fromEntries(rules.map((rule) => [rule.name, (0, eval)(rule.javascript_code)]));
}
