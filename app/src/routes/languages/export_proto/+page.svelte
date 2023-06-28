<script>
  import SearchForm from './SearchForm.svelte';
  import ExportEntry from './ExportEntry.svelte';
  import { setContext } from 'svelte';
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

  const settings = writable({
    includeDescendants: true,
    includeBorrowed: false,
    includeAncestors: false,
  });
  setContext('settings', settings);
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
      <input type="checkbox" bind:checked={$settings.includeDescendants} name="include_descendants" id="include_descendants">
      <label for="include_descendants">Include descendant forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.includeBorrowed} name="include_borrowed" id="include_borrowed">
      <label for="include_borrowed">Include borrowed forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.includeAncestors} name="include_ancestors" id="include_ancestors">
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