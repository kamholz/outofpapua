<script>
  import Reflex from '$components/Reflex.svelte';
  import ReflexIPA from '$components/ReflexIPA.svelte';
  import { capitalizeFirstLetter, maybeGloss } from '$lib/util';

  export let set;
  export let ipaFunctions;
  // export let nameEntry;
  // const gloss = nameEntry ? maybeGloss(nameEntry.senses) : null;

  function reference(source) {
    return '(' + source.reference.replace(/[()]/g, '') + ')';
  }

  function origin(entry) {
    let txt = capitalizeFirstLetter(entry.origin);
    if (entry.origin_language_name) {
      txt += ': ' + entry.origin_language_name;
    }
    txt += '.';
    return txt;
  }
</script>

<!-- <p>
  {#if nameEntry}
    {nameEntry.language.name} <strong>{nameEntry.headword}</strong>{gloss} {reference(nameEntry.source)}
  {:else}
    Set: {set.name_auto.txt}
  {/if}
</p> -->

{#if set.note}
  <p>Notes: {set.note}</p>
{/if}

{#each set.members as { entry, language, note, reflex, source }}
  <p>
    {language.name}
    <em><Reflex {reflex} headword={entry.headword} /></em>
    {#if entry.headword_ipa}
      <ReflexIPA {reflex} headword_ipa={entry.headword_ipa} func={ipaFunctions[source.ipa_conversion_rule]} />
    {/if}
    {maybeGloss(entry.senses)} {reference(source)}
    {#if entry.origin}
      <strong>{origin(entry)}</strong>
    {/if}
    {#if note}
      (Notes: {note})
    {/if}
  </p>
{/each}

<style lang="scss">
  p {
    @include indent;
    &:not(:last-child) {
      margin-block-end: 1em;
    }
  }
</style>