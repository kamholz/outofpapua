<script>
  import Form from '$components/EntryRecord/Form.svelte';
  import MaybeLang from '$components/EntryRecord/MaybeLang.svelte';
  import Note from '$components/EntryRecord/Note.svelte';
  import Paragraph from '$components/EntryRecord/Paragraph.svelte';
  import { getContext } from 'svelte';
  import { langMarkerSorted } from '$lib/parse_record';
  import { mungePos, toolboxMarkup } from '$lib/util';

  export let sense;
  export let num = null;
  const compact = getContext('compact');
  const { formatting } = getContext('source');
  const translation = sense.definition ?? (formatting?.preferReverse ? sense.reverse ?? sense.gloss : sense.gloss);

  const notes = [
    {
      key: 'literal',
      label: 'Literally',
      join: true,
    },
  ];
</script>

<Paragraph>
  {#if num}
    <span class="sense-num">({num})</span>
  {:else if !compact}
    <span class="sense-num">•&nbsp;</span>
  {/if}

  {#if sense.pos}
    <span class="pos">{mungePos(sense.pos)}.</span>
  {/if}

  {#if translation}
    {#each langMarkerSorted(translation) as [txt, lang]}
      <span class="translation">{@html txt.map(toolboxMarkup).join('; ')}</span><MaybeLang {lang} />.
    {/each}
  {/if}
</Paragraph>

{#each notes as { key, label, join }}
  {#if key in sense}
    <Note data={sense} {key} {label} {join} />
  {/if}
{/each}

{#if sense.example}
  {#each sense.example as item}
    <Paragraph class="example-p">
      <Form {item} key="example" trans />{#if compact}.{/if}
    </Paragraph>
  {/each}
{/if}
