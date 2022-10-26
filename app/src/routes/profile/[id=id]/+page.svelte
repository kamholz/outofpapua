<script>
  import ProfilePage from '../Page.svelte';

  export let user;
</script>

<ProfilePage {user} admin={true} />
