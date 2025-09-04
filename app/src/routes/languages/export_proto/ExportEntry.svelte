<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import Glosses from '$components/Glosses.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');
  import { referenceInParens } from '$lib/util';

  export let entry;
  export let ipaFunctions;

  let lastAncestorLanguageId;
  function ancestorSeparator({ language: { id }}) {
    if (id === lastAncestorLanguageId) {
      return ';';
    } else {
      lastAncestorLanguageId = id;
      return '\u00a0<';
    }
  }
</script>

{#if entry.sets}
  {#each entry.sets as set}
    <div>
      <div class="heading">
        <span class="headword">{entry.headword}</span> <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.source}&nbsp;{referenceInParens(entry.source_reference)}{/if}{#if entry.set_member_note && $settings.note}&nbsp;({entry.set_member_note}){/if}{#if set.members.ancestor.length && $settings.ancestors}{#each set.members.ancestor as member}{ancestorSeparator(member)} {member.language.name} <span class="headword">{member.entry.headword}</span>{#if $settings.ancestor_glosses}&nbsp;<Glosses glosses={member.entry.senses?.[0]?.glosses} preferred />{/if}{#if $settings.ancestor_source}&nbsp;{referenceInParens(member.source.reference)}{/if}{/each}{/if}.
      </div>

      <div class="members">
        {#if set.members.descendant.length && $settings.descendants}
          {#each set.members.descendant as member}
            <ExportSetMember {member} {ipaFunctions} />
          {/each}
        {/if}

        {#if set.members.other.length && $settings.outcomparisons}
          <div class="heading">Outcomparisons:</div>
          {#each set.members.other as member}
            <ExportSetMember {member} {ipaFunctions} />
          {/each}
        {/if}

        {#if set.members.borrowed.length && $settings.outborrowings}
          <div class="heading">Outborrowings:</div>
          {#each set.members.borrowed as member}
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
  {/each}
{:else}
  <div>
    <div class="heading">
      <span class="headword">{entry.headword}</span> <Glosses glosses={entry.senses?.[0]?.glosses} preferred />.
    </div>
  </div>
{/if}

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
