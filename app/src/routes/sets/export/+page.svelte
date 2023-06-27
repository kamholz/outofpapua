<script>
  import SearchForm from './SearchForm.svelte';
  import ExportSet from './ExportSet.svelte';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    language,
    query,
    sets,
  } = data);
  $: ancestors = language.ancestors && new Set(language.ancestors);
  const {
    protolangSuggest,
  } = data;
  setContext('protolangSuggest', protolangSuggest);
  setContext('language', language);

  let includeDescendants = false;
  let includeBorrowed = false;
  let includeAncestors = false;
</script>

<svelte:head>
  <title>Export reconstructions | Out of Papua</title>
</svelte:head>

<h2>Export reconstructions</h2>
<SearchForm
  {query}
/>

{#if sets}
  <div class="settings">
    <h4>Settings</h4>

    <div class="checkbox">
      <input type="checkbox" bind:checked={includeDescendants} name="include_descendants" id="include_descendants">
      <label for="include_descendants">Include descendant forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={includeBorrowed} name="include_borrowed" id="include_borrowed">
      <label for="include_borrowed">Include borrowed forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={includeAncestors} name="include_ancestors" id="include_ancestors">
      <label for="include_ancestors">Include ancestor forms</label>
    </div>
  </div>
  {#each sets as set}
    <hr>
    <ExportSet {set} {ancestors} {includeDescendants} {includeBorrowed} {includeAncestors} />
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