<script>
  import ProfilePage from '../ProfilePage.svelte';

  export let data;
  $: ({ user } = data);
</script>

<ProfilePage {user} adminView={true} />
