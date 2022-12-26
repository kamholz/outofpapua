<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  const protolangSuggest = getContext('protolangSuggest');
  let values = {};

  const fields = [
    {
      name: 'language_id',
      label: 'Proto-language',
      type: 'suggest',
      options: protolangSuggest,
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
  let promise;

  async function handleCreate() {
    if (!values.language_id) {
      promise = Promise.reject({ message: 'Proto-language is required' });
      return;
    }

    $pageLoading++;
    try {
      promise = creater(values);
      await promise;
      values = {};
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#await promise catch {message}}
  <Alert type="error">{message}</Alert>
{/await}
<Form
  {fields}
  bind:values
  submitLabel="Create Source"
  class="create-source-form"
  style="--form-width: 30em; --label-width: 31%;"
  on:submit={handleCreate}
/>

<style lang="scss">
  :global {
    .create-source-form .sv-control {
      min-height: unset;
      height: 26px;
    }
  }
</style>
