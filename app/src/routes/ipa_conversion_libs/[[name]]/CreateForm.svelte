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

  const creater = crud.makeCreater('ipa_conversion_lib');

  async function handleCreate() {
    const { name } = values;
    $pageLoading++;
    try {
      error = null;
      await creater(values);
      values = {};
      dispatch('refresh', name);
    } catch (e) {
      console.log(e);
      error = e.message;
    }
    $pageLoading--;
  }
</script>

<Alert type="error">{error}</Alert>
<Form
  {fields}
  bind:values
  submitLabel="Create"
  style="--form-width: 21em; --label-width: 24%;"
  on:submit={handleCreate}
/>
