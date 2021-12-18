<script>
  import Icon from 'svelte-awesome';
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let entry;
  export let source;
  export let editable = false;
  const sourceSuggest = getContext('sourceSuggest');

  let editing = false;
  let source_id;

  function handleEdit() {
    source_id = source.id;
    editing = true;
  }

  async function handleSave() {
    if (source_id && source_id !== source.id) {
      $pageLoading++;
      try {
        await crud.update('entry', { id: entry.id, values: { source_id } });
        dispatch('refresh');
      } catch (e) {}
      editing = false;
      $pageLoading--;
    } else {
      editing = false;
    }
  }
</script>

{#if editing}
  <Svelecte
    options={sourceSuggest}
    disabled={$pageLoading}
    bind:value={source_id}
    on:change={handleSave}
  />
{:else}
  <a href="/sources/{source.id}/entries" sveltekit:prefetch>{source.reference}</a>
  {#if editable && source.editable}
    <span
      class="icon"
      on:click={handleEdit}
    >
      <Icon data={faEdit} />
    </span>
  {/if}
{/if}

<style>
  .icon {
    vertical-align: middle;
  }
</style>