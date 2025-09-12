<script>
  import { getContext } from 'svelte';

  
  /**
   * @typedef {Object} Props
   * @property {any} [class]
   * @property {boolean} [period]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { class: className = null, period = false, children } = $props();
  const compact = getContext('compact');
</script>

{#if compact}
  {@render children?.()}{#if period}.{/if}
{:else}
  <p class={className}>
    {@render children?.()}
  </p>
{/if}
