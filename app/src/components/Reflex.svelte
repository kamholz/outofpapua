<script>
  import { matchReflex, reflexToHtml } from '$lib/util';

  export let reflex;
  export let headword;
  export let space = true;

  let before, reflexProper, after;
  $: {
    if (reflex) {
      [before, reflexProper, after] = matchReflex(reflex);
    } else {
      reflexProper = headword;
      before = after = null;
    }
  }
</script>

{#if space}
  {#if before?.length}{before}&thinsp;|&thinsp;{/if}{@html reflexToHtml(reflexProper)}{#if after?.length}&thinsp;|&thinsp;{after}{/if}
{:else}
  {#if before?.length}{before}|{/if}{@html reflexToHtml(reflexProper)}{#if after?.length}|{after}{/if}
{/if}
