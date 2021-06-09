<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { escapeHtml as escape } from '$lib/util';
  import { preferences } from '$stores';
  import * as suggest from '$actions/suggest';

  let selection = null;
  export let match;
  export let languages = null;

  function renderer(item) {
    let output = `<div class="suggest"><div>${escape(item.language_name)} <strong>${escape(item.headword)}</strong></div>`;
    const { senses } = item;
    if (senses.length) {
      output += `<div>${escape(senses[0])}</div></div>`;
      for (const sense of senses.slice(1)) {
        output += `<div class="suggest"><div></div><div>${escape(sense)}</div></div>`;
      }
    } else {
      output += '<div></div></div>';
    }
    return output;
  }

  function handleSelect() {
    if (selection) {
      dispatch('select', selection);
      selection = null;
    }
  }
</script>

<Svelecte
  fetch={(query) => suggest.setMember(query, match, languages, $preferences)}
  labelField="headword"
  searchField="headword"
  valueField="id"
  clearable
  searchable
  disableSifter
  disableHighlight
  placeholder=""
  {renderer}
  bind:selection
  on:change={handleSelect}
/>

<style lang="scss">
  :global(.suggest) {
    display: grid;
    grid-template-columns: 20% 80%;
    gap: 6px;
    white-space: normal;

    :global(> :first-child) {
      padding-inline-start: 0.75em;
      text-indent: -0.75em;
    }
  }
</style>
