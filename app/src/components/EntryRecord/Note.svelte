<script>
  import Form from '$components/EntryRecord/Form.svelte';
  import Paragraph from '$components/EntryRecord/Paragraph.svelte';

  /**
   * @typedef {Object} Props
   * @property {any} data
   * @property {any} key
   * @property {any} label
   * @property {boolean} [join]
   * @property {boolean} [trans]
   * @property {boolean} [link]
   * @property {any} [class]
   */

  /** @type {Props} */
  let {
    data,
    key,
    label,
    join = false,
    trans = false,
    link = false,
    class: className = null
  } = $props();
  
  const items = data[key];
</script>

{#if join}
  <Paragraph period={!(!trans && items[items.length - 1].match(/\.$/))} class={className}><span class="label">{label}:</span> {#each items as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} {link} />{/each}</Paragraph>
{:else}
  {#each items as item}
    <Paragraph period={!(!trans && item.match(/\.$/))} class={className}><span class="label">{label}:</span> <Form {item} {key} {trans} {link} /></Paragraph>
  {/each}
{/if}
