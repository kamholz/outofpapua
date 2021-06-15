<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import Senses from '$components/Senses.svelte';
  import { slide } from 'svelte/transition';

  export let row;
  export let lang2;
  export let collapsed;
  export let multilang;
  const { headword, senses } = row;
</script>

<div class="entry">
  <strong>{headword}</strong>
  <div>
    <Senses {senses} {multilang} />
  </div>
</div>
{#if row.compare_entries}
  <Collapsible {collapsed}>
    <div class="header">
      <CollapsibleIndicator />
      {lang2.name} comparisons
    </div>
    {#if !$collapsed}
      <ul transition:slide={{ duration: 200 }}>
        {#each row.compare_entries as { headword, senses } }
          <li>
            <strong>{headword}</strong>
            <div>
              <Senses {senses} {multilang} />
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </Collapsible>
{/if}

<style lang="scss">
  .entry {
    display: flex;
    > div {
      margin-inline-start: 12px;
    }
  }

  .header {
    display: flex;
    margin-block: 12px 6px;
  }

  ul {
    margin-inline-start: 1em;
    li {
      display: flex;
      margin-block-start: 2px;
      > div {
        margin-inline-start: 12px;
      }
    }
  }
</style>