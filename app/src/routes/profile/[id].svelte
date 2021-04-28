<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ page: { params }, session, fetch }) => {
    if (params.id == session.user.id) {
      return { status: 400, error: 'Bad request' };
    }
    try {
      const res = await fetch(`/api/user/${params.id}.json`);
      if (res.ok) {
        return {
          props: { 
            user: await res.json() 
          }
        };
      } else {
        return { status: 500, error: 'Internal error' };
      }
    } catch (e) {
      return { status: 500, error: 'Internal error' };
    }
  });
</script>

<script>
  import ProfilePage from '$components/pages/ProfilePage.svelte';
  export let user;
</script>

<main>
  <ProfilePage {user} admin={true} />
</main>