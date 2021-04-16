<script>
  import { userSession } from '$stores';

  let username;
  let password;

  const handleSubmit = async () => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username, password })
    });
    if (res.ok) {
      const json = await res.json();
      $userSession.user = json.user;
    }
  };
</script>

{#if $userSession.user}
  Logged in as {$userSession.user.fullname}
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    Username: <input type="text" name="username" bind:value={username}><br>
    Password: <input type="password" name="password" bind:value={password}><br>
    <input type="submit">
  </form>
{/if}
