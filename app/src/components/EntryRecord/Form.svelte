<script>
  import MaybeLang from '$components/EntryRecord/MaybeLang.svelte';
  import { getContext } from 'svelte';
  import { toolboxMarkup } from '$lib/util';

  export let item;
  export let key;
  export let trans = false;
  export let link = false;

  let form, translations, sourceId;
  if (trans) {
    [form, ...translations] = item;
  }
  if (link) {
    sourceId = getContext('source').id;
  }

  function makeLink(item) {
    return `/sources/${sourceId}/entries?` + new URLSearchParams({ headword: `^${item}$` });
  }
</script>

{#if trans}
  <span class={key}><span class="form">{#if link}<a href={makeLink(form)} data-sveltekit-prefetch>{@html toolboxMarkup(form)}</a>{:else}{@html toolboxMarkup(form)}{/if}</span>{#if translations}{#each translations as [translation, lang], i}{#if i !== 0}, {/if}<span class="trans">‘{@html toolboxMarkup(translation)}’</span><MaybeLang {lang} />{/each}{/if}</span>
{:else}
  <span class={key}>{#if link}<a href={makeLink(item)} data-sveltekit-prefetch>{@html toolboxMarkup(item)}</a>{:else}{@html toolboxMarkup(item)}{/if}</span>
{/if}
