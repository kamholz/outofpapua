<script>
  import Note from '$components/EntryRecord/Note.svelte';
  import Sense from '$components/EntryRecord/Sense.svelte';

  export let entry;
  const notes = [
    {
      key: 'variant',
      label: 'Variants',
      join: true,
    },
    {
      key: 'domain',
      label: 'Semantic domain',
      join: true,
    },
    {
      key: 'scientific',
      label: 'Scientific name',
      join: true,
    },
    {
      key: 'synonym',
      label: 'Synonyms',
      join: true,
    },
    {
      key: 'antoynym',
      label: 'Antonyms',
      join: true,
    },
    {
      key: 'usage',
      label: 'Usage',
      join: false,
    },
    {
      key: 'etymology',
      label: 'Etymology',
      join: false,
    },
    {
      key: 'encyclopedic',
      label: 'Encyclopedic info',
      join: false,
    },
    {
      key: 'source',
      label: 'Source',
      join: true,
    },
    {
      key: 'reference',
      label: 'Reference',
      join: true,
    },
    {
      key: 'note',
      label: 'Note',
      join: false,
    },
    {
      key: 'crossref',
      label: 'See also',
      join: true,
    },

  ];
</script>

<div class="entry">
  {#if entry.headword}
    <span class="headword">{entry.headword.join(', ')}</span>.
  {/if}

  {#if entry.pos}
    <span class="pos">{entry.pos}</span>.
  {/if}

  {#if entry.sense}
    {#if entry.sense.length > 1}
      {#each entry.sense as sense, i}
        <span class="sense-num">({i + 1})</span>
        <Sense {sense} />
      {/each}
    {:else}
      <Sense sense={entry.sense[0]} />
    {/if}
  {/if}

  {#if notes.some(({ key }) => entry[key])}
    <div class="notes">
      {#each notes as { key, label, join }}
        <Note data={entry} {key} {label} {join} />
      {/each}
    </div>
  {/if}

  {#if entry.subentry}
    <div class="subentry">
      {#each entry.subentry as subentry}
        <svelte:self entry={subentry} />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .entry {
    margin-block-start: 16px;

    .headword {
      font-weight: bold;
    }

    :global(.pos) {
      font-style: italic;
    }

    .sense-num::before {
      content: ' ';
    }

    .notes {
      margin-block-start: 8px;
    }

    .subentry {
      margin-inline-start: 1em;
    }
  }
</style>