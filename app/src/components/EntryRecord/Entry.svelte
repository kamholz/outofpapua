<script>
  import InlineNote from '$components/EntryRecord/InlineNote.svelte';
  import Note from '$components/EntryRecord/Note.svelte';
  import Sense from '$components/EntryRecord/Sense.svelte';

  export let entry;

  const inlineNotes = [
    {
      key: 'variant',
      label: 'Variants',
      join: true,
      bold: true,
    },
  ];

  const notes = [
    {
      key: 'domain',
      label: 'Semantic domain',
      join: true,
      bold: false,
    },
    {
      key: 'scientific',
      label: 'Scientific name',
      join: true,
      bold: false,
    },
    {
      key: 'synonym',
      label: 'Synonyms',
      join: true,
      bold: true,
    },
    {
      key: 'antoynym',
      label: 'Antonyms',
      join: true,
      bold: true,
    },
    {
      key: 'usage',
      label: 'Usage',
      join: false,
      bold: false,
    },
    {
      key: 'etymology',
      label: 'Etymology',
      join: false,
      bold: false,
    },
    {
      key: 'encyclopedic',
      label: 'Encyclopedic info',
      join: false,
      bold: false,
    },
    {
      key: 'source',
      label: 'Source',
      join: true,
      bold: false,
    },
    {
      key: 'reference',
      label: 'Reference',
      join: true,
      bold: false,
    },
    {
      key: 'note',
      label: 'Note',
      join: false,
      bold: false,
    },
    {
      key: 'crossref',
      label: 'See also',
      join: true,
      bold: true,
    },

  ];
</script>

<div class="entry">
  {#if entry.headword}
    <span class="headword">{entry.headword.join(', ')}</span>.
  {/if}

  {#each inlineNotes as { key, label, join, bold }}
    <InlineNote data={entry} {key} {label} {join} {bold} />
  {/each}

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
      {#each notes as { key, label, join, bold }}
        <Note data={entry} {key} {label} {join} {bold} />
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