<script>
  import { session } from '$app/stores';
  import { login, logout } from '$actions/auth';
  import { goto } from '$app/navigation';

  let username = $session.user?.username;
  let password;
  let error = null;
  let loggingIn = false;

  async function handleLogin() {
    loggingIn = true;
    $session.loading++;
    try {
      await login(username, password);
      password = null;
    } catch (e) {
      error = e;
    } finally {
      loggingIn = false;
      $session.loading--;
    }
  }

  async function handleLogout() {
    try {
      $session.loading++;
      await logout();
      goto('/');
    } catch (e) {
      error = e;
    } finally {
      $session.loading--;
    }
  }
</script>

<div id="login">
{#if $session.user}
  <span>Logged in as <strong>{$session.user.fullname}</strong></span>
  <button on:click={handleLogout}>Logout</button>
{:else}
  <form on:submit|preventDefault={handleLogin}>
    <label for="username">Email:</label>
    <input type="text" name="username" bind:value={username}>
    <label for="password">Password:</label>
    <input type="password" name="password" bind:value={password}>
    <button type="submit" disabled={loggingIn}>Login</button>
  </form>
  {#if error}
    <span>{error}</span>
  {/if}
{/if}
</div>

<style>
  #login {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 85%;
  }

  label {
    margin-inline-start: 0.75em;
  }

  input[type="text"] {
    inline-size: 12em;
  }

  input[type="password"] {
    inline-size: 7em;
  }

  button {
    margin-inline-start: 0.75em;
  }
</style>
