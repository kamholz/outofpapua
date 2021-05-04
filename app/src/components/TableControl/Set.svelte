<script>
  import Icon from 'svelte-awesome';
  import SetSummary from '$components/SetSummary.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
  $: setId = control.getSetId(row);
</script>

{#if setId}
  <SetSummary
    href={control.link(row)}
    {setId}
  >
    <Icon data={faBezierCurve} {scale} label="Set" />
  </SetSummary>
{:else}
  <a href>
    <Icon data={faBezierCurve} {scale} class="hidden" />
  </a>
{/if}
