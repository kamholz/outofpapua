<script context="module">
  import { goto } from '$app/navigation';
  import * as crud from '$actions/crud';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, params, session }) {
    const props = {};
    if (session.user) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      props.langSuggest = await suggest.langPlus(fetch);
      props.sourceSuggest = await suggest.editableSource(fetch);
      if (!props.borrowlangSuggest || !props.langSuggest || !props.sourceSuggest) {
        return { status: 500 };
      }
    }

    props.set = await reload(fetch, params.id);
    if (!props.set) {
      return { status: 404 };
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
  import History from './_History.svelte';
  import Icon from 'svelte-awesome';
  import LinkExistingForm from './_LinkExistingForm.svelte';
  import LinkSetForm from './_LinkSetForm.svelte';
  import Member from './_Member.svelte';
  import SectionWrapper from './_SectionWrapper.svelte';
  import SetPopover from '$components/SetPopover.svelte';
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';
  import keydown from '$lib/keydown';
  import { faFileAlt, faMapMarked, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { getContext, setContext } from 'svelte';
  import { modal, pageLoading, setSummaryCache } from '$lib/stores';
  import { normalizeParam } from '$lib/util';
  import { page } from '$app/stores';
  import { slide } from 'svelte/transition';

  export let set;
  export let borrowlangSuggest = null;
  export let langSuggest = null;
  export let sourceSuggest = null;
  const editable = getContext('editable');
  if (editable) {
    setContext('borrowlangSuggest', borrowlangSuggest);
    setContext('langSuggest', langSuggest);
    setContext('sourceSuggest', sourceSuggest);
  }

  const values = {};
  let name;
  let createProtoValues;
  let selection;
  const promises = { pending: {}, fulfilled: {} };
  const updater = crud.makeUpdater('set');
  const scale = 1.5;

  $setSummaryCache = {}; // eslint-disable-line prefer-const
  setContext('setSummaryCache', setSummaryCache);

  $: ({ members } = set);
  $: collapsedMembers = Object.fromEntries(
    members.map((member) => [
      member.entry.id,
      collapsedMembers?.[member.entry.id] ?? false,
    ])
  );

  $: init(true), $page;

  function init(clearProto) {
    values.name = set.name;
    values.note = set.note;
    name = set.name_auto.txt;
    if (clearProto) {
      createProtoValues = {};
    }
    selection = editable && set.members.length > 1 ? new Set() : null;
  }

  function collapseAll(state) {
    for (const member of members) {
      collapsedMembers[member.entry.id] = state;
    }
  }

  async function handleRefresh(clearProto) {
    const newSet = await reload(fetch, set.id);
    if (newSet) {
      set = newSet;
      init(clearProto);
    } else {
      goto('/');
    }
  }

  async function handleUpdate(key, finish, force) {
    values[key] = normalizeParam(values[key]);
    if (!force && set[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = promises.pending[key] = updater({ id: set.id, values: { [key]: values[key] } });
      await promise;
      set[key] = values[key];
      if (finish) {
        await finish();
      }
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
    name = name.trim();
    if (name === '' && set.name === null && set.name_entry_id === null) {
      // revert displayed name
      name = set.name_auto.txt;
    } else if (name !== set.name_auto.txt) {
      values.name = name;
      handleUpdate('name', async () => {
        if (name === '') {
          set = await reload(fetch, set.id);
          values.name = set.name;
          name = set.name_auto.txt;
        }
      }, true);
    }
  }

  async function handleUnlink(id) {
    $pageLoading++;
    let promise;
    try {
      promise = promises.pending.unlink = updater({ id, values: { set_group_id: null } });
      await promise;
      await handleRefresh(false);
    } catch (e) {}

    if (promise && promise === promises.pending.unlink) {
      promises.pending.unlink = null;
      promises.fulfilled.unlink = promise;
    }
    $pageLoading--;
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete the entire set "${name}"? This operation cannot be undone.`)) {
      return;
    }

    $pageLoading++;
    let promise;
    try {
      promise = promises.pending.delete = crud.del('set', set.id);
      await promise;
      goto('/sets');
    } catch (e) {}
    if (promise && promise === promises.pending.delete) {
      promises.pending.delete = null;
      promises.fulfilled.delete = promise;
    }
    $pageLoading--;
  }

  async function handleSplit() {
    $pageLoading++;
    let promise;
    try {
      promise = promises.pending.split = crud.create('set', { members: [...selection], reassignExisting: true });
      await promise;
      await handleRefresh(false);
    } catch (e) {}
    if (promise && promise === promises.pending.split) {
      promises.pending.split = null;
      promises.fulfilled.split = promise;
    }
    $pageLoading--;
  }

  async function getModalProps() {
    $pageLoading++;
    // const nameEntry = set.name_auto.entry_id
    //   ? await crud.get('entry', set.name_auto.entry_id)
    //   : null;
    const ipaFunctions = await ipaConversionFunctions(fetch, set.members);
    $pageLoading--;
    return { ipaFunctions, set };
  }
</script>

<svelte:head>
  <title>Set: {name} | Out of Papua</title>
</svelte:head>

<h2>
  {#if editable}
    <span>
      Set:&nbsp;<span
        contenteditable="true"
        bind:textContent={name}
        on:blur={handleUpdateName}
        use:keydown={{ enter: (e) => e.currentTarget.blur() }}
      >{name}</span>
    </span>
  {:else}
    <span>Set: {name}</span>
  {/if}
  <div>
    <span on:click={async () => $modal.setExport(await getModalProps())}>
      <Icon data={faFileAlt} {scale} />
    </span>
    <a href="/sets/{set.id}/map" title="Map" sveltekit:prefetch>
      <Icon data={faMapMarked} {scale} />
    </a>
  </div>
</h2>

<div class="set">
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  <div class="set-item">
    <div class="set-item-label top">Author:</div>
    <span>{set.author_name}</span>
  </div>
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
  {/if}
  {#if editable || set.set_group}
    <div class="set-item">
      <div class="set-item-label top">Related sets:</div>
      <div class="related">
        {#if set.set_group}
          {#each set.set_group as { id, name } (id)}
            <span transition:slide|local>
              <SetPopover {id}>{name}</SetPopover>
              {#if editable}
                <span title="Remove from list of related sets" on:click={() => handleUnlink(id)}>
                  <Icon data={faTrash} />
                </span>
              {/if}
            </span>
          {/each}
        {/if}
        {#if editable}
          <LinkSetForm
            {set}
            on:refresh={() => handleRefresh(false)}
          />
        {/if}
      </div>
    </div>
  {/if}
  <hr>

  {#if editable}
    <SectionWrapper label="Link existing entry">
      <LinkExistingForm
        {set}
        on:refresh={() => handleRefresh(false)}
      />
    </SectionWrapper>
    <hr>

    <SectionWrapper label="Add proto-form">
      <AddProtoForm
        {set}
        bind:values={createProtoValues}
        on:refresh={() => handleRefresh(true)}
      />
    </SectionWrapper>
    <hr>
  {/if}

  <div class="controls">
    <div>
      <button type="button" on:click={() => collapseAll(true)}>Collapse All</button>
      <button type="button" on:click={() => collapseAll(false)}>Expand All</button>
    </div>
    {#if selection}
      <button
        type="button"
        on:click={handleSplit}
        disabled={selection.size === 0 || selection.size === members.length}
      >Split Selected Into New Set</button>
    {/if}
  </div>
  <hr>

  {#each members as member ([set.id, member.entry.id, member.source.id].join('|'))}
    <Member
      {member}
      {set}
      bind:collapsed={collapsedMembers[member.entry.id]}
      bind:selection
      on:refresh={() => handleRefresh(false)}
    />
    <hr>
  {/each}

  {#if editable}
    <SectionWrapper label="Set History">
      <History {set} />
    </SectionWrapper>
    <hr>
  {/if}
</div>

{#if editable}
  <div class="controls bottom">
    <button type="button" on:click={handleDelete}>Delete Set</button>
    {#if selection}
      <button
        type="button"
        on:click={handleSplit}
        disabled={selection.size === 0 || selection.size === members.length}
      >Split Selected Into New Set</button>
    {/if}
  </div>
{/if}

<style lang="scss">
  @include contenteditable;
  @include hr;
  @include button-left;

  textarea {
    inline-size: 100%;
    block-size: 4em;
  }

  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .controls {
    display: flex;
    justify-content: space-between;

    > button:last-child {
      margin-inline: 10px 0;
    }

    &.bottom {
      margin-block: 30px 10px;
    }
  }

  .set :global {
    .set-item {
      display: flex;
      position: relative;
      margin-block-end: var(--item-sep);

      .set-item-label {
        flex-shrink: 0;
        inline-size: 16em;
        margin-inline-end: 16px;
        font-weight: bold;

        .fa-icon {
          vertical-align: unset;
          margin-inline-start: 7px;
        }

        .plain {
          font-weight: normal;
        }
      }
      .set-item-label.top {
        inline-size: 7em;
        align-self: center;
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

      .related {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;

        > span:last-of-type {
          margin-block-end: 4px;
        }

        :global(.fa-icon) {
          position: relative;
          bottom: 1px;
          margin-inline-start: 8px;
        }
      }
    }

    .section form {
      width: unset;
      padding: 0;
      border: none;

      > div:not(:last-child) {
        margin-block-end: 12px;
      }
    }
  }
</style>
