<script>
  import Form from '$components/Form.svelte';
  import Alert from '$components/Alert.svelte';
  import * as crud from '$actions/crud';
  import { updatePassword } from '$actions/auth';

  export let user;
  export let admin = false;
  let passwordValues = {};
  let error1 = null;
  let error2 = null;
  let success1 = false;
  let success2 = false;
  let loading1 = false;
  let loading2 = false;

  const fields1 = [
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

  const fields2 = [
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
    }
  ];

  if (admin) {
    fields1.push({
      name: 'admin',
      label: 'Admin',
      type: 'checkbox',
    });
    fields2.shift();
  }

  const updater = crud.makeUpdater('users');

  async function handleUpdate1(e) {
    const { values } = e.detail;
    loading1 = true;
    success1 = false;
    error1 = null;
    try {
      await updater({ id: user.id, values });
      success1 = true;
    } catch (err) {
      error1 = 'Update failed';
    }
    loading1 = false;
  }

  function handleValidation2 (e) {
    const { form } = e.detail;
    form.elements.new_confirm.setCustomValidity('');
  }

  async function handleUpdate2 (e) {
    const { form, values } = e.detail;
    if (values.new === values.new_confirm) {
      loading2 = true;
      success2 = false;
      error2 = null;
      try {
        await updatePassword(user.id, { current_pass: values.current, new_pass: values.new });
        success2 = true;
        passwordValues = {};
      } catch (err) {
        error2 = err.message;
      }
      loading2 = false;
    } else {
      form.elements.new_confirm.setCustomValidity('Passwords do not match');
      form.reportValidity();
    }
  }
</script>

<h2>Profile</h2>
<Alert type="error" message={error1} />
{#if success1}
  <Alert type="success" message={"Changes saved"} />
{/if}
<Form
  method="POST"
  fields={fields1} 
  values={user}
  submitLabel="Save"
  loading={loading1}
  on:submit={handleUpdate1}
/>

<h3>Change password</h3>
<Alert type="error" message={error2} />
{#if success2}
  <Alert type="success" message={"Password changed"} />
{/if}
<Form
  method="POST"
  fields={fields2}
  values={passwordValues}
  submitLabel="Change"
  loading={loading2}
  style="width: 22em"
  on:beforesubmit={handleValidation2}
  on:submit={handleUpdate2}
/>
