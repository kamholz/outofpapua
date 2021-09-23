<script>
  import { langMarkerSorted } from '$lib/parse_record';

  export let sense;
  const translation = sense.definition ?? sense.gloss;
</script>

{#if sense.pos}
  <span class="pos">{sense.pos}</span>.
{/if}

{#if translation}
  {#each langMarkerSorted(translation) as [txt, lang]}
    <span class="translation">{txt.join('; ')}</span> (<span class="lang">{lang}</span>).
  {/each}
{/if}

{#if sense.example}
  {#each sense.example as [form, ...translations]}
    <span class="example"><span class="example-form">{form}</span> {#each translations as [translation, lang], i}{#if i !== 0}, {/if}‘<span class="example-trans">{translation}</span>’ (<span class="lang">{lang}</span>){/each}</span>.
  {/each}
{/if}

<style lang="scss">
  .translation::before {
    content: ' ';
  }
</style>