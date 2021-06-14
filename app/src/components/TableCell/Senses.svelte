<script>
  import { glossSummaryNoLanguage, glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let senses;
  export let multilang;
  const multisense = senses.length > 1;

  function mungePos(pos) {
    return pos.replace(/\.$/, '');
  }

  function summary(glosses) {
    return multilang
      ? glossesSummary(glosses, $preferences)
      : glossSummaryNoLanguage(glosses[0]);
  }
</script>

<td on:click>
  {#each senses as { pos, glosses }, i}
    {#if glosses.length}
      <p>
        {#if multisense}{i + 1}. {/if}{#if pos}<em>{mungePos(pos)}</em>. {/if}{summary(glosses)}
      </p>
    {/if}
  {/each}
</td>

<style lang="scss">
  p {
    @include indent;
  }
</style>