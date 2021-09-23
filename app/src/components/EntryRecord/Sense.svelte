<script>
  import InlineNote from '$components/EntryRecord/InlineNote.svelte';
  import { getContext } from 'svelte';
  import { langMarkerSorted } from '$lib/parse_record';

  export let sense;
  const formatting = getContext('formatting');
  const translation = sense.definition ?? (formatting.preferReverse ? sense.reverse ?? sense.gloss : sense.gloss);

  const notes = [
    {
      key: 'literal',
      label: 'Literally',
      join: true,
    },
  ];
</script>

{#if sense.pos}
  <span class="pos">{sense.pos}</span>.
{/if}

{#if translation}
  {#each langMarkerSorted(translation) as [txt, lang]}
    <span class="translation">{txt.join('; ')}</span> (<span class="lang">{lang}</span>).
  {/each}
{/if}

{#each notes as { key, label, join }}
  {#if key in sense}
    <InlineNote data={sense} {key} {label} {join} />
  {/if}
{/each}

{#if sense.example}
  {#each sense.example as [form, ...translations]}
    <span class="example"><span class="example-form">{form}</span> {#each translations as [translation, lang], i}{#if i !== 0}, {/if}‘<span class="example-trans">{translation}</span>’ (<span class="lang">{lang}</span>){/each}</span>.
  {/each}
{/if}

<style lang="scss">
  .translation::before, .example-form::before {
    content: ' ';
  }
</style>