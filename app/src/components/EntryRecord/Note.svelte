<script>
  import Form from '$components/EntryRecord/Form.svelte';
  import Paragraph from '$components/EntryRecord/Paragraph.svelte';

  export let data;
  export let key;
  export let label;
  export let join = false;
  export let trans = false;
  export let link = false;
  let className = null;
  export { className as class };
  const items = data[key];
</script>

{#if join}
  <Paragraph period={!(!trans && items[items.length - 1].match(/\.$/))} class={className}><span class="label">{label}:</span> {#each items as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} {link} />{/each}</Paragraph>
{:else}
  {#each items as item}
    <Paragraph period={!(!trans && item.match(/\.$/))} class={className}><span class="label">{label}:</span> <Form {item} {key} {trans} {link} /></Paragraph>
  {/each}
{/if}
