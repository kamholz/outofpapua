<script>
  export let item;
  export let key;
  export let trans = false;

  let form, translations;
  if (trans) {
    [form, ...translations] = item;
  }
</script>

{#if trans}
  <span class={key}><span class="form">{form}</span>{#if translations}{#each translations as [translation, lang], i}{#if i !== 0}, {/if}<span class="trans">‘{translation}’</span> (<span class="lang">{lang}</span>){/each}{/if}</span>
{:else}
  <span class={key}>{item}</span>
{/if}
