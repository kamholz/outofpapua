<script>
  import { fade } from 'svelte/transition';

  export let colorBy;
  export let colors;
  export let sets;
</script>

{#if sets?.length > 1}
  <div class="radios">
    <label>
      <input
        type="radio"
        name="color_by"
        value="origin"
        checked={colorBy === 'origin'}
        bind:group={colorBy}
      >
      By origin
    </label>
    <label>
      <input
        type="radio"
        name="color_by"
        value="set"
        checked={colorBy === 'set'}
        bind:group={colorBy}
      >
      By set
    </label>
  </div>
{/if}
<div class="colors" in:fade|local>
  {#if colorBy === 'origin'}
    <label>
      Borrowed:
      <input type="color" bind:value={colors.origin.borrowed} />
    </label>
    <label>
      Inherited:
      <input type="color" bind:value={colors.origin.inherited} />
    </label>
    <label>
      Mixed:
      <input type="color" bind:value={colors.origin.mixed} />
    </label>
    <label>
      Unknown:
      <input type="color" bind:value={colors.origin.unknown} />
    </label>
  {:else}
    {#each sets as set (set.id)}
      <label>
        {set.name_auto.txt}:
        <input type="color" bind:value={colors.set[set.id]} />
      </label>
    {/each}
  {/if}
</div>

<style lang="scss">
  label {
    margin-block-end: 8px;
  }

  .colors label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    inline-size: 9.5em;
  }

  input[type="color"] {
    flex-shrink: 0;
  }

  .radios {
    display: flex;
    align-items: center;
    margin-block-end: 16px;

    > label {
      margin-inline-end: 8px;
    }
  }
</style>