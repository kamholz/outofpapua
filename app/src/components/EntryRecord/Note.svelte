<script>
  export let data;
  export let key;
  export let label;
  export let join = false;
</script>

{#if join}
  <div>
    <span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}, {/if}<span class={key}>{item}</span>{/each}
  </div>
{:else}
  {#each data[key] as item}
    <div>
      <span class="label">{label}:</span> <span class={key}>{item}</span>    
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