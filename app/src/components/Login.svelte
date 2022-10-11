<script>
  import { goto } from '$app/navigation';
  import { login, logout } from '$actions/auth';
  import { pageLoading, session } from '$lib/stores';
  
  export let username;
  let password;
  let promise;

  async function handleLogin() {
    $pageLoading++;
    try {
      promise = login(username, password);
      const user = await promise;
      $session.user = user;
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

<div class="login">
  {#if promise}
    {#await promise catch { message} }
      <span class="error">{message}</span>
    {/await}
  {/if}
  {#if $session.user}
    <span class="user">Logged in as: <a href="/profile" data-sveltekit-prefetch><strong>{$session.user.fullname}</strong></a></span>
    <button type="button" on:click={handleLogout}>Logout</button>
  {:else}
    <form on:submit|preventDefault={handleLogin} action="/auth/login" method="POST">
      <div class="fields">
        <label>
          <span>Email:</span>
          <input type="text" id="username" name="username" bind:value={username}>
        </label>
        <label>
          <span>Password:</span>
          <input type="password" id="password" name="password" bind:value={password}>
        </label>
      </div>
      <button type="submit" disabled={$pageLoading}>Login</button>
    </form>
  {/if}
</div>

<style lang="scss">
  .login {
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

    .user {
      margin-inline-start: 12px;
    }

    form, .fields {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      row-gap: 6px;
    }

    label {
      margin-inline-start: 0.75em;
    }

    input {
      inline-size: 8em;
    }

    button {
      margin-inline-start: 0.75em;
    }
  }
</style>
