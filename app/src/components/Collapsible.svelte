<script>
  import { setContext } from 'svelte';

  export let collapsed;
  export let toggle = () => {
    $collapsed = !$collapsed;
  };

  setContext('collapsible', { collapsed, toggle });
</script>

<slot />