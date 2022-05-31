<script>
  import { maybeEngGlosses } from '$lib/util';

  export let entries;
  export let language;
  export let updateLanguage;
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
      />&nbsp;{entry.headword_ipa ?? entry.headword}{maybeEngGlosses(entry.senses)}
    </label>
  {/each}
{:else}
  <span>
    {entries[0].headword_ipa ?? entries[0].headword}{maybeEngGlosses(entries[0].senses)}
  </span>
{/if}

<style>
  label, span {
    margin-block-end: 6px;
    margin-inline-start: 20px;
  }
</style>