<script>
  import { boolean } from '$lib/util';

  export let fields;
  export let values = {};
  export let style = null;
  // let className = null;
  // export { className as class };
</script>

<div
  {style}
  class="record"
>
  {#each fields as field (field.name)}
    <div>
      <span class="label">{field.label}:</span>
      <span class="value">
        {#if field.type === 'checkbox'}
          {boolean(values[field.name])}
        {:else}
          {values[field.name] ?? ""}
        {/if}
      </span>
    </div>
  {/each}
</div>

<style lang="scss">
  .record {
    border: 1px solid gray;
    padding: 10px;
    width: var(--recordwidth, 18em);

    display: flex;
    flex-direction: column;

    > div {
      display: grid;
      grid-template-columns: var(--gridtemplate, 43% 57%);
      align-items: center;
      margin-block: 6px;

      .label {
        margin-inline-end: 10px;
        text-align: end;
      }

      .value {
        margin: 0;
      }
    }
  }
</style>