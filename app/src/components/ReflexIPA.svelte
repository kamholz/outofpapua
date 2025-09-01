<script>
  import { formatReflexIpa } from '$lib/util';

  export let reflex;
  export let headword_ipa;
  export let func;
  const [before, reflexProper, after] = formatReflexIpa(reflex, headword_ipa, func);
</script>

/{#if before.length}{before}{/if}<strong>{reflexProper}</strong>{#if after.length}{after}{/if}/
