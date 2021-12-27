<script>
  import { getContext } from 'svelte';

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
  <span class={key}><span class="form">{#if link}<a href={makeLink(form)} sveltekit:prefetch>{form}</a>{:else}{form}{/if}</span>{#if translations}{#each translations as [translation, lang], i}{#if i !== 0}, {/if}<span class="trans">‘{translation}’</span> (<span class="lang">{lang}</span>){/each}{/if}</span>
{:else}
  <span class={key}>{#if link}<a href={makeLink(item)} sveltekit:prefetch>{item}</a>{:else}{item}{/if}</span>
{/if}
