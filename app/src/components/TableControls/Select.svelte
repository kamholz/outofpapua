<script>
  import Icon from 'svelte-awesome';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;

  const selection = getContext('selection');
  $: data = $selection[row.id] ? faLink : faUnlink;
</script>

<span on:click={() => dispatch('click')}>
  <Icon {data} {scale} label="Select" />
</span>