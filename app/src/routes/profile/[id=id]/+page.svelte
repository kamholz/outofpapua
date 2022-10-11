<script>
  import ProfilePage from '../Page.svelte';

  export let data;
  $: ({ user } = data);
</script>

<ProfilePage {user} admin={true} />
