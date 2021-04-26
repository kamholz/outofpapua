<script>
  import '../app.scss';
  import Icon from 'svelte-awesome';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons'

  import { session } from '$app/stores';
  import { pageLoading } from '$stores';
  import Login from '$components/Login.svelte';
  import NavBar from '$components/NavBar.svelte';
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

{#if $pageLoading > 0}
<Icon
  class="loading"
  data={faSpinner}
  pulse
/>
{/if}
<Login username={$session.user?.username} />
<NavBar />

<slot />