<script>
  export let data;
  export let key;
  export let label;
  export let join = false;
</script>

{#if key in data}
  {#if join}
    <div>
      <span class="label">{label}:</span> <span class={key}>{data[key].join(', ')}</span>    
    </div>
  {:else}
    {#each data[key] as item}
      <div>
        <span class="label">{label}:</span> <span class={key}>{item}</span>    
      </div>
    {/each}
  {/if}
{/if}

<style lang="scss">
  div {
    @include indent;

    .label {
      font-style: italic;
    }
  }
</style>