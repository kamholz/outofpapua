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
      ancestor_glosses: data.query.ancestor_glosses,
      ancestors: data.query.ancestors,
      borrowed: data.query.borrowed,
      descendant_note: data.query.descendant_note,
      descendant_source: data.query.descendant_source,
      descendants: data.query.descendants,
      ipa: data.query.ipa,
      orthography: data.query.orthography,
      set_note: data.query.set_note,
      source: data.query.source,
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

    <div class="columns">
      <div>
        <div class="row heading">
          Show forms:
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.descendants} name="descendants" id="descendants">
          <label for="descendants">Descendant forms</label>
        </div>

        <div class="indent">
          <div class="row">
            <input type="checkbox" bind:checked={$settings.orthography} name="orthography" id="orthography" disabled={!$settings.descendants || !$settings.ipa}>
            <label for="orthography">Show orthography</label>
          </div>
          <div class="row">
            <input type="checkbox" bind:checked={$settings.ipa} name="ipa" id="ipa" disabled={!$settings.descendants || !$settings.orthography}>
            <label for="ipa">Show IPA</label>
          </div>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.borrowed} name="borrowed" id="borrowed">
          <label for="borrowed">Borrowed forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.outcomparison} name="outcomparison" id="outcomparison">
          <label for="outcomparison">Outcomparisons</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.ancestors} name="ancestors" id="ancestors">
          <label for="ancestors">Ancestor forms</label>
        </div>

        <div class="indent">
          <div class="row">
            <input type="checkbox" bind:checked={$settings.ancestor_glosses} name="ancestor_glosses" id="ancestor_glosses" disabled={!$settings.ancestors}>
            <label for="ancestor_glosses">Show glosses</label>
          </div>
        </div>
      </div>

      <div>
        <div class="row heading">
          Show source for:
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.source} name="source" id="source">
          <label for="source">Proto-forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.descendant_source} name="descendant_source" id="descendant_source" disabled={!$settings.descendants && !$settings.borrowed && !$settings.outcomparison}>
          <label for="descendant_source">Attested forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.ancestor_source} name="ancestor_source" id="ancestor_source" disabled={!$settings.ancestors}>
          <label for="ancestor_source">Ancestor forms</label>
        </div>
      </div>

      <div>
        <div class="row heading">
          Show note for:
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.note} name="note" id="note">
          <label for="note">Proto-forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.descendant_note} name="descendant_note" id="descendant_note" disabled={!$settings.descendants && !$settings.borrowed && !$settings.outcomparison}>
          <label for="descendant_note">Attested forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.set_note} name="set_note" id="set_note">
          <label for="set_note">Set</label>
        </div>
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

  .columns {
    display: flex;
    gap: 40px;
  }

  .row {
    display: flex;
    margin-block-start: 10px;

    input {
      margin-inline-end: 8px;
    }
  }

  .indent {
    margin-inline-start: 20px;
  }

  .heading {
    font-style: italic;
  }

  @include hr;
</style>
