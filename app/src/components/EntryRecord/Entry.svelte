<script>
  import Div from '$components/EntryRecord/Div.svelte';
  import Note from '$components/EntryRecord/Note.svelte';
  import Paragraph from '$components/EntryRecord/Paragraph.svelte';
  import Sense from '$components/EntryRecord/Sense.svelte';
  import { entryNotesPost, entryNotesPre } from './notes';
  import { getContext } from 'svelte';

  export let entry;
  const compact = getContext('compact');

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
    {#each entryNotesPre as { key, label, join, trans, link  }}
      {#if key in entry}
        <Note data={entry} {key} {label} {join} {trans} {link} />
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

    {#each entryNotesPost as { key, label, join, trans, link }}
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

      .example-p, .sense-note-p {
        margin-inline-start: 20px;
      }

      .example-note-p {
        margin-inline-start: 36px;
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