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
    if (senses.length) {
      output += '<div>';
      for (const sense of senses) {
        output += `<div>${escape(sense)}</div>`;
      }
      output += '</div>';
    } else {
      output += '<div></div>';
    }
    output += '</div>';
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

      > div {
        @include indent-small;
      }
    }
  }
</style>
