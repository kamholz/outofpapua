<script>
  import Glosses from '$components/Glosses.svelte';
  import Reflex from '$components/Reflex.svelte';
  import ReflexIPA from '$components/ReflexIPA.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let member;
  $: ({
    entry,
    language,
    reflex,
    source,
  } = member);
  export let ipaFunctions;
  $: ipa = $settings.ipa && entry.headword_ipa;
  $: orthography = $settings.orthography || !ipa;
</script>

<div>
  {language.name} {#if orthography}<Reflex {reflex} headword={entry.headword} space={false} />{/if} {#if ipa}<ReflexIPA {reflex} headword_ipa={entry.headword_ipa} func={ipaFunctions[source.ipa_conversion_rule]} />{/if} <Glosses glosses={entry.senses?.[0]?.glosses} preferred />
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>
