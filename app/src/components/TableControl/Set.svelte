<script>
  import Icon from 'svelte-awesome';
  import SetSummary from '$components/SetSummary.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  export let row;
  export let scale;
</script>

{#if row.set_id}
  <SetSummary
    href="/sets/{row.set_id}"
    id={row.set_id}
  >
    <Icon data={faBezierCurve} {scale} label="Set" />
  </SetSummary>
{:else}
  <a href>
    <Icon data={faBezierCurve} {scale} class="hidden" />
  </a>
{/if}
