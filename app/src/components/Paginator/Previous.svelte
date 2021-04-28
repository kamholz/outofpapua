<script>
  import Icon from 'svelte-awesome';
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

  export let url;
</script>

{#if url}
  <a class="arrow" href={url}><Icon data={faCaretLeft} /></a>
{:else}
  <span class="arrow"><Icon data={faCaretLeft} /></span>
{/if}
