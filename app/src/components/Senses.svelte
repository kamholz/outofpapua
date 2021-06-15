<script>
  import { glossesSummary, glossSummaryNoLanguage, mungePos } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let senses;
  export let multilang = true;
  const multisense = senses.length > 1;

  function summary(glosses) {
    return multilang
      ? glossesSummary(glosses, $preferences)
      : glossSummaryNoLanguage(glosses[0]);
  }
</script>

{#each senses as { pos, glosses }, i}
  {#if glosses.length}
    <p>
      {#if multisense}{i + 1}. {/if}{#if pos}<em>{mungePos(pos)}</em>. {/if}{summary(glosses)}
    </p>
  {/if}
{/each}

<style lang="scss">
  p {
    @include indent;
  }
</style>