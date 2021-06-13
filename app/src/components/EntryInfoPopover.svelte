<script>
  import Svelecte from '$components/Svelecte.svelte';
  import { createPopover, popoverContent, popoverTrigger } from '$lib/popover';
  import { fade } from 'svelte/transition';
  import { originSummary } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import { slide } from 'svelte/transition';
  import * as crud from '$actions/crud';

  export let entry;
  export let editable;
  export let borrowlangSuggest;
  const values = {
    origin: entry.origin,
    origin_language_id: entry.origin_language_id,
  };
  const promises = { pending: {}, fulfilled: {} };
  const options = editable
    ? [...borrowlangSuggest].filter((v) => v.id !== entry.language_id)
    : null;

  const popover = createPopover({
    hover: true,
    clkck: true,
    show: () => showPopover = true,
    hide: () => showPopover = false,
  });
  let showPopover = false;

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
          {#if entry.origin === 'borrowed'}
            <div transition:slide|local class="originlang">
              <span class="label">Language:</span>
              <Svelecte
                {options}
                disabled={promises.pending.origin_language_id}
                bind:value={values.origin_language_id}
                on:change={() => handleUpdate('origin_language_id')}
              />
            </div>
          {/if}
        </div>
      </div>
    {:else}
      Origin: {originSummary(entry)}
    {/if}
  </div>
{/if}

<style lang="scss">
  .popover {
    padding: 8px;
    @include popover;

    > div {
      display: flex;
    }
  }

  .label {
    margin-inline-end: 10px;
  }

  .controls {
    display: flex;
    flex-direction: column;
  }

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

  .originlang {
    margin-block-start: 10px;
    display: flex;
    align-items: center;

    :global(.svelecte-control .sv-control) {
      inline-size: 16em;
      min-height: unset;
      height: 26px;
    }
  }</style>