<script>
  import Div from '$components/EntryRecord/Div.svelte';
  import Note from '$components/EntryRecord/Note.svelte';
  import Paragraph from '$components/EntryRecord/Paragraph.svelte';
  import Sense from '$components/EntryRecord/Sense.svelte';
  import { getContext } from 'svelte';

  export let entry;
  const compact = getContext('compact');

  const notesPre = [
    {
      key: 'variant',
      label: 'Variants',
      trans: true,
      join: true,
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
    {
      key: 'paradigm',
      label: 'Paradigms',
      join: true,
    },
  ];

  const notesPost = [
    {
      key: 'scientific',
      label: 'Scientific name',
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
      key: 'question',
      label: 'Analyst’s question',
      join: false,
    },
    {
      key: 'encyclopedic',
      label: 'Encyclopedic info',
      join: false,
    },
    {
      key: 'domain',
      label: 'Semantic domain',
      join: true,
    },
    {
      key: 'etymology',
      label: 'Etymology',
      join: false,
    },
    {
      key: 'etymologyComment',
      label: 'Etymology comment',
      join: false,
    },
    {
      key: 'lexicalFunction',
      label: 'Lexical functions',
      join: true,
    },
    {
      key: 'synonym',
      label: 'Synonyms',
      join: true,
      link: true,
    },
    {
      key: 'antonym',
      label: 'Antonyms',
      join: true,
      link: true,
    },
    {
      key: 'crossref',
      label: 'See also',
      join: true,
      trans: true,
      link: true,
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
  ];

  function getPh(txt) {
    return txt.match(/^\[/) ? txt : `[${txt}]`;
  }
</script>

<div class="entry" class:compact>
  <Paragraph class="headword-p">
    {#if entry.headword}
      <span class="headword">{entry.headword.join(', ')}</span>{#if entry.ph}<span class="ph">{getPh(entry.ph)}</span>{/if}
    {:else}
      <span class="headword">[missing headword]</span>
    {/if}
  </Paragraph>

  <Div>
    {#each notesPre as { key, label, join, trans }}
      {#if key in entry}
        <Note data={entry} {key} {label} {join} {trans} />
      {/if}
    {/each}

    {#if entry.sense}
      {#if entry.sense.length > 1}
        {#each entry.sense as sense, i}
          <Sense {sense} num={i + 1} />
        {/each}
      {:else}
        <Sense sense={entry.sense[0]} />
      {/if}
    {/if}

    {#each notesPost as { key, label, join, trans, link }}
      {#if key in entry}
        <Note data={entry} {key} {label} {join} {trans} {link} />
      {/if}
    {/each}
  </Div>
</div>

{#if entry.subentry}
  {#each entry.subentry as subentry}
    <svelte:self entry={subentry} />
  {/each}
{/if}

<style lang="scss">
  .entry {
    @include indent;

    &:not(:first-child) {
      margin-block-start: 16px;
    }

    :global {
      > div {
        margin-inline-start: 20px;
      }

      p {
        margin-block-end: 12px;
      }

      .headword-p {
        font-size: 19px;
      }

      .example-p {
        margin-inline-start: 20px;
      }

      .pos, .label, .lang {
        font-style: italic;
      }

      .headword, .variant, .sense-num, .singular, .plural, .form, .synonym, .antonym {
        font-weight: bold;
      }

      .ph::before, .translation::before, .trans::before, .lang::before {
        content: ' ';
      }
    }

    &.compact :global {
      .sense-num::before, .label::before, .form::before {
        content: ' ';
      }
    }
  }
</style>