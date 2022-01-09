<script>
  import { getContext } from 'svelte';

  let className = null;
  export { className as class };
  export let period = false;
  const compact = getContext('compact');
</script>

{#if compact}
  <slot />{#if period}.{/if}
{:else}
  <p class={className}>
    <slot />
  </p>
{/if}