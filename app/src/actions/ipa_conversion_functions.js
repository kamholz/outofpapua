import { serializeArrayParam } from '$lib/util';

export function ipaConversionFunctionsFromEntries(fetch, entries) {
  const names = new Set(
    entries
      .filter(({ source }) => source.ipa_conversion_rule)
      .map(({ source }) => source.ipa_conversion_rule)
  );
  return ipaConversionFunctions(fetch, names);
}

export async function ipaConversionFunctions(fetch, names) {
  if (names instanceof Set) {
    if (!names.size) {
      return {};
    }
  } else if (!names.length) {
    return {};
  }
  const res = await fetch('/api/ipa_conversion_rule?'
    + new URLSearchParams({ type: 'javascript_code', names: serializeArrayParam(names) }));
  if (!res.ok) {
    return null;
  }
  const rules = (await res.json()).rows;
  return Object.fromEntries(rules.map((rule) => [rule.name, (0, eval)(rule.javascript_code)]));
}
