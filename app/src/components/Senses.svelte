<script>
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage, glossesSummary, mungePos, toolboxMarkup } from '$lib/util';

  export let senses;
  export let multiGlosslang = true;
  const multiSense = senses.length > 1;
  const preferences = getContext('preferences');

  function summary(glosses) {
    return multiGlosslang
      ? glossesSummary(glosses, $preferences)
      : glossSummaryNoLanguage(glosses[0]);
  }
</script>

{#each senses as { pos, glosses }, i}
  {#if glosses.length}
    <p>
      {#if multiSense}{i + 1}. {/if}{#if pos}<em>{mungePos(pos)}</em>. {/if}{@html toolboxMarkup(summary(glosses))}
    </p>
  {/if}
{/each}

<style lang="scss">
  p {
    @include indent;
  }
</style>