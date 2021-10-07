<script>
  import Form from '$components/EntryRecord/Form.svelte';

  export let data;
  export let key;
  export let label;
  export let join = false;
  export let trans = false;
  const items = data[key];
</script>

{#if join}
  <span class="label">{label}:</span> {#each items as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} />{/each}{#if !(!trans && items[items.length - 1].match(/\.$/))}.{/if}
{:else}
  {#each items as item}
    <span class="label">{label}:</span> <Form {item} {key} {trans} />{#if !(!trans && item.match(/\.$/))}.{/if}
  {/each}
{/if}