<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import Reflex from '$components/Reflex.svelte';
  import { entryUrl, glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';
  import { slide } from 'svelte/transition';

  export let set;
  export let collapsed;
  console.log(collapsed);
</script>

<Collapsible {collapsed}>
  <div class="header">
    <CollapsibleIndicator />
    <strong>Set: <a href="/sets/{set.id}">{set.title ?? set.id}</a></strong>  
  </div>
  {#if !$collapsed}
    <ul transition:slide={{ duration: 200 }}>
      {#each set.members as { entry, reflex, source } (entry.id)}
        <li>
          <strong>{source.language_name}</strong> <a href={entryUrl(entry)}><Reflex form={reflex ?? entry.headword} /></a> {#if entry.senses[0]?.glosses?.[0]}<span>{glossesSummary(entry.senses[0].glosses, $preferences)}</span>{/if}
        </li>
      {/each}
    </ul>
  {/if}
</Collapsible>

<style lang="scss">
  .header {
    display: flex;
  }

  ul {
    padding-left: 1em;
    li {
      margin-block: 2px;
    }
  }
</style>