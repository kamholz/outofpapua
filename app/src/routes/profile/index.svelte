<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad();
</script>

<script>
  import ProfilePage from './_Page.svelte';
  import { session } from '$app/stores';

  const user = { ...$session.user };
  delete user.admin;
</script>

<ProfilePage {user} admin={false} />
