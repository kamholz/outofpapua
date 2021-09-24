<script>
  import Form from '$components/EntryRecord/Form.svelte';

  export let data;
  export let key;
  export let label;
  export let join = false;
  export let trans = false;
</script>

{#if join}
  <span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} />{/each}.
{:else}
  {#each data[key] as item}
    <span class="label">{label}:</span> <Form {item} {key} {trans} />.
  {/each}
{/if}
