import { error, redirect } from '@sveltejs/kit';
import { requireEditorLoad } from '$actions/auth';

const defaultLib = 'syllabify';
const defaultLibUrl = `/ipa_conversion_libs/${defaultLib}`;

export const load = requireEditorLoad(async ({ fetch, params: { name } }) => {
  if (!name?.length) {
    throw redirect(302, defaultLibUrl);
  }

  const res = await fetch('/api/ipa_conversion_lib');
  if (!res.ok) {
    throw error(500);
  }

  const libs = (await res.json()).rows;

  const found = libs.find((lib) => lib.name === name);
  if (!found && name !== defaultLib) {
    throw redirect(302, defaultLibUrl);
  }

  return {
    libs,
    name,
  };
});
