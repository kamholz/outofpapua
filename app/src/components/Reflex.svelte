<script>
  export let form;
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

{#if before?.length}{before}&thinsp;|&thinsp;{/if}<strong>{reflex}</strong>{#if after?.length}&thinsp;|&thinsp;{after}{/if}