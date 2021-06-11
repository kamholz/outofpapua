<script>
  export let set;

  import Reflex from '$components/Reflex.svelte';
  import { glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';
</script>

<h3>Set: <a href="/sets/{set.id}">{set.title ?? set.id}</a></h3>
<ul>
  {#each set.members as { entry, reflex, source } (entry.id)}
    <li>
      <strong>{source.language_name}</strong> <Reflex form={reflex ?? entry.headword} /> {#if entry.senses[0]?.glosses?.[0]}<span>{glossesSummary(entry.senses[0].glosses, $preferences)}</span>{/if}
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    list-style: none;
    padding-left: 1em;

    li {
      margin-block: 2px;
    }
  }
</style>