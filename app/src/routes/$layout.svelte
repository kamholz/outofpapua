<script>
  import '../app.scss';
  import Login from '$components/Login.svelte';
  import NavBar from '$components/NavBar.svelte';
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

<Login />
<NavBar />

<slot />
