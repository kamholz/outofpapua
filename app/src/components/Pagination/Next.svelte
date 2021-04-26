<script>
  import Icon from 'svelte-awesome';
  import { faCaretRight } from '@fortawesome/free-solid-svg-icons';   

  export let url;
</script>

<li><a href={url}><Icon data={faCaretRight} /></a></li>