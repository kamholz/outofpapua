<script>
  import ExportSet from './ExportSet.svelte';
  import Glosses from '$components/Glosses.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let entry;
</script>

{#each entry.sets as set}
  <div>
    <div class="heading">
      <span class="headword">{entry.headword}</span> <Glosses glosses={entry.senses?.[0]?.glosses} preferred />{#if $settings.include_ancestors && set.members.ancestor.length}{#each set.members.ancestor as member}&nbsp;&lt; {member.language.name} <span class="headword">{member.entry.headword}</span> <Glosses glosses={member.entry.senses?.[0]?.glosses} preferred />{/each}{/if}
    </div>
    <ExportSet {entry} {set} />
  </div>
{/each}

<style>
  .heading {
    margin-block-start: var(--item-sep);
  }
  .headword {
    font-weight: bold;
  }
</style>