<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import * as crud from '$actions/crud';
  import Form from '$components/Form.svelte';
  import Alert from '$components/Alert.svelte';

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
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
    },
    {
      name: 'password_confirm',
      label: 'Confirm password',
      type: 'password',
      required: true,
    }
];

  const create = crud.makeCreater('users');

  function handleValidation(e) {
    const { form } = e.detail;
    form.elements.password_confirm.setCustomValidity("");
  }

  async function handleCreate(e) {
    const { form, values } = e.detail;
    if (values.password === values.password_confirm) {
      loading = true;
      success = false;
      error = null;
      try {
        await create(values);
        dispatch('refresh');
        success = true;
      } catch (err) {
        error = 'Create user failed';
      }
      loading = false;
    } else {
      form.elements.password_confirm.setCustomValidity('Passwords do not match');
      form.reportValidity();
    }
  }
</script>

<Alert type="error" message={error} />
{#if success}
  <Alert type="success" message={"New user created"} />
{/if}
<Form
  {fields}
  submitLabel="Create"
  {loading}
  style="--formwidth: 24em"
  on:beforesubmit={handleValidation}
  on:submit={handleCreate}
/>