<script>
  import ProfilePage from '../ProfilePage.svelte';

  let { data } = $props();
  let { user } = $derived(data);
</script>

<ProfilePage {user} adminView={true} />
