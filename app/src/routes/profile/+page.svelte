<script>
  import ProfilePage from './Page.svelte';
  import { session } from '$lib/stores';

  const user = { ...$session.user };
  delete user.admin;
</script>

<ProfilePage {user} admin={false} />
