<script>
  import Icon from 'svelte-awesome';
  import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';

  export let scale = 1.5;
  const { collapsed, toggle } = getContext('props');
</script>

{#if $collapsed}
  <div class="indicator-collapsed" on:click={toggle}>
    <Icon data={faCaretRight} {scale} />
  </div>
{:else}
  <div class="indicator" on:click={toggle}>
    <Icon data={faCaretDown} {scale} />
  </div>
{/if}

<style>
  .indicator, .indicator-collapsed {
    inline-size: 2em;
  }

  .indicator :global(.fa-icon) {
    vertical-align: top;
    margin: 0;
    position: relative;
    top: -0.24em;
  }
</style>