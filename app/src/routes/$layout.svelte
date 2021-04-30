<script>
  import '../app.scss';
  import Icon from 'svelte-awesome';
  import Login from '$components/Login.svelte';
  import NavBar from '$components/NavBar.svelte';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import { navigating, session } from '$app/stores';
  import { pageLoading } from '$stores';
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

{#if $navigating || $pageLoading > 0}
<div class="loading">
  <Icon data={faSpinner} pulse />
</div>
{/if}
<Login username={$session.user?.username} />
<NavBar />

<main>
<slot />
</main>
