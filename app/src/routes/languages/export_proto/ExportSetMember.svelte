<script>
  import Glosses from '$components/Glosses.svelte';
  import Reflex from '$components/Reflex.svelte';
  import ReflexIPA from '$components/ReflexIPA.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');
  import { referenceInParens } from '$lib/util';

  export let member;
  $: ({
    entry,
    language,
    note,
    reflex,
    source,
  } = member);
  export let ipaFunctions;
  $: ipa = $settings.ipa && entry.headword_ipa;
  $: orthography = $settings.orthography || !ipa;
</script>

<div>
  {language.name} {#if orthography}<Reflex {reflex} headword={entry.headword} space={false} />{/if} {#if ipa}<ReflexIPA {reflex} headword_ipa={entry.headword_ipa} func={ipaFunctions[source.ipa_conversion_rule]} />{/if} <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.descendant_source}&nbsp;{referenceInParens(source)}{/if}{#if $settings.descendant_note && note}&nbsp;({note}){/if}
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>
