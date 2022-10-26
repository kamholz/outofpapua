import { error } from '@sveltejs/kit';
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const res = await fetch('/api/ipa_conversion_rule?type=raw');
  if (!res.ok) {
    throw error(500);
  }

  return {
    rules: (await res.json()).rows,
  };
});
