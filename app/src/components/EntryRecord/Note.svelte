<script>
  export let data;
  export let key;
  export let label;
  export let join = false;
  export let bold = false;
</script>

{#if key in data}
  {#if join}
    <div>
      <span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}, {/if}<span class={key} class:bold>{item}</span>{/each}
    </div>
  {:else}
    {#each data[key] as item}
      <div>
        <span class="label">{label}:</span> <span class={key} class:bold>{item}</span>    
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

    .bold {
      font-weight: bold;
    }
  }
</style>