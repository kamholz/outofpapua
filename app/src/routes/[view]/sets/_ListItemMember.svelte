<script>
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import EntryLink from '$components/EntryLink.svelte';
  import Reflex from '$components/Reflex.svelte';
  import { getContext } from 'svelte';
  import { glossesSummary } from '$lib/util';

  export let member;
  let { entry } = member;
  const { language, reflex, source } = member;
  const preferences = getContext('preferences');
</script>

<div class={entry.origin}>
  <strong>{language.name}</strong> <EntryInfoPopover bind:entry language_id={language.id} click={false}><EntryLink {entry}><Reflex form={reflex ?? entry.headword} /></EntryLink></EntryInfoPopover>
</div>
<div>
  {source.reference}
</div>
<div>
  {#if entry.senses[0]?.glosses?.[0]}{glossesSummary(entry.senses[0].glosses, $preferences)}{/if}
</div>

<style lang="scss">
  div {
    line-height: 1.5;
    @include indent;
  }
</style>