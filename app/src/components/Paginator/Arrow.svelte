<script>
  import Icon from 'svelte-awesome';
  import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

  export let url;
  export let dir;
  const icon = dir === 'previous' ? faCaretLeft : faCaretRight;
</script>

{#if url}
  <a href={url} data-sveltekit-preload-data="off"><Icon data={icon} /></a>
{:else}
  <span><Icon data={icon} /></span>
{/if}

<style lang="scss">
  a, span {
    inline-size: 24px;
    block-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>