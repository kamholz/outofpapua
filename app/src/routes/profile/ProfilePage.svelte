<script>
  import Alert from '$components/Alert.svelte';
  import PasswordForm from './PasswordForm.svelte';
  import PreferenceForm from './PreferenceForm.svelte';
  import ProfileForm from './ProfileForm.svelte';
  import { goto } from '$app/navigation';
  import { isAdmin } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let user;
  export let adminView;
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

<svelte:head>
  <title>Profile | Out of Papua</title>
</svelte:head>

<h2>Profile</h2>
{#if promise}
  {#await promise catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<ProfileForm
  {user}
  {adminView}
/>

{#if !adminView}
  <h3>Preferences</h3>
  <PreferenceForm />
{/if}

<h3>Change password</h3>
<PasswordForm
  {user}
  {adminView}
/>

{#if adminView && !isAdmin(user)}
  <button type="button" class="delete" on:click={handleDelete}>Delete User</button>
{/if}