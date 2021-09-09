<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import EntryLink from '$components/EntryLink.svelte';
  import Icon from 'svelte-awesome';
  import Senses from '$components/Senses.svelte';
  import SetPopover from '$components/SetPopover.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { fade, slide } from 'svelte/transition';
  import { pageLoading } from '$lib/stores';
  import * as crudSet from '$actions/crud/set';

  export let entry;
  export let query;
  export let lang2Name;
  export let collapsed;
  export let multilang;
  const { compare_entries, headword, senses } = entry;
  const linkable = getContext('editable') && compare_entries;
  let selection = linkable ? {} : null;

  function handleSelect(item) {
    if (selection[item.id]) {
      delete selection[item.id];
    } else {
      selection[item.id] = item;
    }
    if (item.set_id) {
      for (const selectedRow of Object.values(selection)) {
        if (selectedRow.set_id && selectedRow.set_id !== item.set_id) {
          delete selection[selectedRow.id];
        }
      }
    }
    selection = selection;
  }

  async function handleLink() {
    $pageLoading++;
    await crudSet.linkEntries(Object.values(selection), handleRefresh);
    $pageLoading--;
  }

  function handleRefresh() {
    selection = {};
    dispatch('refresh');
  }
</script>

<div class="columns">
  <div class="entry">
    {#if linkable && !collapsed}
      <span title="Select" on:click={() => handleSelect(entry)}>
        <Icon data={selection[entry.id] ? faCircleSolid : faCircleRegular} />
      </span>
    {/if}
    <EntryInfoPopover bind:entry language_id={query.lang1} placement="auto-start">
      <EntryLink {entry}><strong class={entry.origin}>{headword}</strong></EntryLink>
    </EntryInfoPopover>
    {#if entry.set_id}
      <SetPopover id={entry.set_id} />
    {/if}
    <div>
      <Senses {senses} {multilang} />
    </div>
  </div>
  {#if compare_entries}
    <div class="compare">
      <div class="header">
        <CollapseIndicator bind:collapsed />
        {lang2Name} comparisons
      </div>
      {#if !collapsed}
        <ul transition:slide|local={{ duration: 200 }}>
          {#each compare_entries as compare_entry (compare_entry.id)}
            <li>
              {#if linkable}
                <span title="Select" on:click={() => handleSelect(compare_entry)}>
                  <Icon data={selection[compare_entry.id] ? faCircleSolid : faCircleRegular} />
                </span>
              {/if}
              <EntryInfoPopover bind:entry language_id={query.lang2}>
                <EntryLink entry={compare_entry}><strong class={compare_entry.origin}>{compare_entry.headword}</strong></EntryLink>
              </EntryInfoPopover>
              {#if compare_entry.set_id}
                <SetPopover id={compare_entry.set_id} />
              {/if}
              <div>
                <Senses senses={compare_entry.senses} {multilang} />
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

{#if linkable && !collapsed && Object.keys(selection).length > 1}
  <button
    type="button"
    transition:fade={{ duration: 300 }}
    disabled={$pageLoading}
    on:click={handleLink}
  >Link Selected</button>
{/if}

<style lang="scss">
  .columns {
    display: flex;
    > div {
      flex-basis: 50%;
    }
  }

  .entry {
    // flex-grow: 1;
    display: flex;
    > div {
      margin-inline-start: 12px;
    }
    // :global(> :first-child) {
    //   @include indent-small;
    // }
  }

  .header {
    display: flex;
    margin-block: 0 6px;
  }

  ul {
    margin-inline-start: 1em;
    li {
      display: flex;
      margin-block-start: 6px;
      > div {
        margin-inline-start: 12px;
      }
      // :global(> :first-child) {
      //   @include indent-small;
      // }
    }
  }

  .compare {
    margin-inline-start: 10px;
  }
</style>