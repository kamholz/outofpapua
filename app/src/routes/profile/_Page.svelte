<script>
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import ProfileForm from './_ProfileForm.svelte';
  import PasswordForm from './_PasswordForm.svelte';
  import Alert from '$components/Alert.svelte';

  export let user;
  export let admin = false;
  let error = null;

  const del = crud.makeDeleter('user');

  async function handleDelete(e) {
    if (confirm(`Are you sure you want to delete user "${user.fullname}"?`)) {
      $pageLoading++;
      try {
        error = null;
        await del(user.id);
        goto('/users');
      } catch (err) {
        error = err.message;
      }
      $pageLoading--;
    }
  }
</script>

<div in:fade={{ duration: 200 }}>
<h2>Profile</h2>
<Alert type="error" message={error} />
<ProfileForm
  {user}
  {admin}
/>

<h3>Change password</h3>
<PasswordForm
  {user}
  {admin}
/>

{#if admin && !user.admin}
  <button on:click={handleDelete}>Delete User</button>
{/if}
</div>

<style>
  button {
    margin-block-start: 3em;
  }
</style>