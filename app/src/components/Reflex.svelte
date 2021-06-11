<script>
  export let form;
  export let space = true;
  let before, reflex, after;
  $: {
    const match = form.match(/^(.*)\|(.+)\|(.*)$/);
    if (match) {
      [before, reflex, after] = match.slice(1);
    } else {
      reflex = form;
    }
  }
</script>

{#if space}
  {#if before?.length}{before}&thinsp;|&thinsp;{/if}<strong>{reflex}</strong>{#if after?.length}&thinsp;|&thinsp;{after}{/if}
{:else}
  {#if before?.length}{before}|{/if}<strong>{reflex}</strong>{#if after?.length}|{after}{/if}
{/if}
