<script>
  import { langMarkerSorted } from '$lib/parse_record';

  export let sense;
</script>

{#if sense.pos}
  <span class="pos">{sense.pos}</span>.
{/if}

{#if sense.gloss}
  {#each langMarkerSorted(sense.gloss) as [gloss, lang]}
    <span class="gloss">{gloss.join('; ')}</span> <span class="lang">({lang})</span>.
  {/each}
{/if}

<style lang="scss">
  .lang {
    font-style: italic;
  }
  .gloss::before {
    content: ' ';
  }
</style>