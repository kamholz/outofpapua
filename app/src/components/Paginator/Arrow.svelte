<script>
  import Icon from 'svelte-awesome';
  import { faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';

  export let url;
  export let dir;
  const icon = dir === 'previous' ? faCaretLeft : faCaretRight;
</script>

{#if url}
  <a class="arrow" href={url}><Icon data={icon} /></a>
{:else}
  <span class="arrow"><Icon data={icon} /></span>
{/if}

<style>
  .arrow {
    inline-size: 24px;
    block-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>