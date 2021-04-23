<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  export const load = requireAuthLoad();
</script>

<script>
  import { session } from '$app/stores';
  import ProfilePage from '$components/ProfilePage.svelte';
</script>

<main>
  <ProfilePage user={$session.user} />
</main>