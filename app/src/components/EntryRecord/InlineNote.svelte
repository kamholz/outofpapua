<script>
  import Form from '$components/EntryRecord/Form.svelte';

  export let data;
  export let key;
  export let label;
  export let trans = false;
  const items = data[key];
  const finalPeriod = !(!trans && items[items.length - 1].match(/\.$/));
</script>

<span class="label">{label}:</span> {#each items as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} />{/each}{#if finalPeriod}.{/if}