<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';

  export let user;
  export let admin = false;

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

  if (admin) {
    fields.push({
      name: 'admin',
      label: 'Admin',
      type: 'checkbox',
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
  {#await promise then done}
    <Alert type="success" message="Changes saved" />
  {:catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<Form
  {fields}
  values={user}
  submitLabel="Save"
  on:submit={handleUpdate}
/>
