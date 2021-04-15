<script>
  import { session } from '$app/stores';

  let username;
  let password;

  const handleSubmit = async () => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username, password })
    });
    console.log(res);
  };
</script>

{#if $session.user}
  Logged in as {$session.user}
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    Username: <input type="text" name="username" bind:value={username}><br>
    Password: <input type="password" name="password" bind:value={password}><br>
    <input type="submit">
  </form>
{/if}
