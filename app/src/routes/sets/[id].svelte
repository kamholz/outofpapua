<script context="module">
  import { goto } from '$app/navigation';
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
  import Alert from '$components/Alert.svelte';
  import CreateProtoForm from './_CreateProtoForm.svelte';
  import FormWrapper from './_FormWrapper.svelte';
  import LinkExistingForm from './_LinkExistingForm.svelte';
  import Member from './_Member.svelte';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$stores';
  import { setContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { writable } from 'svelte/store';

  export let set;
  export let editable;
  export let borrowlangSuggest = null;
  export let langSuggest = null;
  export let sourceSuggest = null;
  const values = {
    note: set.note,
  };
  let toggleLinkExisting;
  let toggleCreateProto;
  const collapsedLinkExisting = writable(true);
  const collapsedCreateProto = writable(true);
  let collapsedMembers;
  const promises = { pending: {}, fulfilled: {} };

  $: setContext('props', { set, editable, borrowlangSuggest });
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
    <FormWrapper collapsed={collapsedLinkExisting} label="Link existing">
      <LinkExistingForm {langSuggest} />
    </FormWrapper>
    <hr>

    <FormWrapper collapsed={collapsedCreateProto} label="Create protoform">
      <CreateProtoForm {sourceSuggest} />
    </FormWrapper>
    <hr>
  {/if}

  <div>
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
  <hr>

  {#each members as member (member.entry.id)}
    <Member {member} collapsed={collapsedMembers[member.entry.id]} on:refresh={handleRefresh} />
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
        inline-size: 12em;
        margin-inline-end: 12px;
        font-weight: bold;

        :global(.fa-icon) {
          vertical-align: unset;
          margin-inline-start: 7px;
        }
      }
      :global(.set-item-label.top) {
        inline-size: 6em;
      }

      :global(.form) {
        flex-grow: 1;

        :global(.form-label) {
          font-weight: bold;
          margin-block-end: 12px;
        }

        :global(form) {
          flex-grow: 1;
          width: unset;
          padding: 0;
          border: none;

          :global(> div) {
            margin: 0;
            display: flex;
            align-items: center;

            :global(input) {
              flex-grow: 1;
            }
          }

          :global(> div:not(.controls) > :first-child) {
            flex-shrink: 0;
            inline-size: 8.5em;
          }

          :global(> div:not(:last-child)) {
            margin-block-end: 12px;
          }
        }
      }
    }

    :global(.set-item.collapsed) {
      align-items: center;
    }

    hr {
      margin-block: 20px;
      block-size: 2px;
      background-color: black;
      border: none;
    }
  }
</style>
