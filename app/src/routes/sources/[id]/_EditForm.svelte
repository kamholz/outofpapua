<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import Record from '$components/Record.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let source;
  const editable = getContext('editable');

  const fields = [
    {
      name: 'language_name',
      label: 'Language',
      type: 'text',
      uneditable: !source.editable,
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
      name: 'numentries',
      label: '# Entries',
      type: 'text',
      uneditable: true,
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
    },
  ];

  const update = crud.makeUpdater('source');
  let promise;

  async function handleUpdate(e) {
    const { values } = e.detail;
    $pageLoading++;
    try {
      promise = update({ id: source.id, values });
      await promise;
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if editable}
  {#if promise}
    {#await promise then done}
      <Alert type="success" message="Changes saved" />
    {:catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form
    {fields}
    values={source}
    submitLabel="Save"
    style="--formwidth: 35em; --gridtemplate: 30% 70%"
    on:submit={handleUpdate}
  />
{:else}
  <Record
    {fields}
    values={source}
    style="--recordwidth: 35em; --gridtemplate: 30% 70%"
  />
{/if}
