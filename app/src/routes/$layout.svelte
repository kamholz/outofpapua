<script>
  import Icon from 'svelte-awesome';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons'

  import { session } from '$app/stores';
  import Login from '$components/Login.svelte';
  import NavBar from '$components/NavBar.svelte';
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

{#if $session.loading > 0}
<Icon
  id="spinner"
  data={faSpinner}
  pulse
/>
{/if}
<Login username={$session.user?.username} />
<NavBar />

<slot />

<style>
  @import '../app.scss';
  @import '../../static/fontawesome.css';
</style>