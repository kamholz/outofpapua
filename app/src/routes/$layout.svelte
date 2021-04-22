<script>
  import Fa from 'svelte-fa/src/fa.svelte';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons'

  import { session } from '$app/stores';
  import Login from '$components/Login.svelte';
  import NavBar from '$components/NavBar.svelte';
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

{#if $session.loading > 0}
<Fa
  id="spinner"
  icon={faSpinner}
  class="fas fa-spinner fa-pulse"
/>
{/if}
<Login username={$session.user?.username} />
<NavBar />

<slot />

<style>
  @import '../app.scss';
  @import '../../static/fontawesome.css';
</style>