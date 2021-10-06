<script>
  import SuggestSetMember from '$components/SuggestSetMember.svelte';
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { createPopover, popoverContent, popoverTrigger } from '$lib/popover';
  import { fade } from 'svelte/transition';
  import { originSummary } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import { slide } from 'svelte/transition';
  import * as crud from '$actions/crud';
  import * as crudSet from '$actions/crud/set';

  export let entry;
  export let language_id;
  export let click = false;
  export let linkable = false;
  export let placement = 'auto';
  const editable = getContext('editable');
  const borrowlangSuggest = getContext('borrowlangSuggest');

  const values = {
    origin: entry.origin,
    origin_language_id: entry.origin_language_id,
  };
  const promises = { pending: {}, fulfilled: {} };

  let showPopover = false;
  const popover = createPopover({
    hover: true,
    click,
    show: () => showPopover = true,
    hide: () => showPopover = false,
    popperOptions: { placement },
  });

  async function handleUpdate(key) {
    if (entry[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = promises.pending[key] = crud.update('entry', {
        id: entry.id,
        values: { [key]: values[key] },
      });
      await promise;
      entry[key] = values[key];
      if (key === 'origin' && entry[key] !== 'borrowed') {
        entry.origin_language_id = values.origin_language_id = null;
      }
    } catch (e) {
      values[key] = entry[key];
    }
    if (promise && promise === promises.pending[key]) {
      promises.pending[key] = null;
      promises.fulfilled[key] = promise;
    }
    $pageLoading--;
  }

  async function handleSelectSetMember(e) {
    $pageLoading++;
    try {
      await crudSet.linkEntries([entry, e.detail], () => dispatch('link'));
    } catch (err) {}
    $pageLoading--;
  }
</script>

<span use:popoverTrigger={popover}>
  <slot />
</span>
{#if showPopover}
  <div
    class="popover"
    use:popoverContent={popover}
    transition:fade|local={{ duration: 200 }}
  >
    {#if editable}
      <div>
        <div class="label">
          Origin:
        </div>
        <div class="controls">
          <div class="radios">
            <label>
              <input
                type="radio"
                value="inherited"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>inherited</span>
            </label>
            <label>
              <input
                type="radio"
                value="borrowed"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>borrowed</span>
            </label>
            <label>
              <input
                type="radio"
                value={null}
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>unknown</span>
            </label>
          </div>
        </div>
      </div>
      {#if editable && entry.origin === 'borrowed'}
        <div transition:slide|local class="originlang">
          <span class="label">Language:</span>
          <div>
            <Svelecte
              options={borrowlangSuggest.filter((v) => v.id !== language_id)}
              disabled={promises.pending.origin_language_id}
              bind:value={values.origin_language_id}
              on:change={() => handleUpdate('origin_language_id')}
            />
          </div>
        </div>
      {/if}
      {#if linkable && !entry.sets}
        <div class="link">
          <div class="label">
            Link To (Headword):
          </div>
          <SuggestSetMember
            match="headword"
            entry_id={entry.id}
            on:select={handleSelectSetMember}
          />
        </div>
        <div class="link">
          <div class="label">
            Link To (Gloss):
          </div>
          <SuggestSetMember
            match="gloss"
            entry_id={entry.id}
            on:select={handleSelectSetMember}
          />
        </div>
      {/if}
    {:else}
      Origin: {originSummary(entry)}
    {/if}
  </div>
{/if}

<style lang="scss">
  .popover {
    padding: 8px;
    @include popover;

    :global(.svelecte-control .sv-control) {
      min-height: unset;
      height: 26px;
    }

    > div {
      display: flex;
      &:not(:first-child) {
        margin-block-start: 10px;
      }

      .label {
        margin-inline-end: 10px;
      }

      .controls {
        display: flex;
        flex-direction: column;

        .radios {
          display: flex;
          label {
            margin-inline-end: 10px;
            display: flex;
            align-items: center;
          }
          input {
            margin-inline-end: 4px;
          }
        }
      }

      &.originlang {
        > div {
          width: 100%;
        }

        .label {
          align-self: center;
          inline-size: 9em;
        }

        :global(.sv-control) {
          inline-size: 16em;
        }
      }

      &.link {
        .label {
          align-self: center;
          inline-size: 9em;
        }

        :global {
          .sv-control {
            inline-size: 16em;
          }
          .sv-dropdown {
            width: 30em !important;
            right: 0;
          }
        }
      }
    }
  }
  </style>