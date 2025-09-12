<script>
  import Icon from 'svelte-awesome';
  import SetPopover from '$components/SetPopover.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  let { control, row, scale } = $props();
</script>

{#if row.set_ids}
  {#each row.set_ids as id}
    <SetPopover {id}>
      <Icon data={faBezierCurve} {scale} label="Set" />
    </SetPopover>
  {/each}
{/if}
