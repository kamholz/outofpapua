<script>
  import { glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let rows;
  export let langName1;
  export let langName2;

  function mungePos(pos) {
    return pos.replace(/\.$/, '');
  }
</script>

<h3>{langName1}</h3>
<hr>
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
  {#if row.entries2}
    <div>
      <br>
      {langName2} comparisons:
    </div>
    {#each row.entries2 as { headword, senses } }
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
  @include hr;
</style>