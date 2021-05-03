<script>
  import Svelecte from '$lib/svelecte';
  import * as suggest from '$actions/suggest';

  function renderer(item) {
    let output = `<div class="set-suggest"><div>${escape(item.language_name)} <b>${escape(item.headword)}</b></div>`;
    const senses = [...item.senses];
    if (senses.length) {
      output += `<div>${escape(senses.shift())}</div></div>`;
      for (const sense of senses) {
        output += `<div class="set-suggest"><div></div><div>${escape(sense)}</div></div>`;
      }
    } else {
      output += `<div></div></div>`;
    }
    return output;
  }

  function escape(txt) {
    return txt
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }
</script>

<Svelecte
  fetch={suggest.set_member}
  labelField="headword"
  searchField="headword"
  valueField="id"
  clearable
  searchable
  disableFilter
  placeholder=""
  renderer={renderer}
/>

<style lang="scss">
  :global(.set-suggest) {
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
