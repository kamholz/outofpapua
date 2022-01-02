<script context="module">
  import { requireAdminLoad } from '$actions/auth';

  export const load = requireAdminLoad(async ({ fetch, params, session }) => {
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

  export let user;
</script>

<ProfilePage {user} admin={true} />
