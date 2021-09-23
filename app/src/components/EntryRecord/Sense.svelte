<script>
  import { langMarkerSorted } from '$lib/parse_record';

  export let sense;
  const translation = sense.definition ?? sense.gloss;
</script>

{#if sense.pos}
  <span class="pos">{sense.pos}</span>.
{/if}

{#if translation}
  {#each langMarkerSorted(translation) as [txt, lang]}
    <span class="translation">{txt.join('; ')}</span> <span class="lang">({lang})</span>.
  {/each}
{/if}

<style lang="scss">
  .lang {
    font-style: italic;
  }
  .translation::before {
    content: ' ';
  }
</style>