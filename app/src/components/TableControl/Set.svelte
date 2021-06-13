<script>
  import Icon from 'svelte-awesome';
  import SetPopover from '$components/SetPopover.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  export let row;
  export let scale;
</script>

{#if row.set_id}
  <SetPopover
    href="/sets/{row.set_id}"
    id={row.set_id}
  >
    <Icon data={faBezierCurve} {scale} label="Set" />
  </SetPopover>
{:else}
  <a href>
    <Icon data={faBezierCurve} {scale} class="hidden" />
  </a>
{/if}
