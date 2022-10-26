<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let user;
  export let adminView;

  const roles = [
    { id: 'contributor', name: 'Contributor' },
    { id: 'editor', name: 'Editor' },
    { id: 'admin', name: 'Admin' },
  ];

  const fields = [
    {
      name: 'username',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'fullname',
      label: 'Full name',
      type: 'text',
      required: true,
    },
  ];

  if (adminView) {
    fields.push({
      name: 'role',
      label: 'Role',
      type: 'suggest',
      options: roles,
      required: true,
    });
  }

  const update = crud.makeUpdater('user');
  let promise;

  async function handleUpdate(e) {
    const { values } = e.detail;
    $pageLoading++;
    try {
      promise = update({ id: user.id, values });
      await promise;
    } catch (err) {}
    $pageLoading--;
  }
</script>

{#if promise}
  {#await promise then}
    <Alert type="success" message="Changes saved" />
  {:catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<Form
  {fields}
  values={user}
  style="--form-width: 23em; --label-width: 28%;"
  submitLabel="Save"
  on:submit={handleUpdate}
/>
