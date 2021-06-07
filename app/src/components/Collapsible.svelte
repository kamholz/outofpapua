<script>
  import { setContext } from 'svelte';

  export let collapsed;

  function toggle() {
    $collapsed = !$collapsed;
  }

  setContext('props', { collapsed, toggle });
</script>

{#if $collapsed}
  <slot name="collapsed" />
{:else}
  <slot name="expanded" />
{/if}