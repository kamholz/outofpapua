<script>
  import Alert from '$components/Alert.svelte';
  import SuggestSet from '$components/SuggestSet.svelte';
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crudSet from '$actions/crud/set';

  export let set;
  let promise;

  async function handleAdd(e) {
    const { id } = e.detail;
    $pageLoading++;
    try {
      promise = crudSet.linkSets(set, id);
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
<ul>
  <li>
    <span>Set:</span>
    <SuggestSet
      set_id={set.id}
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
        inline-size: 10em;
        margin-inline-end: 12px;
        text-align: end;
      }
    }
  }
</style>