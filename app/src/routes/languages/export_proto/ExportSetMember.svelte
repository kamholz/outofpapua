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
  export let showBorrowed = false;

  function borrowedText() {
    const { origin, origin_language_name } = entry;
    if (origin !== 'borrowed') {
      return ''; 
    }
    const weShowOrigin = $settings.borrowed_origin && origin_language_name;
    const weShowBorrowed = showBorrowed || weShowOrigin;
    let txt = '';
    if (weShowBorrowed) {
      txt += 'Borrowed';
    }
    if (weShowOrigin) {
      txt += `: ${origin_language_name}`;
    }
    return txt.length ? `\u00a0(${txt})` : '';
  }
</script>

<div>
  {language.name} {#if orthography}<Reflex {reflex} headword={entry.headword} space={false} />{/if} {#if ipa}<ReflexIPA {reflex} headword_ipa={entry.headword_ipa} func={ipaFunctions[source.ipa_conversion_rule]} />{/if} <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.attested_source}&nbsp;{referenceInParens(source.reference)}{/if}{borrowedText($settings)}{#if $settings.attested_note && note}&nbsp;({note}){/if}
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>
