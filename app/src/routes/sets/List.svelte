<script>
  import Alert from '$components/Alert.svelte';
  import ListControls from './ListControls.svelte';
  import ListItem from './ListItem.svelte';
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
    const [id, ...set_ids] = rows.filter((v) => selection.has(v.id)).map((v) => v.id);
    $pageLoading++;
    try {
      promise = crudSet.merge({ id, set_ids });
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
  <Alert type="error">{message}</Alert>
{/await}

<hr>
<ListControls {collapseAll} {handleMerge} {handleMap} {selection} />
<hr>

{#each rows as set, i (set.id)}
  <ListItem
    {set}
    collapsed={collapsedRows[i]}
    bind:selection
  />
  <hr>
{/each}

<ListControls {collapseAll} {handleMerge} {handleMap} {selection} />
<hr>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  @include hr;
</style>
