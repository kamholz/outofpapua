<script>
  export let set;

  import Reflex from '$components/Reflex.svelte';
  import { entryUrl, glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';
</script>

<h3>Set: <a href="/sets/{set.id}">{set.title ?? set.id}</a></h3>
<ul>
  {#each set.members as { entry, reflex, source } (entry.id)}
    <li>
      <strong>{source.language_name}</strong> <a href={entryUrl(entry)}><Reflex form={reflex ?? entry.headword} /></a> {#if entry.senses[0]?.glosses?.[0]}<span>{glossesSummary(entry.senses[0].glosses, $preferences)}</span>{/if}
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    padding-left: 1em;
    li {
      margin-block: 2px;
    }
  }
</style>