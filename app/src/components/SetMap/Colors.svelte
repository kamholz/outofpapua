<script>
  import { fade } from 'svelte/transition';

  export let colorBy;
  export let colorOriginLanguage;
  export let colors;
  export let sets;
  export let originLanguages;

  function toggleColorOriginLanguage() {
    colorOriginLanguage = !colorOriginLanguage;
  }
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
    <div>
      <label>
        Borrowed:
        <input type="color" bind:value={colors.origin.borrowed} />
      </label>
      {#if originLanguages.length}
        <button on:click={toggleColorOriginLanguage}>{ colorOriginLanguage ? '-' : '+'}</button>
      {/if}
    </div>
    {#if colorOriginLanguage}
      {#each originLanguages as { name, className }}
        <div>
          <label class="originlang">
            {name}:
            <input type="color" bind:value={colors.originLanguage[className]} />
          </label>
        </div>
      {/each}
    {/if}
    <div>
      <label>
        Inherited:
        <input type="color" bind:value={colors.origin.inherited} />
      </label>
    </div>
    <div>
      <label>
        Mixed:
        <input type="color" bind:value={colors.origin.mixed} />
      </label>
    </div>
    <div>
      <label>
        Unspecified:
        <input type="color" bind:value={colors.origin.unspecified} />
      </label>
    </div>
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

  .colors {
    div {
      display: flex;
      align-items: flex-start;
    }

    label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      inline-size: 9.5em;

      &.originlang {
        margin-inline-start: 0.5em;
        inline-size: 9em;
      }
    }

    button {
      margin-block-start: 1px;
      margin-inline-start: 10px;
      inline-size: 22px;
      block-size: 24px;
      padding: 0;
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