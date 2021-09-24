<script>
  import Form from '$components/EntryRecord/Form.svelte';

  export let data;
  export let key;
  export let label;
  export let trans = false;
</script>

<span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} />{/each}.