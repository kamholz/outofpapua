<script>
  import Alert from '$components/Alert.svelte';
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { goto } from '$app/navigation';
  import { pageLoading } from '$lib/stores';
  import { serializeArrayParam } from '$lib/util';
  import * as crudSet from '$actions/crud/set';

  export let rows;
  export let query;
  export let pageCount;
  const editable = getContext('editable');
  const collapsedRows = rows.map(() => false);
  let selection = editable ? new Set() : null;
  let promise;

  function collapseAll(state) {
    for (const [i] of rows.entries()) {
      collapsedRows[i] = state;
    }
  }

  async function handleMerge() {
    const [id, ...sets] = rows.filter((v) => selection.has(v.id)).map((v) => v.id);
    $pageLoading++;
    try {
      promise = crudSet.merge({ id, sets });
      await promise;
      selection = new Set();
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }

  function handleMap() {
    goto('/sets/map?' + new URLSearchParams({ sets: serializeArrayParam([...selection]) }));
  }
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

{#await promise catch { message }}
  <Alert type="error" {message} />
{/await}

<hr>
<div class="controls">
  <div>
    <button type="button" on:click={() => collapseAll(true)}>Collapse All</button>
    <button type="button" on:click={() => collapseAll(false)}>Expand All</button>
    {#if editable}
      <button
        type="button"
        disabled={$pageLoading || selection.size < 2}
        on:click={handleMerge}
      >Merge Selected Sets</button>
    {/if}
  </div>
  <div>
    <button
      type="button"
      disabled={$pageLoading || selection.size < 2}
      on:click={handleMap}
    >Map Selected Sets</button>
  </div>
</div>
<hr>

{#each rows as set, i (set.id)}
  <ListItem
    {set}
    collapsed={collapsedRows[i]}
    bind:selection
  />
  <hr>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  @include hr;

  .controls {
    display: flex;
    justify-content: space-between;

    :first-child {
      @include button-left;
    }

    :last-child {
      @include button-right;
    }
  }
</style>