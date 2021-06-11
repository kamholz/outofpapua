<script>
  import { goto } from '$app/navigation';
  import { login, logout } from '$actions/auth';
  import { pageLoading } from '$lib/stores';
  import { session } from '$app/stores';

  export let username;
  let password;
  let promise;

  async function handleLogin() {
    $pageLoading++;
    try {
      promise = login(username, password);
      await promise;
      password = null;
    } catch (e) {}
    $pageLoading--;
  }

  async function handleLogout() {
    $pageLoading++;
    try {
      promise = logout();
      await promise;
      $session.user = null;
      goto('/');
    } catch (e) {}
    $pageLoading--;
  }
</script>

<div>
  {#if promise}
    {#await promise catch { message} }
      <span class="error">{message}</span>
    {/await}
  {/if}
  {#if $session.user}
    <span>Logged in as: <a href="/profile" sveltekit:prefetch><strong>{$session.user.fullname}</strong></a></span>
    <button on:click={handleLogout}>Logout</button>
  {:else}
    <form on:submit|preventDefault={handleLogin}>
      <label for="username">Email:</label>
      <input type="text" id="username" name="username" bind:value={username}>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" bind:value={password}>
      <button type="submit" disabled={$pageLoading}>Login</button>
    </form>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 85%;

    .error {
      padding: .3em .6em;
      border-radius: .2em;
      margin-inline-end: .4em;
      @include error_color;
      border: 1px solid transparent;
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
