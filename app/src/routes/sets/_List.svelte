<script>
  import Alert from '$components/Alert.svelte';
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import { pageLoading } from '$lib/stores';
  import { writable } from 'svelte/store';
  import * as crudSet from '$actions/crud/set';

  export let rows;
  export let query;
  export let pageCount;
  const editable = getContext('editable');
  const collapsedRows = rows.map(() => false);
  const selection = editable ? writable({}) : null;
  let promise;

  function collapseAll(state) {
    for (const [i] of rows.entries()) {
      collapsedRows[i] = state;
    }
  }

  async function handleMerge() {
    const [id, ...sets] = rows.filter((v) => $selection[v.id]).map((v) => v.id);
    $pageLoading++;
    try {
      promise = crudSet.merge({ id, sets });
      await promise;
      $selection = {};
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

{#await promise catch { message }}
  <Alert type="error" {message} />
{/await}

<hr>
<div>
  <button on:click={() => collapseAll(true)}>Collapse All</button>
  <button on:click={() => collapseAll(false)}>Expand All</button>
  {#if editable && Object.keys($selection).length > 1}
    <button
      type="button"
      transition:fade={{ duration: 300 }}
      disabled={$pageLoading}
      on:click={handleMerge}
    >Merge Selected Sets</button>
  {/if}
</div>
<hr>

{#each rows as set, i (set.id)}
  <ListItem
    {set}
    collapsed={collapsedRows[i]}
    {selection}
  />
  <hr>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  button {
    margin-inline: 0 10px;
  }

  @include hr;
</style>