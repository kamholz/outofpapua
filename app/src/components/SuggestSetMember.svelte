<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { escapeHtml as escape } from '$lib/util';
  import * as suggest from '$actions/suggest';

  export let match;
  export let linked;
  export let languages = null;
  export let entry_id = null;
  export let set_id = null;
  let selection = null;
  let value = null;
  const preferences = getContext('preferences');

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
      value = null;
    }
  }
</script>

<div>
  <Svelecte
    fetch={(search) => suggest.setMember({ entry_id, languages, linked, match, search, set_id }, $preferences)}
    labelField="headword"
    searchField="headword"
    valueField="id"
    clearable
    searchable
    disableSifter
    disableHighlight
    placeholder=""
    {renderer}
    bind:value
    bind:readSelection={selection}
    on:change={handleSelect}
  />
</div>

<style lang="scss">
  div {
    width: 100%;

    :global {
      .suggest {
        display: grid;
        grid-template-columns: 35% 65%;
        gap: 18px;
      }
    }
  }
</style>
