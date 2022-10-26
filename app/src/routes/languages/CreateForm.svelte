<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  let values = {};
  let error = null;

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
  ];

  const creater = crud.makeCreater('language');

  async function handleCreate() {
    $pageLoading++;
    try {
      error = null;
      await creater(values);
      values = {};
      dispatch('refresh');
    } catch (e) {
      console.log(e);
      error = e.message;
    }
    $pageLoading--;
  }
</script>

<Alert type="error" message={error} />
<Form
  {fields}
  bind:values
  submitLabel="Create"
  style="--form-width: 21em; --label-width: 24%;"
  on:submit={handleCreate}
/>
