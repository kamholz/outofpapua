<script>
  import Icon from 'svelte-awesome';
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

  export let url;
</script>

<li><a href={url}><Icon data={faCaretLeft} /></a></li>