<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { pageLoading } from '$lib/stores';
  import { updatePassword } from '$actions/auth';

  export let user;
  export let adminView;
  let passwordValues = {};
  let promise;

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

  if (adminView) {
    fields.shift();
  }

  function handleValidation(e) {
    const { form } = e.detail;
    form.elements.new_confirm.setCustomValidity('');
  }

  async function handleUpdate(e) {
    const { form, values } = e.detail;
    if (values.new === values.new_confirm) {
      $pageLoading++;
      try {
        promise = updatePassword(user.id, { current_password: values.current, new_password: values.new });
        await promise;
        passwordValues = {};
      } catch (err) {}
      $pageLoading--;
    } else {
      form.elements.new_confirm.setCustomValidity('Passwords do not match');
      form.reportValidity();
    }
  }
  </script>

{#if promise}
  {#await promise then}
    <Alert type="success" message="Password changed" />
  {:catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<Form
  {fields}
  values={passwordValues}
  submitLabel="Change"
  style="--form-width: 23em; --label-width: 44%;"
  on:beforesubmit={handleValidation}
  on:submit={handleUpdate}
/>
