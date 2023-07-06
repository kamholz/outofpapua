<script>
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage, glossesSummary, glossesSummaryNoLanguage, glossesSummaryPreferred,
    toolboxMarkup } from '$lib/util';
  const preferences = getContext('preferences');

  export let glosses;
  export let single = false;
  export let language = true;
  export let preferred = false;

  function summary(glosses) {
    if (single) {
      return glossSummaryNoLanguage(glosses[0]);
    } else if (preferred) {
      return glossesSummaryPreferred(glosses);
    } else if (!language) {
      return glossesSummaryNoLanguage(glosses);
    } else {
      return glossesSummary(glosses, $preferences);
    }
  }
</script>

{#if glosses?.length}
  {@html toolboxMarkup(summary(glosses))}
{/if}