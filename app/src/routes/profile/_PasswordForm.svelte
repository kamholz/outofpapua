<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { updatePassword } from '$actions/auth';

  export let user;
  export let admin = false;
  let error = null;
  let success = false;
  let loading = false;
  let passwordValues = {};

  const fields = [
    {
      name: 'current',
      label: 'Current password',
      type: 'password',
      required: true,
    },
    {
      name: 'new',
      label: 'New password',
      type: 'password',
      required: true,
    },
    {
      name: 'new_confirm',
      label: 'Confirm password',
      type: 'password',
      required: true,
    },
  ];

  if (admin) {
    fields.shift();
  }

  function handleValidation(e) {
    const { form } = e.detail;
    form.elements.new_confirm.setCustomValidity('');
  }

  async function handleUpdate(e) {
    const { form, values } = e.detail;
    if (values.new === values.new_confirm) {
      loading = true;
      success = false;
      error = null;
      try {
        await updatePassword(user.id, { current_password: values.current, new_password: values.new });
        success = true;
        passwordValues = {};
      } catch (err) {
        error = err.message;
      }
      loading = false;
    } else {
      form.elements.new_confirm.setCustomValidity('Passwords do not match');
      form.reportValidity();
    }
  }
  </script>

<Alert type="error" message={error} />
{#if success}
  <Alert type="success" message={'Password changed'} />
{/if}
<Form
  {fields}
  values={passwordValues}
  submitLabel="Change"
  {loading}
  style="--formwidth: 23em; --gridtemplate: 50% 50%"
  on:beforesubmit={handleValidation}
  on:submit={handleUpdate}
/>
