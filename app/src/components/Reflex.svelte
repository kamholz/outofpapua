<script>
  import { matchReflex } from '$lib/util';

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
  {#if before?.length}{before}&thinsp;|&thinsp;{/if}<strong>{reflexProper}</strong>{#if after?.length}&thinsp;|&thinsp;{after}{/if}
{:else}
  {#if before?.length}{before}|{/if}<strong>{reflexProper}</strong>{#if after?.length}|{after}{/if}
{/if}
