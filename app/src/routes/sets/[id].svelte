<script context="module">
  import * as crudSet from '$actions/crud/set';
  import * as crudSetMember from '$actions/crud/setmember';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const set = await reload(fetch, params.id);
    if (!set) {
      return { status: 500, error: 'Internal error' };
    }
    props.set = set;
    if (props.editable) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500, error: 'Internal error' };
      }
    }
    return { props };
  }

  async function reload(fetch, id) {
    const res = await fetch(`/api/set/${id}.json`);
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import Member from './_Member.svelte';
  import Select from './_Select.svelte';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$stores';
  import { setContext } from 'svelte';

  export let set;
  export let editable;
  export let borrowlangSuggest = null;
  $: members = set.members;
  $: values = {
    note: set.note,
  };
  const promises = { pending: {}, fulfilled: {} };
  const collapsed = {};

  setContext('props', { set, editable, borrowlangSuggest });

  function collapseAll(state) {
    for (const member of members) {
      if ((collapsed[member.entry.id] ?? false) !== state) {
        collapsed[member.entry.id] = state;
      }
    }
  }

  async function handleRefresh() {
    set = await reload(fetch, set.id);
  }

  async function handleUpdate(key) {
    values[key] = normalizeParam(values[key]);
    if (set[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = crudSet.update({ id: set.id, values: { [key]: values[key] } });
      promises.pending[key] = promise;
      await promise;
      set[key] = values[key];
    } catch (e) {
      values[key] = set[key];
    }
    if (promise && promise === promises.pending[key]) {
      promises.pending[key] = null;
      promises.fulfilled[key] = promise;
    }
    $pageLoading--;
  }

  async function handleAddMember(entry) {
    $pageLoading++;
    let promise;
    try {
      promise = crudSetMember.create({ set_id: set.id, values: { entry_id: entry.id } });
      promises.pending.add = promise;
      await promise;
      handleRefresh();
    } catch (e) {}
    if (promise && promise === promises.pending.add) {
      promises.pending.add = null;
      promises.fulfilled.add = promise;
    }
    $pageLoading--;
  }
</script>

<h2>Set {set.id}</h2>

<div class="set">
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  {#if editable || set.note}
    <div class="set-item">
      <div class="set-item-label top">Notes:</div>
      {#if editable}
        <textarea
          name="note"
          disabled={promises.pending.note}
          bind:value={values.note}
          on:change={() => handleUpdate('note')}
        />
      {:else}
        <span>{set.note}</span>
      {/if}  
    </div>
    <hr>
  {/if}  

  {#if editable}
    <div class="set-item">
      <div class="set-item-label top add-entry">Add entry:</div>
      <Select on:select={(e) => handleAddMember(e.detail)} />
    </div>
    <hr>
  {/if}

  <div>
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
  <hr>

  {#each members as member (member.entry.id)}
    <Member {member} {collapsed} on:refresh={handleRefresh} />
    <hr>
  {/each}
</div>

<style lang="scss">
  .set {
    button {
      margin-inline-start: 0;
      margin-inline-end: 10px;
    }

    textarea {
      inline-size: 100%;
      block-size: 4em;
    }

    :global(.set-item) {
      display: flex;
      position: relative;

      :global(.fa-icon:hover) {
        color: gray;
      }

      :global(.set-item-label) {
        flex-shrink: 0;
        inline-size: 10em;
        margin-inline-end: 12px;
        font-weight: bold;
      }
      :global(.set-item-label.top) {
        inline-size: 6em;
      }
      :global(.set-item-label.add-entry) {
        align-self: center;
      }
    }

    hr {
      margin-block: 20px;
      block-size: 2px;
      background-color: black;
      border: none;
    }
  }
</style>
