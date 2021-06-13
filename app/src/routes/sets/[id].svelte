<script context="module">
  import enter from '$lib/enter';
  import { goto } from '$app/navigation';
  import * as crud from '$actions/crud';
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
      props.langSuggest = await suggest.langPlus(fetch);
      props.sourceSuggest = await suggest.editableSource(fetch);
      if (!props.borrowlangSuggest || !props.langSuggest || !props.sourceSuggest) {
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
  import AddProtoForm from './_AddProtoForm.svelte';
  import Alert from '$components/Alert.svelte';
  import FormWrapper from './_FormWrapper.svelte';
  import LinkExistingForm from './_LinkExistingForm.svelte';
  import Member from './_Member.svelte';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let set;
  export let editable;
  export let borrowlangSuggest = null;
  export let langSuggest = null;
  export let sourceSuggest = null;
  const values = {
    note: set.note,
    name: set.name,
  };
  let name = set.name ?? set.id;
  let createProtoValues = {};
  let collapsedMembers;
  const promises = { pending: {}, fulfilled: {} };
  const updater = crud.makeUpdater('set');

  $: setContext('set', { set, editable, borrowlangSuggest });
  $: ({ members } = set);
  $: members, initCollapsedMembers();

  function initCollapsedMembers() {
    const newCollapsed = {};
    for (const member of members) {
      newCollapsed[member.entry.id] = collapsedMembers?.[member.entry.id] ?? writable(false);
    }
    collapsedMembers = newCollapsed;
  }

  function collapseAll(state) {
    for (const member of members) {
      collapsedMembers[member.entry.id].set(state);
    }
  }

  async function handleRefresh() {
    const newSet = await reload(fetch, set.id);
    if (newSet) {
      set = newSet;
      values.note = set.note;
      values.name = set.name;
      createProtoValues = {};
    } else {
      goto('/');
    }
  }

  async function handleUpdate(key) {
    values[key] = normalizeParam(values[key]);
    if (set[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = updater({ id: set.id, values: { [key]: values[key] } });
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

  function handleUpdateName() {
    const value = name.trim();
    values.name = value === String(set.id) ? '' : value;
    name = value === '' ? set.id : value;
    handleUpdate('name');
  }
</script>

{#if editable}
  <h2>Set:&nbsp;<span
      contenteditable="true"
      bind:textContent={name}
      on:blur={handleUpdateName}
      use:enter={(e) => e.currentTarget.blur()}
    >{name}</span></h2>
{:else}
  <h2>Set: {name}</h2>
{/if}

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
    <FormWrapper collapsed={writable(true)} label="Link existing entry">
      <LinkExistingForm
        {set}
        {langSuggest}
        on:refresh={handleRefresh}
      />
    </FormWrapper>
    <hr>

    <FormWrapper collapsed={writable(true)} label="Add proto-form">
      <AddProtoForm
        {set}
        {sourceSuggest}
        bind:values={createProtoValues}
        on:refresh={handleRefresh}
      />
    </FormWrapper>
    <hr>
  {/if}

  <div>
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
  <hr>

  {#each members as member (member.entry.id)}
    <Member
      {member}
      {set}
      {editable}
      {borrowlangSuggest}
      collapsed={collapsedMembers[member.entry.id]} 
      on:refresh={handleRefresh}
    />
    <hr>
  {/each}
</div>

<style lang="scss">
  @include contenteditable;
  @include hr;

  button {
    margin-inline-start: 0;
    margin-inline-end: 10px;
  }

  textarea {
    inline-size: 100%;
    block-size: 4em;
  }

  .set :global {
    .set-item {
      display: flex;
      position: relative;

      .fa-icon:hover {
        color: $icon_hover;
      }

      .set-item-label {
        flex-shrink: 0;
        inline-size: 16em;
        margin-inline-end: 16px;
        font-weight: bold;

        .fa-icon {
          vertical-align: unset;
          margin-inline-start: 7px;
        }
      }
      .set-item-label.top {
        inline-size: 6em;
      }
      .set-item-label.fullwidth {
        inline-size: unset;
      }
      .set-item-label.membersummary {
        font-weight: unset;
        > :first-child {
          font-weight: bold;
        }
      }
    }

    .form form {
      flex-grow: 1;
      width: unset;
      padding: 0;
      border: none;

      > div {
        margin: 0;
        display: flex;
        align-items: center;

        input {
          flex-grow: 1;
        }
      }

      > div:not(.controls) > :first-child {
        flex-shrink: 0;
        inline-size: 10em;
      }

      > div:not(:last-child) {
        margin-block-end: 12px;
      }
    }
  }
</style>
