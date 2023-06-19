<script>
  import Alert from '$components/Alert.svelte';
  import SuggestSet from '$components/SuggestSet.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crudSet from '$actions/crud/set';

  export let set;
  let promise;

  async function handleAdd(e) {
    const newSet = e.detail;
    $pageLoading++;
    try {
      promise = crudSet.linkSets(set, newSet);
      await promise;
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if promise}
  {#await promise catch { message }}
    <Alert type="error">{message}</Alert>
  {/await}
{/if}
<ul>
  <li>
    <span>Add set:</span>
    <SuggestSet
      set_id={set.id}
      exclude_grouped={Boolean(set.set_group_id)}
      on:select={handleAdd}
    />
  </li>
</ul>

<style lang="scss">
  ul {
    flex-grow: 1;

    li {
      display: flex;
      align-items: center;

      span {
        flex-shrink: 0;
        margin-inline-end: 12px;
      }
    }
  }
</style>