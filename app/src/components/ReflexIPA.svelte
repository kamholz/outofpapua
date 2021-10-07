<script>
  import { matchReflex } from '$lib/util';

  export let reflex;
  export let headword_ipa;
  export let func;
  const [before, reflexProper, after] = getReflex();

  function getReflex() {
    if (reflex) {
      return matchReflex(reflex).map((v) => func(v));
    } else {
      return [null, headword_ipa, null];
    }
  }
</script>

/{#if before?.length}{before}{/if}<strong>{reflexProper}</strong>{#if after?.length}{after}{/if}/