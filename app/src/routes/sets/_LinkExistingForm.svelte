<script>
  import Alert from '$components/Alert.svelte';
  import SuggestSetMember from '$components/SuggestSetMember.svelte';
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';
  import * as crudSetMember from '$actions/crud/setmember';

  export let langSuggest;
  const { set } = getContext('set');
  let languages;
  let promise;

  async function handleAdd(e) {
    const entry = e.detail;
    $pageLoading++;
    try {
      promise = crudSetMember.create({ set_id: set.id, values: { entry_id: entry.id } });
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
    <span>Headword:</span>
    <SuggestSetMember
      match="headword"
      {languages}
      on:select={handleAdd}
    />
    </li>
  <li>
    <span>Gloss:</span>
    <SuggestSetMember
      match="gloss"
      {languages}
      on:select={handleAdd}
    />
  </li>
  <li>
    <span>Languages:</span>
    <Svelecte
      options={langSuggest}
      multiple
      bind:value={languages}
    />
</li>
</ul>

<style lang="scss">
  ul {
    flex-grow: 1;

    li {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-block-end: 12px;
      }

      span {
        flex-shrink: 0;
        inline-size: 10em;
        margin-inline-end: 12px;
        text-align: end;
      }
    }
  }
</style>