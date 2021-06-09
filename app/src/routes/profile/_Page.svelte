<script>
  import Alert from '$components/Alert.svelte';
  import PasswordForm from './_PasswordForm.svelte';
  import PreferenceForm from './_PreferenceForm.svelte';
  import ProfileForm from './_ProfileForm.svelte';
  import { goto } from '$app/navigation';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';

  export let user;
  export let admin;
  let promise;

  const del = crud.makeDeleter('user');

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete user "${user.fullname}"?`)) {
      $pageLoading++;
      try {
        promise = del(user.id);
        await promise;
        goto('/users');
      } catch (e) {}
      $pageLoading--;
    }
  }
</script>

<h2>Profile</h2>
{#if promise}
  {#await promise catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<ProfileForm
  {user}
  {admin}
/>

{#if !admin}
  <h3>Preferences</h3>
  <PreferenceForm />
{/if}

<h3>Change password</h3>
<PasswordForm
  {user}
  {admin}
/>

{#if admin && !user.admin}
  <button on:click={handleDelete}>Delete User</button>
{/if}

<style>
  button {
    margin-block-start: 3em;
  }
</style>
