import { error } from '@sveltejs/kit';
import { requireAdminLoad } from '$actions/auth';

export const load = requireAdminLoad(async ({ fetch, params, parent }) => {
  const { user } = await parent();
  if (user.id === Number(params.id)) {
    throw error(400);
  }
  try {
    const res = await fetch(`/api/user/${params.id}`);
    if (!res.ok) {
      throw error(404);
    }
    return {
      user: await res.json(),
    };
  } catch (e) {
    throw error(500);
  }
});
