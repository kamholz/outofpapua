<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

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
    },
  ];

  const create = crud.makeCreater('user');
  let promise;

  function handleValidation(e) {
    const { form } = e.detail;
    form.elements.password_confirm.setCustomValidity('');
  }

  async function handleCreate(e) {
    const { form, values } = e.detail;
    if (values.password === values.password_confirm) {
      $pageLoading++;
      try {
        promise = create(values);
        await promise;
        dispatch('refresh');
      } catch (err) {}
      $pageLoading--;
    } else {
      form.elements.password_confirm.setCustomValidity('Passwords do not match');
      form.reportValidity();
    }
  }
</script>

{#if promise}
  {#await promise then done}
    <Alert type="success" message="New user created" />
  {:catch { message }}
    <Alert type="error" message="Create user failed" />
  {/await}
{/if}
<Form
  {fields}
  submitLabel="Create"
  style="--formwidth: 26em"
  on:beforesubmit={handleValidation}
  on:submit={handleCreate}
/>
