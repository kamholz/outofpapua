<script>
  import Icon from 'svelte-awesome';
  import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

<a href={control.link(row)} title="View">
  <Icon data={faExternalLinkSquareAlt} {scale} />
</a>
