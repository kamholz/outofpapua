<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import Glosses from '$components/Glosses.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');
  import { referenceInParens } from '$lib/util';

  export let entry;
  export let ipaFunctions;
</script>

{#if entry.sets}
  {#each entry.sets as set}
    <div>
      <div class="heading">
        <span class="headword">{entry.headword}</span> <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.ancestors && set.members.ancestor.length}{#each set.members.ancestor as member}&nbsp;&lt; {member.language.name} <span class="headword">{member.entry.headword}</span>{#if $settings.ancestor_glosses}&nbsp;<Glosses glosses={member.entry.senses?.[0]?.glosses} preferred />{/if}{#if $settings.ancestor_source}&nbsp;{referenceInParens(member.source.reference)}{/if}{/each}{/if}.{#if $settings.source}&nbsp;{referenceInParens(entry.source_reference)}{/if}{#if $settings.note && entry.set_member_note}&nbsp;({entry.set_member_note}){/if}
      </div>

      <div class="members">
        {#if $settings.descendants && set.members.descendant.length}
          {#each set.members.descendant as member}
            <ExportSetMember {member} {ipaFunctions} />
          {/each}
        {/if}

        {#if $settings.borrowed && set.members.borrowed.length}
          <div class="heading">Borrowings:</div>
          {#each set.members.borrowed as member}
            <ExportSetMember {member} {ipaFunctions} />
          {/each}
        {/if}

        {#if $settings.outcomparison && set.members.other.length}
          <div class="heading">Outcomparisons:</div>
          {#each set.members.other as member}
            <ExportSetMember {member} {ipaFunctions} />
          {/each}
        {/if}
      </div>

      {#if $settings.set_note && set.note}
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
