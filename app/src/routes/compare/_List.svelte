<script>
  import Paginator from '$components/Paginator.svelte';
  import { glossesSummary, mungePos } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let lang2;
  export let name;
  export let pageCount;
  export let rowCount;
  export let query;
  export let rows;
</script>

<h3>{name}</h3>
<div class="info">
  Total entries: {rowCount}
</div>
<hr>
{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}
{#each $rows as row (row.id)}
  <div>
    <strong>{row.headword}</strong>
    {#each row.senses as { pos, glosses }, i}
      {#if glosses.length}
        <p>
          {i + 1}. {#if pos}<em>{mungePos(pos)}</em>. {/if}{glossesSummary(glosses, $preferences)}
        </p>
      {/if}
    {/each}
  </div>
  {#if row.compare_entries}
    <div>
      <br>
      {lang2.name} comparisons:
    </div>
    {#each row.compare_entries as { headword, senses } }
      <div>
        <br>
        <strong>{headword}</strong>
        {#each senses as { pos, glosses }, i}
          {#if glosses.length}
            <p>
              {i + 1}. {#if pos}<em>{mungePos(pos)}</em>. {/if}{glossesSummary(glosses, $preferences)}
            </p>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
  <hr>
{/each}

<style lang="scss">
  .info {
    margin-block: $item_sep;
  }

  @include hr;
</style>