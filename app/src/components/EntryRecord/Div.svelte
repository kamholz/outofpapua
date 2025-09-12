<script>
  import { getContext } from 'svelte';

  /**
   * @typedef {Object} Props
   * @property {any} [class]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { class: className = null, children } = $props();
  
  const compact = getContext('compact');
</script>

{#if compact}
  {@render children?.()}
{:else}
  <div class={className}>
    {@render children?.()}
  </div>
{/if}
