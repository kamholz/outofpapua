<script>
  import { userSession } from '$stores';
  import { login, logout } from '$actions/auth';

  let username = $userSession.user && $userSession.user.username;
  let password;
  let error = null;
  let loggingIn = false;

  async function handleLogin() {
    loggingIn = true;
    try {
      $userSession.user = await login(username, password);
      password = null;
    } catch (e) {
      error = e;
    } finally {
      loggingIn = false;
    }
  }

  async function handleLogout() {
    await logout();
    $userSession.user = null;
  }
</script>

{#if $userSession.user}
  Logged in as {$userSession.user.fullname}
  <button on:click={handleLogout}>Logout</button>
{:else}
  {#if loggingIn}
    Logging you in...
  {:else}
    <form on:submit|preventDefault={handleLogin}>
      Email: <input type="text" name="username" bind:value={username}><br>
      Password: <input type="password" name="password" bind:value={password}><br>
      <input type="submit">
    </form>
    {#if error}
      <span>{error}</span>
    {/if}
  {/if}
{/if}
