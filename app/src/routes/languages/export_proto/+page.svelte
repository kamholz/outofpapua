<script>
  import SearchForm from './SearchForm.svelte';
  import ExportEntry from './ExportEntry.svelte';
  import { browser } from '$app/environment';
  import { onDestroy, setContext } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  export let data;
  $: ({
    query,
    language,
    entries,
  } = data);
  const {
    protolangSuggest,
  } = data;
  setContext('protolangSuggest', protolangSuggest);
  setContext('language', language);

  const settings = writable({});
  setContext('settings', settings);

  $: init($page);

  function init() {
    $settings = {
      include_descendants: data.query.include_descendants,
      include_borrowed: data.query.include_borrowed,
      include_ancestors: data.query.include_ancestors,
    };

    if (browser && data.query.protolang) {
      const unsubscribe = settings.subscribe((newSettings) => {
        const currentUrl = new URL(window.location);
        const currentQueryString = currentUrl.searchParams;
        const newQueryString = new URLSearchParams();
        let changed = false;
        for (const [key, value] of Object.entries(newSettings)) {
          if (value) {
            newQueryString.set(key, '1');
            if (currentQueryString.get(key) !== '1') {
              changed = true;
            }
          } else {
            if (currentQueryString.has(key)) {
              changed = true;
            }
          }
        }

        if (changed) {
          newQueryString.set('protolang', currentQueryString.get('protolang'));
          currentUrl.search = '?' + newQueryString;
          window.history.replaceState(null, '', currentUrl);
        }
      });
      onDestroy(unsubscribe);
    }
  }
</script>

<svelte:head>
  <title>Export reconstructions | Out of Papua</title>
</svelte:head>

<h2>Export reconstructions</h2>
<SearchForm
  {query}
/>

{#if entries}
  <div class="settings">
    <h4>Settings</h4>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.include_descendants} name="include_descendants" id="include_descendants">
      <label for="include_descendants">Include descendant forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.include_borrowed} name="include_borrowed" id="include_borrowed">
      <label for="include_borrowed">Include borrowed forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.include_ancestors} name="include_ancestors" id="include_ancestors">
      <label for="include_ancestors">Include ancestor forms</label>
    </div>
  </div>
  {#each entries as entry}
    <hr>
    <ExportEntry {entry} />
  {/each}
{/if}

<style lang="scss">
  .settings {
    margin-block: var(--item-sep);
  }

  .checkbox {
    display: flex;
    margin-block: 10px;

    input {
      margin-inline-end: 8px;
    }
  }

  hr {
    margin-block: 12px;
  }
</style>