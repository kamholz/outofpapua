<script>
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import EntryLink from '$components/EntryLink.svelte';
  import Reflex from '$components/Reflex.svelte';
  import { glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let member;
  const { entry, reflex, source } = member;
</script>

<div class={entry.origin}>
  <strong>{source.language_name}</strong> <EntryInfoPopover {entry} click={false}><EntryLink {entry}><Reflex form={reflex ?? entry.headword} /></EntryLink></EntryInfoPopover>
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