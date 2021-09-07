<script>
  export let entries;
  export let language;
  export let updateLanguage;
  import { maybeGloss } from '$lib/util';
</script>

{#if entries.length > 1}
  {#each entries as entry (entry.id)}
    <label>
      <input
        type="checkbox"
        bind:checked={entry.selected}
        on:change={() => updateLanguage(language.id)}
        disabled={
          !language.selected ||
          ( // only one selected entry left for this language
            entry.selected &&
            entries.filter((v) => v.selected).length === 1
          )
        }
      />&nbsp;{entry.headword}{maybeGloss(entry.senses)}
    </label>
  {/each}
{/if}

<style>
  label {
    margin-block-end: 6px;
    margin-inline-start: 20px;
  }
</style>