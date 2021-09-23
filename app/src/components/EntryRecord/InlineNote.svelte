<script>
  export let data;
  export let key;
  export let label;
  export let join = false;
</script>

{#if join}
  <span class="label">{label}:</span> {#each data[key] as item, i}{#if i !== 0}, {/if}<span class={key}>{item}</span>{/each}.
{:else}
  {#each data[key] as item}
    <span class="label">{label}:</span> <span class={key}>{item}</span>.
  {/each}
{/if}
