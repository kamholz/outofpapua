<script>
  import Icon from 'svelte-awesome';
  import SetPopover from '$components/SetPopover.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

{#if row.sets}
  {#each row.sets as set_id}
    <SetPopover id={set_id}>
      <Icon data={faBezierCurve} {scale} label="Set" />
    </SetPopover>
  {/each}
{/if}
