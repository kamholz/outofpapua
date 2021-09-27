<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import Record from '$components/Record.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let language;
  const editable = getContext('editable');
  const protolangSuggest = getContext('protolangSuggest');

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'iso6393',
      label: 'ISO 639-3',
      type: 'text',
      readonly: true,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
    },
    editable
      ?
      {
        name: 'parent_id',
        label: 'Parent',
        type: 'suggest',
        options: protolangSuggest,
      }
      :
      {
        name: 'parent_name',
        label: 'Parent',
        type: 'text',
      },
    {
      name: 'numentries',
      label: '# Entries',
      type: 'text',
      readonly: true,
    },
  ];

  if (editable && language.is_proto) {
    fields.push(
      {
        name: 'prefer_set_name',
        label: 'Prefer for set names',
        type: 'checkbox',
      }
    );
  }

  const update = crud.makeUpdater('language');
  let promise;

  async function handleUpdate(e) {
    const { values } = e.detail;
    $pageLoading++;
    try {
      promise = update({ id: language.id, values });
      await promise;
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if editable}
  {#if promise}
    {#await promise then}
      <Alert type="success" message="Changes saved" />
    {:catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form
    {fields}
    values={language}
    submitLabel="Save"
    style="--form-width: 42em; --grid-template: 31% 69%"
    on:submit={handleUpdate}
  />
{:else}
  <Record
    {fields}
    values={language}
    style="--record-width: 35em; --grid-template: 30% 70%"
  />
{/if}
