<script>
  import Form from '$components/EntryRecord/Form.svelte';

  export let data;
  export let key;
  export let label;
  export let join = false;
  export let trans = false;
</script>

{#if join}
  <div>
    <span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}; {/if}<Form {item} {key} {trans} />{/each}
  </div>
{:else}
  {#each data[key] as item}
    <div>
      <span class="label">{label}:</span> <Form {item} {key} {trans} />
    </div>
  {/each}
{/if}

<style lang="scss">
  div {
    @include indent;

    &:not(:first-child) {
      margin-block-start: 4px;
    }
  }
</style>