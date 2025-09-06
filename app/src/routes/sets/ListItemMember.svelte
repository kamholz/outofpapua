<script>
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import EntryLink from '$components/EntryLink.svelte';
  import Glosses from '$components/Glosses.svelte';
  import Reflex from '$components/Reflex.svelte';

  export let member;
  let { entry } = member;
  const { language, reflex, source } = member;
</script>

<div class={entry.origin}>
  <strong>{language.name}</strong>
  <EntryInfoPopover bind:entry language_id={language.id} click={false}>
    <EntryLink {entry}>
      <Reflex {reflex} headword={entry.headword} />
    </EntryLink>
  </EntryInfoPopover>
</div>
<div>
  {source.reference}
</div>
<div>
  <Glosses glosses={entry.senses[0]?.glosses} />
</div>

<style lang="scss">
  div {
    line-height: 1.5;
    @include indent;
  }
</style>
