<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';

  export let protolangSuggest;
  let values = {};
  let error = null;

  const fields = [
    {
      name: 'language_id',
      label: 'Proto-language',
      type: 'language',
      options: protolangSuggest,
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'reference',
      label: 'Short Reference',
      type: 'text',
      required: true,
    },
    {
      name: 'reference_full',
      label: 'Full Reference',
      type: 'textarea',
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
    },
  ];

  const creater = crud.makeCreater('source');

  async function handleCreate() {
    if (!values.language_id) {
      error = 'Proto-language is required';
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

<Alert type="error" message={error} />
<Form
  {fields}
  bind:values
  submitLabel="Create Source"
  class="create-source-form"
  style="--formwidth: 30em; --gridtemplate: 33% 67%"
  on:submit={handleCreate}
/>

<style lang="scss">
  :global(.create-source-form) {
    :global(.svelecte-control) :global(.sv-control) {
      min-height: unset;
      height: 26px;
    }
  }
</style>
