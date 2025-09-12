<script>
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage, glossesSummary, glossesSummaryPreferred } from '$lib/util';
  const preferences = getContext('preferences');

  /**
   * @typedef {Object} Props
   * @property {any} glosses
   * @property {boolean} [single]
   * @property {boolean} [preferred]
   */

  /** @type {Props} */
  let { glosses, single = false, preferred = false } = $props();

  function summary(glosses) {
    if (single) {
      return glossSummaryNoLanguage(glosses[0]);
    } else if (preferred) {
      return glossesSummaryPreferred(glosses);
    } else {
      return glossesSummary(glosses, $preferences);
    }
  }
</script>

{#if glosses?.length}
  {@html summary(glosses)}
{/if}
