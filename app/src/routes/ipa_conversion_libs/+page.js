import { error } from '@sveltejs/kit';
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const res = await fetch('/api/ipa_conversion_lib');
  if (!res.ok) {
    throw error(500);
  }

  return {
    libs: (await res.json()).rows,
  };
});
