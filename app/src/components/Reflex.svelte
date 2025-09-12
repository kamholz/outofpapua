<script>
  import { run } from 'svelte/legacy';

  import { formatInfix, matchReflex } from '$lib/util';

  /**
   * @typedef {Object} Props
   * @property {any} reflex
   * @property {any} headword
   * @property {boolean} [space]
   */

  /** @type {Props} */
  let { reflex, headword, space = true } = $props();

  let before = $state(), reflexProper = $state(), after = $state();
  run(() => {
    if (reflex) {
      [before, reflexProper, after] = matchReflex(reflex);
    } else {
      reflexProper = headword;
      before = after = null;
    }
  });
</script>

{#if space}
  {#if before?.length}{before}&thinsp;|&thinsp;{/if}<strong>{@html formatInfix(reflexProper)}</strong>{#if after?.length}&thinsp;|&thinsp;{after}{/if}
{:else}
  {#if before?.length}{before}|{/if}<strong>{@html formatInfix(reflexProper)}</strong>{#if after?.length}|{after}{/if}
{/if}
