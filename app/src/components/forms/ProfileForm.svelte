<script>
  import * as crud from '$actions/crud';
  import Form from '$components/Form.svelte';
  import Alert from '$components/Alert.svelte';

  export let user;
  export let admin = false;
  let error = null;
  let success = false;
  let loading = false;

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
    }
  ];

  if (admin) {
    fields.push({
      name: 'admin',
      label: 'Admin',
      type: 'checkbox',
    });
  }

  const update = crud.makeUpdater('users');

  async function handleUpdate(e) {
    const { values } = e.detail;
    loading = true;
    success = false;
    error = null;
    try {
      await update({ id: user.id, values });
      success = true;
    } catch (err) {
      error = 'Update failed';
    }
    loading = false;
  }
</script>

<Alert type="error" message={error} />
{#if success}
  <Alert type="success" message={"Changes saved"} />
{/if}
<Form
  {fields}
  values={user}
  submitLabel="Save"
  {loading}
  on:submit={handleUpdate}
/>
