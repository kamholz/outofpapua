import { error } from '@sveltejs/kit';
import { requireEditorLoad } from '$actions/auth';

export const arrayFields = ['chain_after', 'chain_before', 'lib'];
const stringifyFields = [...arrayFields, 'replacements'];
export const nullifyFields = [...stringifyFields, 'function'];

export const load = requireEditorLoad(async ({ fetch }) => {
  const res = await fetch('/api/ipa_conversion_rule?type=raw');
  if (!res.ok) {
    throw error(500);
  }

  const rules = (await res.json()).rows;

  for (const rule of rules) {
    for (const field of stringifyFields) {
      if (rule[field]) {
        rule[field] = JSON.stringify(rule[field]);
      }
    }
  }

  return {
    rules,
  };
});
