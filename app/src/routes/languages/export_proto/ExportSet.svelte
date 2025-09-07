<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import Glosses from '$components/Glosses.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');
  import { referenceInParens } from '$lib/util';

  export let set;
  $: ({ members: { proto, ancestor, descendant, borrowed, other } } = set);
  export let ipaFunctions;
</script>

<div>
  <div class="heading">
    {#each proto as { entry, note, source }, i }{#if i > 0}; {/if}<span class="headword">{entry.headword}</span> <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.source}&nbsp;{referenceInParens(source.reference)}{/if}{#if note && $settings.note}&nbsp;({note}){/if}{/each}{#if ancestor.length && $settings.ancestors}{#each ancestor as { entry, language, source } }{#if language.repeat};{:else}&nbsp;&lt;{/if} {language.name} <span class="headword">{entry.headword}</span>{#if $settings.ancestor_glosses}&nbsp;<Glosses glosses={entry.senses?.[0]?.glosses} preferred />{/if}{#if $settings.ancestor_source}&nbsp;{referenceInParens(source.reference)}{/if}{/each}{/if}.
  </div>

  <div class="members">
    {#if descendant.length && $settings.descendants}
      {#each descendant as member}
        <ExportSetMember {member} {ipaFunctions} />
      {/each}
    {/if}

    {#if other.length && $settings.outcomparisons}
      <div class="heading">Outcomparisons:</div>
      {#each other as member}
        <ExportSetMember {member} {ipaFunctions} />
      {/each}
    {/if}

    {#if borrowed.length && $settings.outborrowings}
      <div class="heading">Outborrowings:</div>
      {#each borrowed as member}
        <ExportSetMember {member} {ipaFunctions} isOutborrowings />
      {/each}
    {/if}
  </div>

  {#if set.note && $settings.set_note}
    <div class="note">
      <span class="label">Note:</span> {set.note}
    </div>
  {/if}
</div>

<style>
  .heading {
    margin-block-start: var(--item-sep);
  }

  .headword {
    font-weight: bold;
  }

  .members, .note {
    margin-block-start: 8px;
    margin-inline-start: 24px;
  }

  .label {
    font-style: italic;
  }
</style>
