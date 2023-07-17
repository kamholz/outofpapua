<script>
  import ExportEntry from './ExportEntry.svelte';
  import SearchForm from './SearchForm.svelte';
  import { browser } from '$app/environment';
  import { onDestroy, setContext } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  export let data;
  $: ({
    query,
    language,
    entries,
    ipaFunctions,
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
      descendants: data.query.descendants,
      orthography: data.query.orthography,
      ipa: data.query.ipa,
      borrowed: data.query.borrowed,
      ancestors: data.query.ancestors,
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
          } else if (currentQueryString.has(key)) {
            changed = true;
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
      <input type="checkbox" bind:checked={$settings.note} name="note" id="note">
      <label for="note">Show note</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.descendants} name="descendants" id="descendants">
      <label for="descendants">Show descendant forms</label>
    </div>

    <div class="indent">
      <div class="checkbox">
        <input type="checkbox" bind:checked={$settings.orthography} name="orthography" id="orthography" disabled={!$settings.descendants || !$settings.ipa}>
        <label for="orthography">Show Orthography</label>
      </div>
      <div class="checkbox">
        <input type="checkbox" bind:checked={$settings.ipa} name="ipa" id="ipa" disabled={!$settings.descendants || !$settings.orthography}>
        <label for="ipa">Show IPA</label>
      </div>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.borrowed} name="borrowed" id="borrowed">
      <label for="borrowed">Show borrowed forms</label>
    </div>

    <div class="checkbox">
      <input type="checkbox" bind:checked={$settings.ancestors} name="ancestors" id="ancestors">
      <label for="ancestors">Show ancestor forms</label>
    </div>

    <div class="indent">
      <div class="checkbox">
        <input type="checkbox" bind:checked={$settings.ancestor_glosses} name="ancestor_glosses" id="ancestor_glosses" disabled={!$settings.ancestors}>
        <label for="ancestor_glosses">Show glosses</label>
      </div>
    </div>
  </div>
  <hr>
  {#each entries as entry}
    <ExportEntry {entry} {ipaFunctions} />
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

  .indent {
    margin-inline-start: 20px;
  }

  @include hr;
</style>