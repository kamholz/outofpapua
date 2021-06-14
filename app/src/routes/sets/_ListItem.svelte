<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  //import OriginSummary from '$components/OriginSummary.svelte';
  import Reflex from '$components/Reflex.svelte';
  import { entryUrl, glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';
  import { slide } from 'svelte/transition';

  export let set;
  export let collapsed;
</script>

<Collapsible {collapsed}>
  <div class="header">
    <CollapsibleIndicator />
    <strong>Set: <a href="/sets/{set.id}">{set.title ?? set.id}</a></strong>
  </div>
  {#if !$collapsed}
    <div class="table" transition:slide={{ duration: 200 }}>
      {#each set.members as { entry, reflex, source } (entry.id)}
        <div class:borrowed={entry.origin === 'borrowed'} class:inherited={entry.origin === 'inherited'}>
          <strong>{source.language_name}</strong> <a href={entryUrl(entry)}><Reflex form={reflex ?? entry.headword} /></a>
        </div>
        <div>
          {source.reference}
        </div>
        <div>
          {#if entry.senses[0]?.glosses?.[0]}{glossesSummary(entry.senses[0].glosses, $preferences)}{/if}
        </div>
      {/each}
    </div>
  {/if}
</Collapsible>

<style lang="scss">
  .header {
    display: flex;
  }

  .table {
    margin-block-start: 6px;
    display: grid;
    grid-template-columns: 30% 25% auto;
    column-gap: 14px;
    > div {
      line-height: 1.5;
      @include indent;
    }
  }
</style>