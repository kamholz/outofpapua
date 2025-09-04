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
    entries,
    ipaFunctions,
  } = data);
  const {
    protolangSuggest,
  } = data;
  setContext('protolangSuggest', protolangSuggest);

  const settings = writable({});
  setContext('settings', settings);

  $: init($page);

  function init() {
    $settings = Object.fromEntries(
      Object.entries(data.query).filter(([key]) => key !== 'protolang')
    );

    if (browser && data.query.protolang) {
      const unsubscribe = settings.subscribe((newSettings) => {
        const currentUrl = new URL(window.location);
        const currentQueryString = currentUrl.searchParams;
        const newQueryString = new URLSearchParams();
        let changed = false;
        for (const [key, value] of Object.entries(newSettings)) {
          const newQueryValue = value ? '1' : '0';
          newQueryString.set(key, newQueryValue);
          if (currentQueryString.get(key) !== newQueryValue) {
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

  function attested(settings) {
    return settings.descendants || settings.outcomparisons || settings.outborrowings;
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
          <input type="checkbox" bind:checked={$settings.outcomparisons} name="outcomparison" id="outcomparison">
          <label for="outcomparison">Outcomparisons</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.outborrowings} name="borrowed" id="borrowed">
          <label for="borrowed">Outborrowings</label>
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
          <input type="checkbox" bind:checked={$settings.attested_source} name="attested_source" id="attested_source" disabled={!attested($settings)}>
          <label for="attested_source">Attested forms</label>
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
          <input type="checkbox" bind:checked={$settings.attested_note} name="attested_note" id="attested_note" disabled={!attested($settings)}>
          <label for="attested_note">Attested forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.set_note} name="set_note" id="set_note">
          <label for="set_note">Set</label>
        </div>
      </div>

      <div>
        <div class="row heading">
          Borrowings:
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.borrowed_attested} name="borrowed_attested" id="borrowed_attested" disabled={!$settings.descendants && !$settings.outcomparisons}>
          <label for="borrowed_attested">Indicate on attested forms</label>
        </div>

        <div class="row">
          <input type="checkbox" bind:checked={$settings.borrowed_origin} name="borrowed_origin" id="borrowed_origin" disabled={!(($settings.descendants || $settings.outcomparisons) && $settings.borrowed_attested) && !$settings.outborrowings}>
          <label for="borrowed_origin">Show source language</label>
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
