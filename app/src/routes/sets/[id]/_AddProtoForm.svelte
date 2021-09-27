<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import { parseGlosses } from '$lib/util';
  import * as crudSetMember from '$actions/crud/setmember';

  export let set;
  export let values;
  const sourceSuggest = getContext('sourceSuggest');
  let promise;

  const fields = [
    {
      name: 'source_id',
      label: 'Source',
      type: 'suggest',
      options: sourceSuggest,
      required: true,
    },
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
      required: true,
    },
    {
      name: 'glosses',
      label: 'English Glosses',
      type: 'text',
      required: true,
    },
  ];

  function handleBeforeSubmit(e) {
    const { form } = e.detail;
    form.elements[0].setCustomValidity(values.source_id ? '' : 'Source is required.');
  }

  async function handleSubmit() {
    $pageLoading++;
    try {
      promise = crudSetMember.proto({
        set_id: set.id,
        values: { ...values, glosses: parseGlosses(values.glosses) },
      });
      await promise;
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if promise}
  {#await promise catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<Form
  {fields}
  bind:values
  submitLabel="Create"
  on:beforesubmit={handleBeforeSubmit}
  on:submit={handleSubmit}
  style="--form-width: 40em; --grid-template: 28% 72%"
/>
