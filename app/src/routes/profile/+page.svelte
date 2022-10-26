<script>
  import ProfilePage from './Page.svelte';
  import { page } from '$app/stores';

  const user = { ...$page.data.user };
  delete user.admin;
</script>

<ProfilePage {user} admin={false} />
