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
      trans: true,
    },
    {
      key: 'singular',
      label: 'Singular',
      join: true,
    },
    {
      key: 'plural',
      label: 'Plural',
      join: true,
    },
  ];

  const notes = [
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
      key: 'antonym',
      label: 'Antonyms',
      join: true,
    },
    {
      key: 'usage',
      label: 'Usage',
      join: false,
    },
    {
      key: 'grammar',
      label: 'Grammatical note',
      join: false,
    },
    {
      key: 'phono',
      label: 'Phonological note',
      join: false,
    },
    {
      key: 'discourse',
      label: 'Discourse note',
      join: false,
    },
    {
      key: 'socio',
      label: 'Sociolinguistic note',
      join: false,
    },
    {
      key: 'anthro',
      label: 'Anthropological note',
      join: false,
    },
    {
      key: 'note',
      label: 'Note',
      join: false,
    },
    {
      key: 'encyclopedic',
      label: 'Encyclopedic info',
      join: false,
    },
    {
      key: 'etymology',
      label: 'Etymology',
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
      key: 'crossref',
      label: 'See also',
      join: true,
      trans: true,
    },

  ];

  function getPh(txt) {
    return txt.match(/^\[/) ? txt : `[${txt}]`;
  }
</script>

<div class="entry">
  <div class="body">
    {#if entry.headword}
      <span class="headword">{entry.headword.join(', ')}</span>{#if entry.ph}<span class="ph">{getPh(entry.ph)}</span>{/if}.
    {/if}

    {#each inlineNotes as { key, label, join, trans }}
      {#if key in entry}
        <InlineNote data={entry} {key} {label} {join} {trans} />
      {/if}
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
  </div>

  {#if notes.some(({ key }) => entry[key])}
    <div class="notes">
      {#each notes as { key, label, join, trans }}
        {#if key in entry}
          <Note data={entry} {key} {label} {join} {trans} />
        {/if}
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

    .body {
      @include indent;
    }

    .notes {
      margin-block-start: 8px;
    }

    .subentry {
      margin-inline-start: 1em;
    }

    :global {
      .pos, .label, .lang {
        font-style: italic;
      } 

      .headword, .variant, .sense-num, .singular, .plural, .form, .synonym, .antonym {
        font-weight: bold;
      }

      .sense-num::before, .ph::before, .translation::before, .form::before, .trans::before {
        content: ' ';
      }
    }
  }
</style>