<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad();
</script>

<script>
  import ProfilePage from './_Page.svelte';
  import { getPreferences } from '$lib/stores';
  import { session } from '$app/stores';
  import { setContext } from 'svelte';

  setContext('preferences', getPreferences());

  const user = { ...$session.user };
  delete user.admin;
</script>

<ProfilePage {user} admin={false} />
