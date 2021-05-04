<script>
  import Icon from 'svelte-awesome';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

{#if control.hasSet(row)}
  <a href={control.link(row)} sveltekit:prefetch>
    <Icon data={faBezierCurve} {scale} class={control.hasSet(row)} label="Set" />
  </a>
{:else}
  <a href>
    <Icon data={faBezierCurve} {scale} class="hidden" />
  </a>
{/if}
