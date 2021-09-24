<script>
  import Form from '$components/EntryRecord/Form.svelte';
  import Note from '$components/EntryRecord/InlineNote.svelte';
  import Pos from '$components/EntryRecord/Pos.svelte';
  import { getContext } from 'svelte';
  import { langMarkerSorted } from '$lib/parse_record';

  export let sense;
  const formatting = getContext('formatting');
  const translation = sense.definition ?? (formatting?.preferReverse ? sense.reverse ?? sense.gloss : sense.gloss);

  const notes = [
    {
      key: 'literal',
      label: 'Literally',
      join: true,
    },
  ];
</script>

{#if sense.pos}
  <Pos pos={sense.pos} />
{/if}

{#if translation}
  {#each langMarkerSorted(translation) as [txt, lang]}
    <span class="translation">{txt.join('; ')}</span> (<span class="lang">{lang}</span>).
  {/each}
{/if}

{#each notes as { key, label, join }}
  {#if key in sense}
    <Note data={sense} {key} {label} {join} />
  {/if}
{/each}

{#if sense.example}
  {#each sense.example as item}
    <Form {item} key="example" trans />.
  {/each}
{/if}
