<script>
  import Glosses from './_Glosses.svelte';

  export let member;
  export let editable;
  const { entry, source } = member;
  const { senses } = entry;
</script>

<div>
  <h3>{source.language_name} <em>{entry.headword}</em></h3>
  {#if entry.pos}
    <p>Part of speech: {entry.pos}</p>
  {/if}
  {#if senses.length === 1}
    <p>Glosses: <Glosses sense={senses[0]} /></p>
  {:else}
    {#each entry.senses as sense, i (sense.id)}
      <p>Sense {i+1}: <Glosses {sense} /></p>
    {/each}
  {/if}
  {#if member.inherited}
    <p>Inherited</p>
  {/if}
  {#if member.borrowed}
    <p>Borrowed</p>
  {/if}
  {#if member.note}
    <p>Notes: {member.note}</p>
  {/if}
</div>

<style lang="scss">
  div {
    p {
      margin-block: 0.5em;
    }
  }
</style>
