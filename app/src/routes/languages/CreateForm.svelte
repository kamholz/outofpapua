<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let type;

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

  if (type === 'dialect') {
    const langSuggest = getContext('langSuggest');
    fields.push({
      name: 'dialect_parent_id',
      label: 'Language',
      type: 'suggest',
      options: langSuggest,
      required: true,
    });
  }

  const creater = crud.makeCreater('language');

  async function handleCreate() {
    if (type === 'dialect' && !values.dialect_parent_id) {
      error = 'Language is required';
      return;
    }
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

<Alert type="error">{error}</Alert>
<Form
  {fields}
  bind:values
  submitLabel="Create"
  style="--form-width: 21em; --label-width: 24%;"
  on:submit={handleCreate}
/>
