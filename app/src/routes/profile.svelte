<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  export const load = requireAuthLoad();
</script>

<script>
  import { session } from '$app/stores';
  import ProfilePage from '$components/ProfilePage.svelte';
  const user = {...$session.user};
  delete user.admin;
</script>

<main>
  <ProfilePage {user} />
</main>