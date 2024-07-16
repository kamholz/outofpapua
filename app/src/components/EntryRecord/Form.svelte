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
  if (link === 'entry') {
    sourceId = getContext('source').id;
  }

  function makeEntryLink(item) {
    return `/sources/${sourceId}/entries?` + new URLSearchParams({ headword: `^${item}$` });
  }
</script>

{#if trans}
  <span class={key}><span class="form">{#if link === 'entry'}<a href={makeEntryLink(form)}>{@html toolboxMarkup(form)}</a>{:else}{@html toolboxMarkup(form)}{/if}</span>{#if translations}{#each translations as [translation, lang], i}{#if i !== 0}, {/if}<span class="trans">{@html toolboxMarkup(translation)}</span><MaybeLang {lang} />{/each}{/if}</span>
{:else}
  <span class={key}>{#if link}{#if link === 'entry'}<a href={makeEntryLink(item)}>{@html toolboxMarkup(item)}</a>{:else if link === 'url'}<a href={item}>{item}</a>{/if}{:else}{@html toolboxMarkup(item)}{/if}</span>
{/if}
