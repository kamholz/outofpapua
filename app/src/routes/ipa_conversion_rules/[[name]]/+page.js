import { error, redirect } from '@sveltejs/kit';
import { requireEditorLoad } from '$actions/auth';

const defaultRule = 'common';
const defaultRuleUrl = `/ipa_conversion_rules/${defaultRule}`;

export const arrayFields = ['chain_after', 'chain_before', 'lib'];
const stringifyFields = [...arrayFields, 'replacements'];
export const nullifyFields = [...stringifyFields, 'function'];

export const load = requireEditorLoad(async ({ fetch, params: { name } }) => {
  if (!name?.length) {
    throw redirect(302, defaultRuleUrl);
  }

  const res = await fetch('/api/ipa_conversion_rule?type=raw');
  if (!res.ok) {
    throw error(500);
  }

  const rules = (await res.json()).rows;

  let found = false;
  for (const rule of rules) {
    if (!found && rule.name === name) {
      found = true;
    }

    for (const field of stringifyFields) {
      if (rule[field]) {
        rule[field] = JSON.stringify(rule[field]);
      }
    }
  }

  if (!found && name !== defaultRule) {
    throw redirect(302, defaultRuleUrl);
  }

  return {
    name,
    rules,
  };
});
