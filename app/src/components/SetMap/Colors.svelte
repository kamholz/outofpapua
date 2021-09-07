<script>
  import { fade } from 'svelte/transition';

  export let colorBy;
  export let colors;
  export let sets;
</script>

{#if sets}
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
{#if colorBy === 'origin'}
  <div in:fade|local>
    <label class="color">
      Borrowed:
      <input type="color" bind:value={colors.origin.borrowed} />
    </label>
    <label class="color">
      Inherited:
      <input type="color" bind:value={colors.origin.inherited} />
    </label>
    <label class="color">
      Unknown:
      <input type="color" bind:value={colors.origin.unknown} />
    </label>
  </div>
{:else}
  <div in:fade|local>
    {#each sets as set (set.id)}
      <label class="color">
        {set.name_auto.txt}:
        <input type="color" bind:value={colors.set[set.id]} />
      </label>
    {/each}
  </div>
{/if}

<style lang="scss">
  div {
    width: 100%;
  }

  label {
    margin-block-end: 8px;

    &.color {
      display: flex;
      align-items: center;
      justify-content: space-between;
      inline-size: 9.5em;
    }
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