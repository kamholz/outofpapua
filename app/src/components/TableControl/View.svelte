<script>
  import Icon from 'svelte-awesome';
  import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';

  let { control, row, scale } = $props();
</script>

<a href={control.link(row)} title="View">
  <Icon data={faExternalLinkSquareAlt} {scale} />
</a>
