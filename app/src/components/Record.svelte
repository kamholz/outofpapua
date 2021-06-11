<script>
  import { boolean, stringify } from '$lib/util';

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
  {#each fields as { label, name, type } (name)}
    <div>
      <span class="label">{label}:</span>
      <span class="value">
        {#if type === 'checkbox'}
          {boolean(values[name])}
        {:else}
          {stringify(values[name])}
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
      padding-block: 6px;

      .label {
        margin-inline-end: 12px;
        text-align: end;
      }

      &:nth-child(even) {
        background-color: $lighter_gray;
      }
    }
  }
</style>