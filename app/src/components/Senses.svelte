<script>
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage, glossesSummary, mungePos } from '$lib/util';

  export let senses;
  export let multilang = true;
  const multisense = senses.length > 1;
  const preferences = getContext('preferences');

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