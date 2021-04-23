<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ page: { params }, session, fetch }) => {
    if (params.id == session.user.id) {
      return { status: 400, error: 'Bad request' };
    } else {
      try {
        const res = await fetch(`/api/users/${params.id}.json`);
        if (res.ok) {
          return { 
            props: { 
              user: await res.json() 
            } 
          };
        }
      } catch (e) {
        return { status: 500, error: 'Internal error' };
      }
    }
    return {};
  });
</script>

<script>
  import { session } from '$app/stores';
  import ProfilePage from '$components/ProfilePage.svelte';
  export let user = $session.user;
</script>

<main>
  <ProfilePage {user} admin={true} />
</main>