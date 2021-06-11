<script context="module">
  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch(`/api/entry/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.entry = await res.json();
    return { props };
  }
</script>

<script>
  import GlossesDefinitions from './_GlossesDefinitions.svelte';

  export let entry;
</script>

<h2>Entry from {entry.source_reference}</h2>

<h3>{entry.headword}</h3>

{#if entry.senses.length > 1}
  {#each entry.senses as sense, i}
    <h4>Sense {i + 1}</h4>
    <GlossesDefinitions {sense} />
  {/each}
{:else if entry.senses.length === 1}
  <GlossesDefinitions sense={entry.senses[0]} />
{/if}

<style>
  h4 {
    margin-block: 0.75em 0.25em;
  }
</style>