<script context="module">
  export const ssr = false;
</script>

<script>
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  const preferences = getContext('preferences');
  goto('/' + $preferences.view);
</script>