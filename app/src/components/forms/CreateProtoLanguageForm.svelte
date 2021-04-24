<script>
	import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';

  let createValues = {};
  let error = null;

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    }
  ];  

  const creater = crud.makeCreater('languages');

  async function handleCreate(e) {
    const { values } = e.detail;
    $pageLoading++;
    try {
      error = null;
      await creater(values);
      createValues = {};
      dispatch('refresh');
    } catch (err) {
      console.log(err);
      err = err.message;
    }
    $pageLoading--;
  }
</script>

<Alert type="error" message={error} />
<Form
  {fields}
  values={createValues}
  submitLabel="Create"
  class="create-protolang"
  on:submit={handleCreate}
/>

<style>
  :global(.create-protolang > div) {
    grid-template-columns: 30% 70% !important;
  }
</style>