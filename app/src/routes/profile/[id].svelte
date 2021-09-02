<script context="module">
  import { requireAdminLoad } from '$actions/auth';

  export const load = requireAdminLoad(async ({ page: { params }, session, fetch }) => {
    if (session.user.id === Number(params.id)) {
      return { status: 400 };
    }
    try {
      const res = await fetch(`/api/user/${params.id}.json`);
      if (!res.ok) {
        return { status: 404 };
      }
      return {
        props: {
          user: await res.json(),
        },
      };
    } catch (e) {
      return { status: 500 };
    }
  });
</script>

<script>
  import ProfilePage from './_Page.svelte';
  import { getPreferences } from '$lib/stores';
  import { setContext } from 'svelte';

  export let user;
  setContext('preferences', getPreferences());
</script>

<ProfilePage {user} admin={true} />
