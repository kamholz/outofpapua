<script>
  export let showGloss;
  export let entries;
  export let headwords;
  export let language;
  export let updateLanguage;

  function selectHeadword({ ids, selected }, languageId) {
    for (const entry of entries) {
      if (ids.has(entry.id)) {
        entry.selected = selected;
      }
    }
    updateLanguage(languageId);
  }

  function selectEntry(entry, languageId) {
    const headword = headwords.find(({ headword }) => headword === entry.headword);
    const { ids } = headword;
    const states = new Set();
    for (const entry of entries) {
      if (ids.has(entry.id)) {
        states.add(entry.selected);
      }
    }
    if (states.size === 1) {
      const [state] = [...states];
      headword.selected = state;
    }
    updateLanguage(languageId);
  }
</script>

{#if showGloss}
  {#if entries.length > 1}
    {#each entries as entry}
      <label>
        <input
          type="checkbox"
          bind:checked={entry.selected}
          on:change={() => selectEntry(entry, language.id)}
          disabled={
            !language.selected ||
            ( // only one selected entry left for this language
              entry.selected &&
              entries.filter((v) => v.selected).length === 1
            )
          }
        />&nbsp;{entry.headword}
      </label>
    {/each}
  {/if}
{:else}
  {#if headwords.length > 1}
    {#each headwords as headword}
      <label>
        <input
          type="checkbox"
          bind:checked={headword.selected}
          on:change={() => selectHeadword(headword, language.id)}
          disabled={
            !language.selected ||
            ( // only one selected headword left for this language
              headword.selected &&
              headwords.filter((v) => v.selected).length === 1
            )
          }
        />&nbsp;{headword.headword}
      </label>
    {/each}
  {/if}
{/if}

<style lang="scss">
  label {
    margin-block-end: 6px;
    margin-inline-start: 20px;
  }
</style>