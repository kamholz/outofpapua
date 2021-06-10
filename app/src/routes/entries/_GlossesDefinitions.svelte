<script>
  import { glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let sense;
  const { definitions, glosses } = sense;
</script>

{#if glosses.length}
  <div>
    Glosses: {glossesSummary(glosses, $preferences)}
  </div>
{/if}
{#if definitions.length}
  <div>
    Definitions: {glossesSummary(definitions, $preferences)}
  </div>
{/if}

<style>
  div {
    padding-left: 2em;
    text-indent: -1em;
  }
</style>