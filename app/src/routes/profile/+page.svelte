<script>
  import ProfilePage from './ProfilePage.svelte';
  import { session } from '$lib/stores';

  const user = { ...$session.user };
</script>

<ProfilePage {user} adminView={false} />
