<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  export const load = requireAuthLoad();
</script>

<script>
  import { session } from '$app/stores';
  import ProfilePage from './_Page.svelte';
  const user = {...$session.user};
  delete user.admin;
</script>

<ProfilePage {user} />
