<script>
  import { getContext } from 'svelte';

  let className = null;
  export { className as class };
  const compact = getContext('compact');
</script>

{#if compact}
  <slot />
{:else}
  <div class={className}>
    <slot />
  </div>
{/if}