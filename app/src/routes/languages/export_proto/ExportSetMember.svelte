<script>
  import Glosses from '$components/Glosses.svelte';
  import Reflex from '$components/Reflex.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let member;
  $: ipa = $settings.ipa && member.entry.headword_ipa;
  $: orthography = $settings.orthography || !ipa;
</script>

<div>
  {member.language.name} {#if orthography}<Reflex reflex={member.reflex} headword={member.entry.headword} space={false} />{/if} {#if ipa}/<strong>{member.entry.headword_ipa}</strong>/{/if} <Glosses glosses={member.entry.senses?.[0]?.glosses} preferred />
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>