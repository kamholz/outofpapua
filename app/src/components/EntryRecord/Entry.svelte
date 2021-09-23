<script>
  import Sense from '$components/EntryRecord/Sense.svelte';

  export let entry;
</script>

<div class="entry">
  {#if entry.headword}
    <span class="headword">{entry.headword.join(', ')}</span>.
  {/if}
  {#if entry.pos}
    <span class="pos">{entry.pos}</span>.
  {/if}
  {#if entry.sense}
    {#if entry.sense.length > 1}
      {#each entry.sense as sense, i}
        <span class="sense-num">({i + 1})</span>
        <Sense {sense} />
      {/each}
    {:else}
      <Sense sense={entry.sense[0]} />
    {/if}
  {/if}

  {#if entry.subentry}
    <div class="subentry">
      {#each entry.subentry as subentry}
        <svelte:self entry={subentry} />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .entry {
    margin-block-start: 1em;

    .headword {
      font-weight: bold;
    }

    :global(.pos) {
      font-style: italic;
    }

    .sense-num::before {
      content: ' ';
    }
  }

  .subentry {
    margin-inline-start: 2em;
  }
</style>