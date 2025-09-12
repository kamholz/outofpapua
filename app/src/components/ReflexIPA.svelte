<script>
  import { formatReflexIpa } from '$lib/util';

  let { reflex, headword_ipa, func } = $props();
  const [before, reflexProper, after] = formatReflexIpa(reflex, headword_ipa, func);
</script>

/{#if before.length}{before}{/if}<strong>{reflexProper}</strong>{#if after.length}{after}{/if}/
