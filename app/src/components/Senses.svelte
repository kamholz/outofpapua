<script>
  import Glosses from '$components/Glosses.svelte';
  import { mungePos } from '$lib/util';

  export let senses;
  export let multiGlosslang = true;
  const multiSense = senses.length > 1;
</script>

{#each senses as { pos, glosses }, i}
  {#if glosses.length}
    <p>
      {#if multiSense}{i + 1}. {/if}{#if pos}<em>{mungePos(pos)}</em>. {/if}<Glosses {glosses} single={!multiGlosslang} />
    </p>
  {/if}
{/each}

<style lang="scss">
  p {
    @include indent;
  }
</style>