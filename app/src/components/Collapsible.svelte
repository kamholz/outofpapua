<script>
  import { setContext } from 'svelte';

  export let collapsed;
  export let toggle = () => {
    $collapsed = !$collapsed;
  };

  setContext('props', { collapsed, toggle });
</script>

{#if $collapsed}
  <slot name="collapsed" />
{:else}
  <slot name="expanded" />
{/if}