<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { escapeHtml as escape } from '$lib/util';
  import { preferences } from '$lib/stores';
  import * as suggest from '$actions/suggest';

  let selection = null;
  export let match;
  export let noset;
  export let languages = null;

  function renderer(item) {
    let output = `<div class="suggest"><div>${escape(item.language_name)} ` +
      `<strong>${escape(item.headword)}</strong></div>`;
    const { senses } = item;
    if (senses[0]) {
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
  fetch={(search) => suggest.setMember({ search, match, languages, noset }, $preferences)}
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
  :global {
    .suggest {
      display: grid;
      grid-template-columns: 20% 80%;
      gap: 6px;
      white-space: normal;

      > :first-child {
        @include indent-small;
      }
    }
  }
</style>
