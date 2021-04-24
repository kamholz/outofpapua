<script>
  import { session } from '$app/stores';
  import { pageLoading } from '$stores';
  import { login, logout } from '$actions/auth';
  import { goto } from '$app/navigation';

  export let username;
  let password;
  let error = null;
  let loggingIn = false;

  async function handleLogin() {
    loggingIn = true;
    $pageLoading++;
    try {
      await login(username, password);
      password = null;
      error = null;
    } catch (e) {
      error = e.message;
    }
    loggingIn = false;
    $pageLoading--;
  }

  async function handleLogout() {
    $pageLoading++;
    try {
      await logout();
      error = null;
      $session.user = null;
      goto('/');
    } catch (e) {
      error = e.message;
    }
    $pageLoading--;
  }
</script>

<div id="login">
  {#if error}
    <span class="error">{error}</span>
  {/if}
  {#if $session.user}
    <span>Logged in as: <a href="/profile"><strong>{$session.user.fullname}</strong></a></span>
    <button on:click={handleLogout}>Logout</button>
  {:else}
    <form on:submit|preventDefault={handleLogin}>
      <label for="username">Email:</label>
      <input type="text" name="username" bind:value={username}>
      <label for="password">Password:</label>
      <input type="password" name="password" bind:value={password}>
      <button type="submit" disabled={loggingIn}>Login</button>
    </form>
  {/if}
</div>

<style lang="scss">
  #login {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 85%;

    .error {
      padding: .3em .6em;
      border-radius: .2em;
      margin-inline-end: .4em;
      color: #721c24;
      background-color: #f8d7da;
      border: 1px solid transparent;
      border-color: #f5c6cb;
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
  }
</style>
